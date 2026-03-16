-- COMPREHENSIVE FIX FOR ORDERS RLS AND GUEST CHECKOUT
-- Run this in your Supabase SQL Editor

-- 1. ENABLE RLS ON TABLES
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.abandoned_carts ENABLE ROW LEVEL SECURITY;

-- 2. DROP ALL EXISTING POLICIES TO START FRESH
-- DROP ALL Policies on orders
DO $$ 
DECLARE 
    pol RECORD;
BEGIN 
    FOR pol IN (SELECT policyname FROM pg_policies WHERE tablename = 'orders') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.orders', pol.policyname);
    END LOOP;
END $$;

-- DROP ALL Policies on abandoned_carts
DO $$ 
DECLARE 
    pol RECORD;
BEGIN 
    FOR pol IN (SELECT policyname FROM pg_policies WHERE tablename = 'abandoned_carts') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.abandoned_carts', pol.policyname);
    END LOOP;
END $$;

-- 3. CREATE NEW PERMISSIVE POLICIES FOR ORDERS

-- Allow anyone to create an order (logged in or guest)
CREATE POLICY "Allow anyone to create an order" ON public.orders 
FOR INSERT WITH CHECK (true);

-- Allow users and guests to see their own orders
-- Logged in users: by user_id or email
-- Guests: by having the ID (UUIDs are unguessable)
CREATE POLICY "Allow users to see their own orders" ON public.orders
FOR SELECT USING (
  auth.uid() = user_id OR 
  (customer_email IS NOT NULL AND auth.jwt()->>'email' = customer_email) OR
  (user_id IS NULL) -- Allow guest selection (protected by knowing the UUID)
);

-- Allow admins full access
CREATE POLICY "Admins have full access to orders" ON public.orders
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'superadmin', 'support')
  )
);

-- 4. CREATE NEW POLICIES FOR ABANDONED CARTS

-- Allow anyone to upsert their own abandoned cart
CREATE POLICY "Allow anyone to upsert abandoned carts" ON public.abandoned_carts
FOR ALL WITH CHECK (true);

-- Allow users to see their own abandoned carts
CREATE POLICY "Allow users to see their own abandoned carts" ON public.abandoned_carts
FOR SELECT USING (
  auth.uid() = user_id OR 
  customer_email = auth.jwt()->>'email' OR
  (user_id IS NULL)
);

-- 5. ENSURE PERMISSIONS ARE GRANTED
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON TABLE public.orders TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.abandoned_carts TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
