// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function sha256(message: string) {
  const msgUint8 = new TextEncoder().encode(message.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  let requestBody: any = {};
  
  try {
    requestBody = await req.json();
    const { eventName, eventId, params, url, userData } = requestBody;

    // 1. Fetch Meta settings
    const { data: settings } = await supabaseClient
      .from('app_settings')
      .select('key, value')
      .in('key', ['meta_pixel_id', 'meta_capi_token', 'meta_test_event_code'])

    const pixelId = settings?.find(s => s.key === 'meta_pixel_id')?.value
    const accessToken = settings?.find(s => s.key === 'meta_capi_token')?.value
    const testEventCode = settings?.find(s => s.key === 'meta_test_event_code')?.value

    if (!pixelId || !accessToken) {
      throw new Error('Meta configuration missing (pixel_id or access_token)');
    }

    // 2. Hash User Data (em, ph)
    const hashedUserData: any = {
      client_ip_address: req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for')?.split(',')[0].trim(),
      client_user_agent: req.headers.get('user-agent'),
      fbc: userData?.fbc || null,
      fbp: userData?.fbp || null,
    };

    if (userData?.email) hashedUserData.em = await sha256(userData.email);
    if (userData?.phone) hashedUserData.ph = await sha256(userData.phone);

    // Filter nulls
    Object.keys(hashedUserData).forEach(key => hashedUserData[key] === null && delete hashedUserData[key]);

    // 3. Prepare Meta CAPI payload
    const payload = {
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          action_source: "website",
          event_id: eventId,
          event_source_url: url,
          user_data: hashedUserData,
          custom_data: params,
        },
      ],
      ...(testEventCode ? { test_event_code: testEventCode } : {})
    }

    // 4. Send to Meta
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    )

    const result = await response.json()

    if (result.error) {
       // Log error to analytics_logs table
       await supabaseClient.from('analytics_logs').insert({
         event_name: eventName,
         error_message: result.error.message || 'Meta API Error',
         status_code: response.status,
         payload_snapshot: payload
       });
       return new Response(JSON.stringify(result), {
         headers: { ...corsHeaders, 'Content-Type': 'application/json' },
         status: 200, // We return 200 even if Meta fails to avoid frontend noise, but we logged it
       })
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    // Log unexpected errors
    try {
      await supabaseClient.from('analytics_logs').insert({
        event_name: requestBody?.eventName || 'Unknown',
        error_message: error.message,
        status_code: 500,
        payload_snapshot: requestBody
      });
    } catch (logError) {
      console.error('Failed to log error to DB:', logError);
    }

    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
