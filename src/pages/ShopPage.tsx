import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import ProductCard from '../components/ProductCard';
import { Loader2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import SEO from '../components/SEO';

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
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get category from URL or default to 'all'
  const categoryFilter = searchParams.get('category') || 'all';

  useEffect(() => {
    fetchProducts();
  }, []);

  const setCategoryFilter = (category: string) => {
    if (category === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    setSearchParams(searchParams);
  };

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
            sizes: Array.isArray(p.sizes) ? p.sizes : [],
            colors
          };
        });
        setProducts(mappedProducts);
      } else {
        // Fallback mock data if DB is empty or connection fails gracefully
        // This ensures the preview is usable
        console.log('No products found in DB, using mock data for preview.');
        setProducts(MOCK_PRODUCTS);
      }
    } catch (err: any) {
      console.error('Error fetching products:', err.message);
      // Fallback to mock data on error so the user sees something
      setProducts(MOCK_PRODUCTS);
      setError('Mostrando catálogo de demostración (Conexión a base de datos pendiente).');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = (categoryFilter === 'all' 
    ? products 
    : products.filter(p => p.category.toLowerCase() === categoryFilter.toLowerCase()))
    .filter(p => p.stock > 0);

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category.toLowerCase())))];

  return (
    <div className="bg-vandora-cream min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <SEO 
        title="Tienda" 
        description="Explora nuestra colección completa de moda ecuatoriana. Vestidos, blusas y pantalones de alta calidad." 
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

// Mock Data for Preview
const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Vestido Esmeralda Real',
    price: 85.00,
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1000&auto=format&fit=crop',
    category: 'Vestidos',
    description: 'Un vestido que impone presencia. Corte elegante y tela suave que se adapta a tu figura.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'Esmeralda', code: '#50C878' }, { name: 'Negro', code: '#000000' }],
    stock: 10
  },
  {
    id: '2',
    name: 'Blusa Seda Champagne',
    price: 45.00,
    image: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?q=80&w=1000&auto=format&fit=crop',
    category: 'Blusas',
    description: 'Suavidad y brillo sutil para tus reuniones más importantes.',
    sizes: ['S', 'M', 'L'],
    colors: [{ name: 'Champagne', code: '#F7E7CE' }, { name: 'Blanco', code: '#FFFFFF' }],
    stock: 15
  },
  {
    id: '3',
    name: 'Pantalón Palazzo Crema',
    price: 60.00,
    image: 'https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?q=80&w=1000&auto=format&fit=crop',
    category: 'Pantalones',
    description: 'Comodidad y estilo en una sola prenda. Perfecto para la oficina o un evento casual.',
    sizes: ['M', 'L', 'XL'],
    colors: [{ name: 'Crema', code: '#FFFDD0' }, { name: 'Negro', code: '#000000' }, { name: 'Azul Marino', code: '#000080' }],
    stock: 8
  },
  {
    id: '4',
    name: 'Chaqueta Ejecutiva Rosa',
    price: 95.00,
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1000&auto=format&fit=crop',
    category: 'Chaquetas',
    description: 'El toque de color que tu outfit profesional necesita.',
    sizes: ['S', 'M', 'L'],
    colors: [{ name: 'Rosa Viejo', code: '#D8A1A1' }, { name: 'Gris', code: '#808080' }],
    stock: 5
  },
  {
    id: '5',
    name: 'Falda Midi Plisada',
    price: 55.00,
    image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?q=80&w=1000&auto=format&fit=crop',
    category: 'Faldas',
    description: 'Movimiento y elegancia en cada paso.',
    sizes: ['S', 'M'],
    colors: [{ name: 'Negro', code: '#000000' }, { name: 'Verde Oliva', code: '#808000' }],
    stock: 12
  },
  {
    id: '6',
    name: 'Vestido Noche Estrellada',
    price: 120.00,
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=1000&auto=format&fit=crop',
    category: 'Vestidos',
    description: 'Para esas noches donde tú eres la protagonista.',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [{ name: 'Azul Noche', code: '#191970' }, { name: 'Negro', code: '#000000' }],
    stock: 3
  }
];

export default ShopPage;
