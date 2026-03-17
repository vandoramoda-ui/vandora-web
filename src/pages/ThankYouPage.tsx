import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, ShoppingBag, ArrowRight, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import { useAnalytics } from '../context/AnalyticsContext';

const ThankYouPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { trackPurchase } = useAnalytics();
  const order = location.state?.order;

  useEffect(() => {
    if (!order) {
      // Optional: Redirect to home if accessed directly without an order
      // navigate('/');
    } else {
      // Track Purchase only once
      const trackedKey = `order_tracked_${order.id}`;
      if (!sessionStorage.getItem(trackedKey)) {
        trackPurchase(order.id, order.total, 'USD', `purchase-${order.id}`, {
          email: order.customer_email,
          phone: order.customer_phone
        });
        sessionStorage.setItem(trackedKey, 'true');
      }
    }
  }, [order, navigate]);

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <SEO title="Gracias" description="Gracias por visitar Vandora" />
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-serif text-gray-900 mb-4">Gracias por tu visita</h2>
          <p className="text-gray-600 mb-6">No encontramos información de un pedido reciente en esta sesión.</p>
          <Link 
            to="/" 
            className="inline-block bg-vandora-emerald text-white px-6 py-3 rounded-md hover:bg-emerald-800 transition-colors"
          >
            Volver al Inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <SEO title="Gracias por tu compra" description="Confirmación de pedido" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white shadow-xl rounded-2xl overflow-hidden"
      >
        <div className="bg-vandora-emerald p-8 text-center">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-white mb-4"
          >
            <CheckCircle className="h-10 w-10 text-vandora-emerald" />
          </motion.div>
          <h2 className="text-3xl font-serif text-white mb-2">¡Gracias por tu compra!</h2>
          <p className="text-emerald-100">Tu pedido ha sido confirmado.</p>
        </div>

        <div className="p-8 space-y-6">
          <div className="text-center">
            <p className="text-gray-600 mb-2">Hemos enviado un correo de confirmación a:</p>
            <p className="font-medium text-gray-900">{order?.customer?.email || 'tu correo electrónico'}</p>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Resumen del Pedido</h3>
            {order?.items?.map((item: any, index: number) => (
              <div key={index} className="flex justify-between items-center mb-3 text-sm">
                <span className="text-gray-600 truncate flex-1 mr-4">
                  {item.quantity}x {item.name}
                </span>
                <span className="font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between items-center font-bold text-lg">
              <span>Total</span>
              <span className="text-vandora-emerald">${order?.total?.toFixed(2) || '0.00'}</span>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg flex items-start space-x-3">
            <Heart className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">
              ¡Nos encantaría verte lucir tus prendas! Etiquétanos en Instagram <span className="font-bold">@vandora.ec</span> para un 10% de descuento en tu próxima compra.
            </p>
          </div>

          <div className="space-y-3 pt-4">
            <Link 
              to="/tienda" 
              className="block w-full bg-gray-900 text-white text-center py-3 rounded-md font-medium hover:bg-gray-800 transition-colors flex items-center justify-center"
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              Seguir Comprando
            </Link>
            <Link 
              to="/" 
              className="block w-full bg-white border border-gray-300 text-gray-700 text-center py-3 rounded-md font-medium hover:bg-gray-50 transition-colors"
            >
              Volver al Inicio
            </Link>
          </div>
        </div>
      </motion.div>
      
      <p className="mt-8 text-center text-sm text-gray-500">
        ¿Tienes preguntas? Contáctanos en <a href="mailto:soporte@vandora.ec" className="text-vandora-emerald hover:underline">soporte@vandora.ec</a>
      </p>
    </div>
  );
};

export default ThankYouPage;
