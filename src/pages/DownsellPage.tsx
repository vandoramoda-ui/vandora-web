import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import SEO from '../components/SEO';
import { formatPrice } from '../lib/utils';

const DEFAULT_FUNNEL_CONFIG = {
  downsell: {
    product_id: '',
    title: '¿Qué tal solo una?',
    subtitle: 'Entendemos que no quieras el pack completo.',
    description: '¿Te gustaría llevarte solo una unidad a un precio especial?',
    cta_text: 'SÍ, AGREGAR A MI PEDIDO',
    decline_text: 'No gracias, no quiero esta oferta.',
    template: 'clean',
    accent_color: '#16a34a'
  }
};

const DownsellPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [funnelConfig, setFunnelConfig] = useState(DEFAULT_FUNNEL_CONFIG);
  const [downsellProduct, setDownsellProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (location.state?.order) {
      setOrder(location.state.order);
    } else {
      navigate('/');
    }
  }, [location, navigate]);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data } = await supabase
          .from('app_settings')
          .select('value')
          .eq('key', 'funnel_config')
          .maybeSingle();
        
        if (data) {
          const config = { ...DEFAULT_FUNNEL_CONFIG, ...data.value };
          setFunnelConfig(config);

          if (config.downsell.product_id) {
            const { data: product } = await supabase
              .from('products')
              .select('*')
              .eq('id', config.downsell.product_id)
              .maybeSingle();
            
            if (product) setDownsellProduct(product);
          }
        }
      } catch (err) {
        console.error('Error fetching downsell config:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleAccept = () => {
    if (!downsellProduct) return;

    const itemToAdd = {
      id: downsellProduct.id,
      name: downsellProduct.name,
      price: downsellProduct.sale_price || downsellProduct.price,
      quantity: 1,
      image: downsellProduct.images?.[0]?.url || downsellProduct.image
    };

    const updatedOrder = {
      ...order,
      items: [...order.items, itemToAdd],
      total: order.total + itemToAdd.price
    };

    navigate('/thank-you', { state: { order: updatedOrder } });
  };

  const handleDecline = () => {
    navigate('/thank-you', { state: { order } });
  };

  if (!order || loading || !downsellProduct) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vandora-emerald"></div>
    </div>
  );

  const { downsell } = funnelConfig;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <SEO title="Oferta Especial" description="Oferta exclusiva para ti." />
      
      <div className="max-w-2xl w-full space-y-8 bg-white p-8 rounded-lg shadow-lg relative overflow-hidden">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4 animate-bounce">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 border-b-2 border-emerald-500 inline-block pb-1 italic">
            {downsell.title}
          </h2>
          <p className="mt-4 text-lg text-gray-600 font-medium tracking-tight">
            {downsell.subtitle}
          </p>
        </div>

        <div className="border-2 border-dashed border-emerald-200 bg-gray-50 rounded-lg p-6 flex flex-col md:flex-row gap-6 items-center">
          <img 
            src={downsellProduct.images?.[0]?.url || downsellProduct.image} 
            alt={downsellProduct.name} 
            className="w-48 h-48 object-cover rounded-md shadow-md hover:scale-105 transition-transform"
          />
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{downsellProduct.name}</h3>
            <p className="text-gray-600 mb-4 text-sm leading-relaxed">
              {downsell.description || downsellProduct.description}
            </p>
            <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
              {downsellProduct.price > (downsellProduct.sale_price || downsellProduct.price) && (
                <span className="text-gray-400 line-through text-lg">${downsellProduct.price.toFixed(2)}</span>
              )}
              <span className="text-3xl font-bold text-red-600" style={{ color: downsell.accent_color }}>
                ${(downsellProduct.sale_price || downsellProduct.price).toFixed(2)}
              </span>
            </div>
            <ul className="text-sm text-gray-600 space-y-1 mb-6 text-left inline-block">
              <li>✅ Calidad Premium Vandora</li>
              <li>✅ Envío Gratis incluido</li>
              <li>✅ Garantía de satisfacción total</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <button
            onClick={handleAccept}
            className="w-full flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-md text-white shadow-xl transform transition hover:scale-[1.02] active:scale-95"
            style={{ backgroundColor: downsell.accent_color || '#16a34a' }}
          >
            {downsell.cta_text} POR ${(downsellProduct.sale_price || downsellProduct.price).toFixed(2)}
          </button>
          <button
            onClick={handleDecline}
            className="text-sm text-gray-500 hover:text-gray-700 underline transition-colors"
          >
            {downsell.decline_text}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DownsellPage;
