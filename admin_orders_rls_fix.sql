-- FIX: Allow Admins to see all orders
-- Run this in your Supabase SQL Editor

-- 1. Create a policy to allow admins and superadmins to view all orders
CREATE POLICY "Enable select for admins and superadmins" ON public.orders
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND (
      profiles.role = 'superadmin' OR 
      profiles.role = 'admin' OR 
      profiles.role = 'support'
    )
  )
);

-- 2. Also allow admins to update orders (needed for status changes)
CREATE POLICY "Enable update for admins and superadmins" ON public.orders
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND (
      profiles.role = 'superadmin' OR 
      profiles.role = 'admin' OR 
      profiles.role = 'support'
    )
  )
);

-- Note: If you get an error saying "policy already exists", 
-- you might need to run: DROP POLICY IF EXISTS "Enable select for admins and superadmins" ON public.orders;
