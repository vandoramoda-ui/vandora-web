import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  schema?: any;
  canonical?: string;
}

const SEO: React.FC<SEOProps> = ({ 
  title, 
  description, 
  image = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop', 
  type = 'website',
  schema,
  canonical
}) => {
  const [branding, setBranding] = React.useState<any>(null);

  useEffect(() => {
    const fetchBranding = async () => {
      const { data } = await supabase
        .from('site_content')
        .select('content')
        .eq('section_key', 'branding')
        .single();
      if (data?.content) {
        setBranding(data.content);
      }
    };
    fetchBranding();
  }, []);

  const location = useLocation();
  const rawUrl = canonical || `${window.location.origin}${location.pathname}`;
  const url = rawUrl.toLowerCase().replace(/\/+$/, '');
  const siteName = branding?.siteName || 'Vandora - Moda Ecuatoriana';
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;
  
  // Clean and truncate description for high-quality snippets (Google ideal: ~155-160 chars)
  const cleanDescription = description
    .replace(/<[^>]*>?/gm, '') // Remove HTML tags
    .replace(/\s+/g, ' ')      // Normalize whitespace
    .trim();
  const metaDescription = cleanDescription.length > 160 
    ? `${cleanDescription.substring(0, 157)}...` 
    : cleanDescription;

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <link rel="canonical" href={url} />
      {branding?.favicon && <link rel="icon" href={branding.favicon} />}
      <meta name="robots" content="index, follow" />

      {/* JSON-LD Structured Data */}
      {schema && (
        <script type="application/ld+json">
          {typeof schema === 'string' ? schema : JSON.stringify(schema)}
        </script>
      )}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="es_EC" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:site" content="@vandora_ec" />
    </Helmet>
  );
};

export default SEO;
