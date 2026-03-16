-- FIX FOR ABANDONED CARS UPSERT
-- Run this in your Supabase SQL Editor

-- 1. Ensure the table has the required unique constraint for upsert
-- Note: 'ON CONFLICT' in Postgrest requires a UNIQUE constraint or index.
ALTER TABLE public.abandoned_carts 
DROP CONSTRAINT IF EXISTS abandoned_carts_email_phone_unique;

ALTER TABLE public.abandoned_carts 
ADD CONSTRAINT abandoned_carts_email_phone_unique UNIQUE (customer_email, customer_phone);

-- 2. Update RLS policies to ensure 'anon' and 'authenticated' can upsert
-- We reset them to be sure
DROP POLICY IF EXISTS "Enable insert for all" ON public.abandoned_carts;
DROP POLICY IF EXISTS "Enable update for all" ON public.abandoned_carts;

CREATE POLICY "Enable insert for everyone" ON public.abandoned_carts
FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for everyone" ON public.abandoned_carts
FOR UPDATE USING (true) WITH CHECK (true);

-- 3. Verify the columns exist (should already exist based on previous schema)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='abandoned_carts' AND column_name='customer_email') THEN
        ALTER TABLE public.abandoned_carts ADD COLUMN customer_email TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='abandoned_carts' AND column_name='customer_phone') THEN
        ALTER TABLE public.abandoned_carts ADD COLUMN customer_phone TEXT;
    END IF;
END $$;
