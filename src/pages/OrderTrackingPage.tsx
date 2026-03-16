import React, { useState } from 'react';
import { Search, Package, ArrowRight, Truck, CheckCircle, Clock } from 'lucide-react';
import SEO from '../components/SEO';
import { motion } from 'framer-motion';

const OrderTrackingPage = () => {
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [trackingResult, setTrackingResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setTrackingResult(null);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      if (orderId.length > 5) {
        setTrackingResult({
          id: orderId,
          status: 'En Tránsito',
          date: '2023-10-25',
          items: [
            { name: 'Vestido Esmeralda Real', quantity: 1, image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=200' }
          ],
          timeline: [
            { status: 'Pedido Confirmado', date: '25 Oct, 10:00 AM', completed: true },
            { status: 'Preparando Paquete', date: '25 Oct, 02:00 PM', completed: true },
            { status: 'Enviado', date: '26 Oct, 09:00 AM', completed: true },
            { status: 'En Reparto', date: 'Pendiente', completed: false },
            { status: 'Entregado', date: 'Pendiente', completed: false },
          ]
        });
      } else {
        setError('No encontramos un pedido con ese número. Por favor verifica e intenta de nuevo.');
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <SEO title="Rastrear Pedido" description="Sigue el estado de tu compra en tiempo real." />
      
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-serif text-gray-900 mb-4">Rastrear mi Pedido</h1>
          <p className="text-gray-600">Ingresa el número de pedido y tu correo electrónico para ver el estado.</p>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6 md:p-8 mb-8">
          <form onSubmit={handleTrack} className="space-y-6 md:flex md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <label htmlFor="orderId" className="sr-only">Número de Pedido</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Package className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="orderId"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-vandora-emerald focus:border-vandora-emerald sm:text-sm"
                  placeholder="Número de Pedido (ej: #12345)"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex-1">
              <label htmlFor="email" className="sr-only">Correo Electrónico</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-vandora-emerald focus:border-vandora-emerald sm:text-sm"
                  placeholder="Correo Electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full md:w-auto flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-vandora-emerald hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vandora-emerald transition-colors disabled:opacity-70"
            >
              {isLoading ? 'Buscando...' : 'Rastrear'}
              {!isLoading && <ArrowRight className="ml-2 h-5 w-5" />}
            </button>
          </form>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-red-50 text-red-700 rounded-md text-sm text-center"
            >
              {error}
            </motion.div>
          )}
        </div>

        {trackingResult && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-100"
          >
            <div className="bg-vandora-emerald px-6 py-4 flex justify-between items-center text-white">
              <div>
                <p className="text-sm opacity-80">Pedido</p>
                <p className="font-bold text-lg">#{trackingResult.id}</p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-80">Estado Actual</p>
                <div className="flex items-center font-bold bg-white/20 px-3 py-1 rounded-full text-sm mt-1">
                  <Truck className="w-4 h-4 mr-2" />
                  {trackingResult.status}
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8">
              {/* Timeline */}
              <div className="relative mb-12">
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200" />
                <div className="space-y-8">
                  {trackingResult.timeline.map((step: any, index: number) => (
                    <div key={index} className="relative flex items-start">
                      <div className={`absolute left-8 -ml-1.5 mt-1.5 h-3 w-3 rounded-full border-2 border-white ${step.completed ? 'bg-vandora-emerald ring-4 ring-emerald-100' : 'bg-gray-300'}`} />
                      <div className="ml-16">
                        <h4 className={`text-sm font-bold ${step.completed ? 'text-gray-900' : 'text-gray-500'}`}>{step.status}</h4>
                        <p className="text-xs text-gray-500">{step.date}</p>
                      </div>
                      {step.completed && <CheckCircle className="h-5 w-5 text-vandora-emerald absolute left-2 bg-white rounded-full" />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Items */}
              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Artículos en tu pedido</h3>
                {trackingResult.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center py-2">
                    <img src={item.image} alt={item.name} className="h-16 w-16 object-cover rounded border border-gray-200" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">Cantidad: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default OrderTrackingPage;
