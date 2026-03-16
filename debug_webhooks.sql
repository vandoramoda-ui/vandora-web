-- DIAGNOSTIC SQL TO CHECK WEBHOOK STATUS
-- Run this in your Supabase SQL Editor

-- 1. Check if pg_net extension is enabled
SELECT * FROM pg_extension WHERE extname = 'pg_net';

-- 2. Check if triggers exist and are enabled
SELECT 
    tgname as trigger_name,
    tgenabled as status -- 'O' = enabled, 'D' = disabled
FROM pg_trigger
WHERE tgname IN ('tr_order_event', 'tr_abandoned_cart_event', 'tr_registration_event', 'tr_newsletter_event');

-- 3. Check the internal pg_net request queue (shows if calls were attempted)
SELECT * FROM net.http_request_queue LIMIT 10;

-- 4. Check the results of the calls
-- This shows the response from your webhook server
-- We try to select from the internal response table if it exists
SELECT * FROM net._http_response LIMIT 10;

-- 5. Test the webhook manually with a small snippet
-- This will tell us if the permission/function itself works
DO $$ 
BEGIN
  PERFORM net.http_post(
    url := 'https://devwebhook.intelladsautomation.com/webhook/vandora-pedidos',
    body := '{"test": "manual_trigger"}'::jsonb
  );
END $$;
