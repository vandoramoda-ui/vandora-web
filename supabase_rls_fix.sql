-- SQL to fix RLS error for orders table
-- Run this in your Supabase SQL Editor

-- 1. Ensure RLS is enabled
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to avoid "already exists" errors
DROP POLICY IF EXISTS "Enable insert for all" ON public.orders;
DROP POLICY IF EXISTS "Enable insert for everyone" ON public.orders;
DROP POLICY IF EXISTS "Enable select for own orders" ON public.orders;
DROP POLICY IF EXISTS "Enable select for users based on email or id" ON public.orders;

-- 3. Create a policy to allow anyone (guest or logged-in) to create an order
CREATE POLICY "Enable insert for everyone" ON public.orders 
FOR INSERT WITH CHECK (true);

-- 4. Create a policy for users to see their own orders based on user_id or email
CREATE POLICY "Enable select for users based on email or id" ON public.orders
FOR SELECT USING (
  auth.uid() = user_id OR 
  (customer_email IS NOT NULL AND auth.jwt()->>'email' = customer_email)
);

-- 5. Similar policy for abandoned_carts
DROP POLICY IF EXISTS "Enable delete for owner" ON public.abandoned_carts;
CREATE POLICY "Enable delete for owner" ON public.abandoned_carts
FOR DELETE USING (
  customer_email = (auth.jwt()->>'email') OR
  customer_phone IS NOT NULL
);
