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

    // 1. Fetch products and categories
    const { data: products } = await supabaseClient
      .from('products')
      .select('slug, category, updated_at')
      .order('updated_at', { ascending: false });

    const { data: categories } = await supabaseClient
      .from('product_categories')
      .select('name');

    // 2. Base configuration
    const baseUrl = "https://www.vandora.boutique"; // Corrected domain
    const currentDate = new Date().toISOString().split('T')[0];

    // 3. Generate XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Static Pages -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/tienda</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/nuestra-historia</loc>
    <lastmod>${currentDate}</lastmod>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${baseUrl}/contacto</loc>
    <lastmod>${currentDate}</lastmod>
    <priority>0.5</priority>
  </url>`;

    // 4. Add Categories
    if (categories) {
      categories.forEach(cat => {
        xml += `
  <url>
    <loc>${baseUrl}/tienda?category=${encodeURIComponent(cat.name)}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
      });
    }

    // 5. Add Products
    if (products) {
      products.forEach(p => {
        const catSlug = (p.category || 'general').toLowerCase().replace(/\s+/g, '-');
        const prodSlug = p.slug || 'item';
        const lastMod = p.updated_at ? new Date(p.updated_at).toISOString().split('T')[0] : currentDate;
        
        xml += `
  <url>
    <loc>${baseUrl}/producto/${catSlug}/${prodSlug}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
      });
    }

    xml += `
</urlset>`;

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
