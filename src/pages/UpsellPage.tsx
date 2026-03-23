import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, X, ShieldCheck, Clock, Star, Truck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import SEO from '../components/SEO';
import { formatPrice } from '../lib/utils';

const DEFAULT_FUNNEL_CONFIG = {
  upsell: {
    product_id: '',
    title: '¡ESPERA! Tu pedido no está completo',
    subtitle: 'Tenemos una oferta exclusiva solo para ti.',
    description: 'Completa tu armario con nuestros básicos esenciales.',
    cta_text: 'SÍ, AGREGAR A MI PEDIDO',
    decline_text: 'No gracias, no quiero ahorrar hoy.',
    template: 'urgency',
    timer_seconds: 300,
    accent_color: '#dc2626'
  }
};

const UpsellPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [funnelConfig, setFunnelConfig] = useState(DEFAULT_FUNNEL_CONFIG);
  const [upsellProduct, setUpsellProduct] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(300);
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
          setTimeLeft(config.upsell.timer_seconds || 300);

          if (config.upsell.product_id) {
            const { data: product } = await supabase
              .from('products')
              .select('*')
              .eq('id', config.upsell.product_id)
              .maybeSingle();
            
            if (product) setUpsellProduct(product);
          }
        }
      } catch (err) {
        console.error('Error fetching upsell config:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleAccept = () => {
    if (!upsellProduct) return;
    
    const itemToAdd = {
      id: upsellProduct.id,
      name: upsellProduct.name,
      price: upsellProduct.sale_price || upsellProduct.price,
      quantity: 1,
      image: upsellProduct.images?.[0]?.url || upsellProduct.image
    };

    const updatedOrder = {
      ...order,
      items: [...order.items, itemToAdd],
      total: order.total + itemToAdd.price
    };

    navigate('/thank-you', { state: { order: updatedOrder } });
  };

  const handleDecline = () => {
    navigate('/downsell', { state: { order } });
  };

  if (!order || loading || !upsellProduct) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vandora-emerald"></div>
    </div>
  );

  const { upsell } = funnelConfig;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <SEO title="Oferta Especial" description="Oferta exclusiva para ti." />
      
      <div className="max-w-2xl w-full space-y-8 bg-white p-8 rounded-lg shadow-lg relative overflow-hidden">
        {/* Progress Bar (Urgencia) */}
        {upsell.template === 'urgency' && (
          <div className="absolute top-0 left-0 w-full h-2 bg-gray-200">
            <div 
              className="h-full bg-red-500 transition-all duration-1000" 
              style={{ width: `${(timeLeft / (upsell.timer_seconds || 300)) * 100}%` }} 
            />
          </div>
        )}

        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4 animate-bounce">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 border-b-2 border-emerald-500 inline-block pb-1 italic">
            {upsell.title}
          </h2>
          <p className="mt-4 text-lg text-gray-600 font-medium">
            {upsell.subtitle}
          </p>
          {upsell.template === 'urgency' && (
            <div className="mt-2 inline-flex items-center bg-red-100 text-red-700 px-4 py-1 rounded-full text-sm font-bold animate-pulse">
              <Clock className="h-4 w-4 mr-2" />
              EXPIRA EN {formatTime(timeLeft)}
            </div>
          )}
        </div>

        <div className={`border-2 border-dashed rounded-lg p-6 bg-gray-50 flex flex-col md:flex-row gap-6 items-center transition-all ${upsell.template === 'urgency' ? 'border-red-200' : 'border-emerald-200'}`}>
          <img 
            src={upsellProduct.images?.[0]?.url || upsellProduct.image} 
            alt={upsellProduct.name} 
            className="w-48 h-48 object-cover rounded-md shadow-md hover:scale-105 transition-transform"
          />
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{upsellProduct.name}</h3>
            <p className="text-gray-600 mb-4 text-sm leading-relaxed">
              {upsell.description || upsellProduct.description}
            </p>
            <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
              {upsellProduct.price > (upsellProduct.sale_price || upsellProduct.price) && (
                <span className="text-gray-400 line-through text-lg">${upsellProduct.price.toFixed(2)}</span>
              )}
              <span className="text-3xl font-bold text-red-600" style={{ color: upsell.accent_color }}>
                ${(upsellProduct.sale_price || upsellProduct.price).toFixed(2)}
              </span>
            </div>
            
            {upsell.template === 'social_proof' && (
              <div className="flex items-center gap-1 text-yellow-400 mb-4 justify-center md:justify-start">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                <span className="text-gray-500 text-xs ml-1">(+50 reseñas)</span>
              </div>
            )}
            
            <ul className="text-sm text-gray-600 space-y-1 mb-6 text-left inline-block">
              <li>✅ Calidad Premium Garantizada</li>
              <li>✅ Envío Gratis incluido</li>
              <li>✅ {upsell.template === 'social_proof' ? '¡Producto más vendido!' : 'Garantía de satisfacción'}</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <button
            onClick={handleAccept}
            className="w-full flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-md text-white shadow-xl transform transition hover:scale-[1.02] active:scale-95"
            style={{ backgroundColor: upsell.accent_color || '#16a34a' }}
          >
            {upsell.cta_text} POR ${(upsellProduct.sale_price || upsellProduct.price).toFixed(2)}
          </button>
          <button
            onClick={handleDecline}
            className="text-sm text-gray-500 hover:text-gray-700 underline transition-colors"
          >
            {upsell.decline_text}
          </button>
        </div>
        
        {/* Final Trust Badge */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-center gap-8 opacity-60 grayscale hover:grayscale-0 transition-all">
          <div className="flex flex-col items-center">
            <ShieldCheck className="h-6 w-6 text-gray-400" />
            <span className="text-[10px] mt-1 uppercase tracking-tighter">Compra Segura</span>
          </div>
          <div className="flex flex-col items-center">
            <Truck className="h-6 w-6 text-gray-400" />
            <span className="text-[10px] mt-1 uppercase tracking-tighter">Envío Express</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpsellPage;
