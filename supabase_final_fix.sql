-- DEFUNCTIVE FIX FOR ORDERS RLS AND WEBHOOKS IMPLEMENTATION
-- Run this in your Supabase SQL Editor

-- 1. FIX ORDERS RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable insert for all" ON public.orders;
DROP POLICY IF EXISTS "Enable insert for everyone" ON public.orders;
DROP POLICY IF EXISTS "Enable select for own orders" ON public.orders;
DROP POLICY IF EXISTS "Enable select for users based on email or id" ON public.orders;

-- Absolute permission for insertion (any source)
CREATE POLICY "Enable insert for everyone" ON public.orders 
FOR INSERT WITH CHECK (true);

-- Visibility based on email or ID
CREATE POLICY "Enable select for users based on email or id" ON public.orders
FOR SELECT USING (
  auth.uid() = user_id OR 
  (customer_email IS NOT NULL AND auth.jwt()->>'email' = customer_email)
);


-- 2. ENABLE HTTP EXTENSION (for webhooks)
CREATE EXTENSION IF NOT EXISTS "pg_net";


-- 3. WEBHOOK FUNCTIONS

-- Function for Orders (New, Update, Abandoned)
CREATE OR REPLACE FUNCTION notify_order_event()
RETURNS TRIGGER AS $$
DECLARE
  webhook_url TEXT := 'https://devwebhook.intelladsautomation.com/webhook/vandora-pedidos';
  payload JSONB;
  event_label TEXT;
BEGIN
  IF (TG_OP = 'INSERT') THEN
    IF (TG_TABLE_NAME = 'orders') THEN
      event_label := 'new_order';
    ELSIF (TG_TABLE_NAME = 'abandoned_carts') THEN
      event_label := 'abandoned_cart';
    END IF;
  ELSIF (TG_OP = 'UPDATE' AND TG_TABLE_NAME = 'orders') THEN
    IF (OLD.status IS DISTINCT FROM NEW.status) THEN
      event_label := 'order_status_updated';
    ELSE
      RETURN NEW; -- Don't notify if status hasn't changed
    END IF;
  END IF;

  payload := jsonb_build_object(
    'event', event_label,
    'data', row_to_json(NEW)
  );

  PERFORM net.http_post(
    url := webhook_url,
    body := payload
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function for Registrations
CREATE OR REPLACE FUNCTION notify_registration_event()
RETURNS TRIGGER AS $$
DECLARE
  webhook_url TEXT := 'https://devwebhook.intelladsautomation.com/webhook/vandora-registros';
  payload JSONB;
BEGIN
  payload := jsonb_build_object(
    'event', 'new_registration',
    'data', row_to_json(NEW)
  );

  PERFORM net.http_post(
    url := webhook_url,
    body := payload
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function for Newsletter
CREATE OR REPLACE FUNCTION notify_newsletter_event()
RETURNS TRIGGER AS $$
DECLARE
  webhook_url TEXT := 'https://devwebhook.intelladsautomation.com/webhook/vandora-newsletter';
  payload JSONB;
BEGIN
  payload := jsonb_build_object(
    'event', 'newsletter_signup',
    'data', row_to_json(NEW)
  );

  PERFORM net.http_post(
    url := webhook_url,
    body := payload
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 4. TRIGGERS

-- Orders & Status Trigger
DROP TRIGGER IF EXISTS tr_order_event ON public.orders;
CREATE TRIGGER tr_order_event
AFTER INSERT OR UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION notify_order_event();

-- Abandoned Cart Trigger
DROP TRIGGER IF EXISTS tr_abandoned_cart_event ON public.abandoned_carts;
CREATE TRIGGER tr_abandoned_cart_event
AFTER INSERT ON public.abandoned_carts
FOR EACH ROW EXECUTE FUNCTION notify_order_event();

-- Registrations Trigger (on profiles)
DROP TRIGGER IF EXISTS tr_registration_event ON public.profiles;
CREATE TRIGGER tr_registration_event
AFTER INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION notify_registration_event();

-- Newsletter Trigger
DROP TRIGGER IF EXISTS tr_newsletter_event ON public.newsletter_subscribers;
CREATE TRIGGER tr_newsletter_event
AFTER INSERT ON public.newsletter_subscribers
FOR EACH ROW EXECUTE FUNCTION notify_newsletter_event();
