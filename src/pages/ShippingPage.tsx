import React from 'react';
import { Truck, MapPin, Clock, AlertCircle } from 'lucide-react';
import SEO from '../components/SEO';

const ShippingPage = () => {
  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <SEO title="Envíos y Devoluciones" description="Conoce nuestras políticas de envío y devoluciones a nivel nacional." />
      <div className="max-w-4xl mx-auto">
        <h1 className="font-serif text-4xl text-vandora-emerald mb-8 text-center">Envíos y Devoluciones</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-vandora-cream p-8 rounded-lg">
            <div className="flex items-center mb-4">
              <Truck className="h-6 w-6 text-vandora-gold mr-3" />
              <h2 className="font-serif text-2xl text-vandora-emerald">Política de Envíos</h2>
            </div>
            <ul className="space-y-4 text-gray-700">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 mt-1 text-gray-400 flex-shrink-0" />
                <span>Envíos a nivel nacional a través de Servientrega o transporte seguro.</span>
              </li>
              <li className="flex items-start">
                <Clock className="h-5 w-5 mr-2 mt-1 text-gray-400 flex-shrink-0" />
                <span>Tiempo de entrega: 2-3 días hábiles en ciudades principales. 3-5 días en cantones y parroquias.</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2 text-vandora-emerald">$</span>
                <span>Costo fijo de envío: $5.00 a cualquier parte del país.</span>
              </li>
            </ul>
          </div>

          <div className="bg-gray-50 p-8 rounded-lg">
            <div className="flex items-center mb-4">
              <AlertCircle className="h-6 w-6 text-vandora-gold mr-3" />
              <h2 className="font-serif text-2xl text-vandora-emerald">Cambios y Devoluciones</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Queremos que ames tu prenda Vandora. Si no es así, tienes 7 días calendario desde la recepción para solicitar un cambio.
            </p>
            <h3 className="font-medium text-gray-900 mb-2">Condiciones:</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>La prenda debe estar nueva, sin uso y con etiquetas.</li>
              <li>No aplica para prendas en oferta o liquidación.</li>
              <li>Los costos de envío por cambio de talla corren por cuenta del cliente.</li>
              <li>Si el producto tiene defecto de fábrica, nosotros cubrimos todos los gastos.</li>
            </ul>
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-500 italic">
            Para gestionar un cambio, escríbenos a <a href="mailto:hola@vandora.com" className="text-vandora-emerald underline">hola@vandora.com</a> con tu número de pedido.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShippingPage;
