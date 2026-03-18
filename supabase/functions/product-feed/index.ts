// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Fetch products with full metadata
    const { data: products, error } = await supabaseClient
      .from('products')
      .select('*')
      .gt('stock', 0)

    if (error) throw error

    // 2. Generate XML (Google/Meta RSS 2.0 format)
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Vandora Moda - Catálogo Completo</title>
    <link>https://vandora.ec</link>
    <description>Moda ecuatoriana premium. Catálogo optimizado para Google Shopping y Meta Ads.</description>
    <language>es</language>`

    const baseUrl = "https://vandora.ec"

    products.forEach((p) => {
      // Multimedia handling
      let mainImage = p.image || '';
      const additionalImages: string[] = [];
      
      if (Array.isArray(p.images) && p.images.length > 0) {
        p.images.forEach((img: any, idx: number) => {
          const url = typeof img === 'string' ? img : (img.url || '');
          if (url) {
            if (idx === 0 && !mainImage) mainImage = url;
            else if (url !== mainImage) additionalImages.push(url);
          }
        });
      }

      // Metadata derivation
      const category = p.category?.toLowerCase() || 'moda';
      const gender = category.includes('hombre') ? 'male' : (category.includes('mujer') || category.includes('dama') ? 'female' : 'unisex');
      const productLink = `${baseUrl}/producto/${category.replace(/\s+/g, '-')}/${p.slug || p.id}`;
      
      // Price handling
      const priceVal = p.price || 0;
      const salePriceVal = p.sale_price || null;

      xml += `
    <item>
      <g:id><![CDATA[${p.id}]]></g:id>
      <g:offer_id><![CDATA[${p.id}]]></g:offer_id>
      <g:title><![CDATA[${p.name}]]></g:title>
      <g:description><![CDATA[${(p.description || p.name).substring(0, 5000)}]]></g:description>
      <g:link>${productLink}</g:link>
      <g:image_link><![CDATA[${mainImage}]]></g:image_link>
      ${additionalImages.slice(0, 10).map(url => `<g:additional_image_link><![CDATA[${url}]]></g:additional_image_link>`).join('')}
      
      <g:availability>${p.stock > 0 ? 'in stock' : 'out of stock'}</g:availability>
      <g:price>${priceVal.toFixed(2)} USD</g:price>
      ${salePriceVal ? `<g:sale_price>${salePriceVal.toFixed(2)} USD</g:sale_price>` : ''}
      
      <g:brand><![CDATA[${p.brand || 'Vandora'}]]></g:brand>
      <g:condition>${p.condition || 'new'}</g:condition>
      <g:gender>${p.gender || gender}</g:gender>
      <g:age_group>${p.age_group || 'adult'}</g:age_group>
      
      <g:google_product_category><![CDATA[${p.google_product_category || 'Apparel & Accessories > Clothing'}]]></g:google_product_category>
      <g:product_type><![CDATA[${p.category}]]></g:product_type>
      
      ${p.sku ? `<g:sku><![CDATA[${p.sku}]]></g:sku>` : ''}
      ${p.gtin ? `<g:gtin><![CDATA[${p.gtin}]]></g:gtin>` : ''}
      ${p.mpn ? `<g:mpn><![CDATA[${p.mpn}]]></g:mpn>` : ''}
      
      ${p.colors && Array.isArray(p.colors) && p.colors.length > 0 ? `<g:color><![CDATA[${p.colors.map((c: any) => typeof c === 'string' ? c : c.name).join('/')}]]></g:color>` : ''}
      ${p.sizes && Array.isArray(p.sizes) && p.sizes.length > 0 ? `<g:size><![CDATA[${p.sizes.join('/')}]]></g:size>` : ''}
      <g:size_system>US</g:size_system>
      <g:size_type>regular</g:size_type>
      
      <g:identifier_exists>${(p.gtin || p.mpn) ? 'yes' : 'no'}</g:identifier_exists>
      <g:shipping>
        <g:country>EC</g:country>
        <g:service>Estándar</g:service>
        <g:price>0.00 USD</g:price>
      </g:shipping>
    </item>`
    })

    xml += `
  </channel>
</rss>`

    return new Response(xml, {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/xml; charset=utf-8' 
      },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
