import React, { useEffect, useState } from 'react';
import { Truck, MapPin, Clock, AlertCircle, Loader2 } from 'lucide-react';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabase';

const ShippingPage = () => {
  const [content, setContent] = useState<any>({
    title: 'Envíos y Devoluciones',
    shipping_title: 'Política de Envíos',
    shipping_line1: 'Envíos a nivel nacional a través de Servientrega o transporte seguro.',
    shipping_line2: 'Tiempo de entrega: 2-3 días hábiles en ciudades principales. 3-5 días en cantones y parroquias.',
    shipping_line3: 'Costo fijo de envío: $5.00 a cualquier parte del país.',
    return_title: 'Cambios y Devoluciones',
    return_desc: 'Queremos que ames tu prenda Vandora. Si no es así, tienes 7 días calendario desde la recepción para solicitar un cambio.',
    return_conditions: [
      'La prenda debe estar nueva, sin uso y con etiquetas.',
      'No aplica para prendas en oferta o liquidación.',
      'Los costos de envío por cambio de talla corren por cuenta del cliente.',
      'Si el producto tiene defecto de fábrica, nosotros cubrimos todos los gastos.'
    ],
    footer_text: 'Para gestionar un cambio, escríbenos a hola@vandora.com con tu número de pedido.',
    contact_email: 'hola@vandora.com'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data } = await supabase
          .from('site_content')
          .select('content')
          .eq('section_key', 'page_shipping')
          .single();
        
        if (data?.content) {
          setContent(data.content);
        }
      } catch (err) {
        console.error('Error fetching shipping content:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center p-20 min-h-screen">
      <Loader2 className="w-8 h-8 animate-spin text-vandora-emerald" />
    </div>
  );

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <SEO title={content.title} description="Conoce nuestras políticas de envío y devoluciones a nivel nacional." />
      <div className="max-w-4xl mx-auto">
        <h1 className="font-serif text-4xl text-vandora-emerald mb-8 text-center">{content.title}</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-vandora-cream p-8 rounded-lg">
            <div className="flex items-center mb-4">
              <Truck className="h-6 w-6 text-vandora-gold mr-3" />
              <h2 className="font-serif text-2xl text-vandora-emerald">{content.shipping_title}</h2>
            </div>
            <ul className="space-y-4 text-gray-700">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 mt-1 text-gray-400 flex-shrink-0" />
                <span>{content.shipping_line1}</span>
              </li>
              <li className="flex items-start">
                <Clock className="h-5 w-5 mr-2 mt-1 text-gray-400 flex-shrink-0" />
                <span>{content.shipping_line2}</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2 text-vandora-emerald">$</span>
                <span>{content.shipping_line3}</span>
              </li>
            </ul>
          </div>

          <div className="bg-gray-50 p-8 rounded-lg">
            <div className="flex items-center mb-4">
              <AlertCircle className="h-6 w-6 text-vandora-gold mr-3" />
              <h2 className="font-serif text-2xl text-vandora-emerald">{content.return_title}</h2>
            </div>
            <p className="text-gray-600 mb-4">
              {content.return_desc}
            </p>
            <h3 className="font-medium text-gray-900 mb-2">Condiciones:</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              {content.return_conditions.map((cond: string, i: number) => (
                <li key={i}>{cond}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-500 italic">
            {content.footer_text.split(content.contact_email).map((part: string, i: number, arr: any[]) => (
              <React.Fragment key={i}>
                {part}
                {i < arr.length - 1 && (
                  <a href={`mailto:${content.contact_email}`} className="text-vandora-emerald underline">
                    {content.contact_email}
                  </a>
                )}
              </React.Fragment>
            ))}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShippingPage;
