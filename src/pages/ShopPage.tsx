import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import ProductCard from '../components/ProductCard';
import { Loader2 } from 'lucide-react';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import { useAnalytics } from '../context/AnalyticsContext';

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  sizes: string[];
  colors: { name: string; code: string }[];
  stock: number;
};

const ShopPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { trackStandardEvent } = useAnalytics();
  
  // Get category from URL param, then search query, or default to 'all'
  const categoryFilter = categoryName || searchParams.get('category') || 'all';

  useEffect(() => {
    fetchProducts();
  }, []);

  const setCategoryFilter = (category: string) => {
    if (category === 'all') {
      navigate('/tienda');
    } else {
      const slug = category.toLowerCase().replace(/\s+/g, '-');
      navigate(`/tienda/${slug}`);
    }
  };

  useEffect(() => {
    trackStandardEvent('ViewContent', {
      content_name: categoryFilter === 'all' ? 'Tienda - Todo' : `Tienda - ${categoryFilter}`,
      content_category: categoryFilter,
      content_type: 'product_group'
    });
  }, [categoryFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*');

      if (error) throw error;

      if (data && data.length > 0) {
        const parseJSON = (val: any) => {
          if (typeof val !== 'string') return val;
          try {
            const parsed = JSON.parse(val);
            return parsed && typeof parsed === 'object' ? parsed : val;
          } catch (e) {
            return val;
          }
        };

        const mappedProducts = data.map((p: any) => {
          const images = Array.isArray(p.images) ? p.images.map((img: any) => {
            const parsed = parseJSON(img);
            return typeof parsed === 'string' ? { url: parsed } : parsed;
          }) : [];

          const colors = Array.isArray(p.colors) ? p.colors.map((c: any) => {
            const parsed = parseJSON(c);
            return typeof parsed === 'object' && parsed !== null ? parsed : { name: String(c), code: '#CCCCCC' };
          }) : [];

          return {
            ...p,
            image: images.length > 0 ? images[0].url : (p.image || 'https://placehold.co/600x800?text=No+Image'),
            imageAlt: images.length > 0 ? images[0].alt : null,
            sizes: Array.isArray(p.sizes) ? p.sizes : [],
            colors
          };
        });
        setProducts(mappedProducts);
      }
    } catch (err: any) {
      console.error('Error fetching products:', err.message);
      setError('Error al cargar productos. Por favor, intenta de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const slugify = (text: string) => text.toLowerCase().replace(/\s+/g, '-');

  const filteredProducts = (categoryFilter === 'all' 
    ? products 
    : products.filter(p => slugify(p.category) === slugify(categoryFilter)))
    .filter(p => p.stock > 0);

  const categories: string[] = ['all', ...Array.from<string>(new Set(products.map((p: Product) => p.category.toLowerCase())))];

  return (
    <div className="bg-vandora-cream min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <SEO 
        title={categoryFilter === 'all' ? 'Tienda' : `Colección ${categoryFilter}`} 
        description={categoryFilter === 'all' 
          ? "Explora nuestra colección completa de moda ecuatoriana. Vestidos, blusas y pantalones de alta calidad."
          : `Descubre nuestra selección exclusiva de ${categoryFilter}. Diseños únicos que realzan tu estilo.`
        }
        canonical={categoryFilter === 'all' ? `${window.location.origin}/tienda` : `${window.location.origin}/tienda/${slugify(categoryFilter)}`}
        schema={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": categoryFilter === 'all' ? 'Tienda Vandora' : `Colección ${categoryFilter} - Vandora`,
          "description": categoryFilter === 'all' 
            ? "Explora nuestra colección completa de moda ecuatoriana."
            : `Descubre nuestra selección exclusiva de ${categoryFilter}.`,
          "url": window.location.href,
          "mainEntity": {
            "@type": "ItemList",
            "itemListElement": products.slice(0, 20).map((p, idx) => ({
              "@type": "ListItem",
              "position": idx + 1,
              "url": `${window.location.origin}/producto/${p.category.toLowerCase().replace(/\s+/g, '-')}/${p.slug || p.id}`
            }))
          }
        }}
      />
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl text-vandora-emerald mb-4">Nuestra Colección</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Piezas diseñadas para empoderar tu día a día. Encuentra la elegancia en cada detalle.
          </p>
        </div>

        {error && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex justify-center mb-12 space-x-4 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-vandora-emerald text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {cat === 'all' ? 'Ver Todo' : cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-vandora-emerald" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopPage;
