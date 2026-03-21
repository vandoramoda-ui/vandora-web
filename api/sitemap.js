import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).send('Missing Supabase environment variables');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const baseUrl = "https://www.vandora.boutique";
    const currentDate = new Date().toISOString().split('T')[0];

    // Fetch products
    const { data: products } = await supabase
      .from('products')
      .select('slug, id, category, updated_at')
      .order('updated_at', { ascending: false });

    // Fetch categories
    const { data: categories } = await supabase
      .from('product_categories')
      .select('name');

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
    <priority>0.9</priority>
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
    <loc>${baseUrl}/politica-de-privacidad</loc>
    <lastmod>${currentDate}</lastmod>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${baseUrl}/terminos-y-condiciones</loc>
    <lastmod>${currentDate}</lastmod>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${baseUrl}/contacto</loc>
    <lastmod>${currentDate}</lastmod>
    <priority>0.5</priority>
  </url>`;

    // Add Categories (Clean URLs)
    if (categories) {
      categories.forEach(cat => {
        const slug = cat.name.toLowerCase().replace(/\s+/g, '-');
        xml += `
  <url>
    <loc>${baseUrl}/tienda/${slug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
      });
    }

    // Add Products
    if (products) {
      // Use a Set to track processed slugs to avoid duplicates
      const processedSlugs = new Set();
      
      products.forEach(p => {
        const slug = p.slug || p.id;
        if (processedSlugs.has(slug)) return;
        processedSlugs.add(slug);

        const catSlug = (p.category || 'general').toLowerCase().replace(/\s+/g, '-');
        const lastMod = p.updated_at ? new Date(p.updated_at).toISOString().split('T')[0] : currentDate;
        
        xml += `
  <url>
    <loc>${baseUrl}/producto/${catSlug}/${slug}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
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
