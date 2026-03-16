-- FIX FOR WEBHOOK NOTIFICATIONS
-- Run this in your Supabase SQL Editor to add required JSON headers

-- 1. Updated Function for Orders (New, Update, Abandoned)
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
      RETURN NEW;
    END IF;
  END IF;

  payload := jsonb_build_object(
    'event', event_label,
    'data', row_to_json(NEW)
  );

  PERFORM net.http_post(
    url := webhook_url,
    body := payload,
    headers := '{"Content-Type": "application/json"}'::jsonb
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Updated Function for Registrations
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
    body := payload,
    headers := '{"Content-Type": "application/json"}'::jsonb
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Updated Function for Newsletter
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
    body := payload,
    headers := '{"Content-Type": "application/json"}'::jsonb
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-test script (optional)
-- SELECT net.http_post('https://devwebhook.intelladsautomation.com/webhook/vandora-pedidos', '{"test": "header_fix"}'::jsonb, '{"Content-Type": "application/json"}'::jsonb);
