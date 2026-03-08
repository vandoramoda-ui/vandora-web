import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, X } from 'lucide-react';
import SEO from '../components/SEO';
import { formatPrice } from '../lib/utils';

const UpsellPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  useEffect(() => {
    if (location.state?.order) {
      setOrder(location.state.order);
    } else {
      // If no order, redirect to home
      navigate('/');
    }
  }, [location, navigate]);

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
    // Logic to add upsell product to order
    const upsellProduct = {
      id: 'upsell-1',
      name: 'Pack de 3 Blusas Básicas Premium',
      price: 45.00, // Discounted from 60
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?q=80&w=500'
    };

    const updatedOrder = {
      ...order,
      items: [...order.items, upsellProduct],
      total: order.total + upsellProduct.price
    };

    navigate('/thank-you', { state: { order: updatedOrder } });
  };

  const handleDecline = () => {
    // Navigate to Downsell
    navigate('/downsell', { state: { order } });
  };

  if (!order) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <SEO title="Oferta Especial" description="Oferta exclusiva para ti." />
      
      <div className="max-w-2xl w-full space-y-8 bg-white p-8 rounded-lg shadow-lg relative overflow-hidden">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gray-200">
          <div className="h-full bg-red-500 animate-pulse" style={{ width: `${(timeLeft / 300) * 100}%` }} />
        </div>

        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">¡ESPERA! Tu pedido no está completo</h2>
          <p className="mt-2 text-lg text-gray-600">
            Tenemos una oferta exclusiva solo para ti. Esta oferta expira en <span className="font-bold text-red-600">{formatPrice(timeLeft).replace('$', '')}</span> minutos.
          </p>
        </div>

        <div className="border-2 border-dashed border-red-200 bg-red-50 rounded-lg p-6">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <img 
              src="https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?q=80&w=500" 
              alt="Pack Blusas" 
              className="w-48 h-48 object-cover rounded-md shadow-md"
            />
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Pack de 3 Blusas Básicas Premium</h3>
              <p className="text-gray-600 mb-4">
                Completa tu armario con nuestros básicos esenciales. Algodón pima 100%, corte perfecto y durabilidad garantizada.
              </p>
              <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                <span className="text-gray-400 line-through text-lg">$60.00</span>
                <span className="text-3xl font-bold text-red-600">$45.00</span>
                <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded">AHORRAS 25%</span>
              </div>
              <ul className="text-sm text-gray-600 space-y-1 mb-6 text-left inline-block">
                <li>✅ Colores: Blanco, Negro, Beige</li>
                <li>✅ Envío Gratis incluido en este artículo</li>
                <li>✅ Garantía de satisfacción de 30 días</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <button
            onClick={handleAccept}
            className="w-full flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-md text-white bg-green-600 hover:bg-green-700 md:py-4 md:text-xl shadow-lg transform transition hover:scale-105"
          >
            SÍ, AGREGAR A MI PEDIDO POR $45.00
          </button>
          <button
            onClick={handleDecline}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            No gracias, no quiero ahorrar dinero hoy.
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpsellPage;
