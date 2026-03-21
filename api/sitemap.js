import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).send('Missing Supabase environment variables');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // 1. Fetch products and categories
    const { data: products } = await supabase
      .from('products')
      .select('slug, category, updated_at')
      .order('updated_at', { ascending: false });

    const { data: categories } = await supabase
      .from('product_categories')
      .select('name');

    // 2. Base configuration
    const baseUrl = "https://www.vandora.boutique";
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
    <loc>${baseUrl}/politica-de-reembolso</loc>
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

    res.setHeader('Content-Type', 'application/xml');
    return res.status(200).send(xml);
  } catch (error) {
    console.error('Sitemap error:', error);
    return res.status(500).send('Error generating sitemap');
  }
}
