-- SQL to create the abandoned_carts table in Supabase
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.abandoned_carts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_email TEXT,
    customer_phone TEXT,
    cart_items JSONB NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'recovered', 'converted'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Index for faster lookup by email or phone
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_email ON public.abandoned_carts(customer_email);
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_phone ON public.abandoned_carts(customer_phone);

-- RLS Policies (Enable for Service Role or Admin if needed)
ALTER TABLE public.abandoned_carts ENABLE ROW LEVEL SECURITY;

-- Allow anonymous upsert based on email/phone if you want client-side tracking
-- WARNING: In a production app, you might want more restrictive policies
CREATE POLICY "Enable insert for all" ON public.abandoned_carts FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all" ON public.abandoned_carts FOR UPDATE USING (true);
CREATE POLICY "Enable select for service role" ON public.abandoned_carts FOR SELECT TO service_role USING (true);
