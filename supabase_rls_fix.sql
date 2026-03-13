-- SQL to fix RLS error for orders table
-- Run this in your Supabase SQL Editor

-- 1. Ensure RLS is enabled
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies if they are too restrictive
DROP POLICY IF EXISTS "Enable insert for all" ON public.orders;
DROP POLICY IF EXISTS "Enable select for own orders" ON public.orders;

-- 3. Create a policy to allow anyone (guest or logged-in) to create an order
-- This is critical for the checkout flow to work for guest users
CREATE POLICY "Enable insert for everyone" ON public.orders 
FOR INSERT WITH CHECK (true);

-- 4. Create a policy for users to see their own orders based on user_id or email
-- Note: Viewing by email is useful for guest lookup after order creation
CREATE POLICY "Enable select for users based on email or id" ON public.orders
FOR SELECT USING (
  auth.uid() = user_id OR 
  (auth.jwt()->>'email' = customer_email)
);

-- 5. Similar policy for abandoned_carts if not already open enough
CREATE POLICY "Enable delete for owner" ON public.abandoned_carts
FOR DELETE USING (
  customer_email = (auth.jwt()->>'email') OR
  customer_phone IS NOT NULL -- Allow delete during checkout success based on logic
);
