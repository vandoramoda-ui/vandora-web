import React, { useEffect, useState } from 'react';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

const FAQPage = () => {
  const [faqs, setFaqs] = useState<any[]>([
    {
      question: "¿Cómo puedo realizar un pedido?",
      answer: "Navega por nuestra tienda, selecciona las prendas que te gusten, elige tu talla y color, y añádelas al carrito. Luego ve al carrito y sigue los pasos para finalizar la compra."
    },
    {
      question: "¿Cuáles son los métodos de pago?",
      answer: "Aceptamos transferencias bancarias directas y pagos en efectivo contra entrega (válido solo para Quito y Guayaquil)."
    },
    {
      question: "¿Hacen envíos a todo el Ecuador?",
      answer: "Sí, realizamos envíos a todas las provincias del Ecuador a través de servientrega o cooperativa de transporte."
    },
    {
      question: "¿Cuánto tiempo tarda en llegar mi pedido?",
      answer: "El tiempo estimado de entrega es de 2 a 3 días laborables para ciudades principales y hasta 5 días para trayectos especiales."
    },
    {
      question: "¿Puedo cambiar o devolver una prenda?",
      answer: "Sí, aceptamos cambios dentro de los primeros 7 días si la prenda está en perfecto estado y con sus etiquetas originales. Los costos de envío por cambio corren por cuenta del cliente, salvo error de fábrica."
    },
    {
      question: "¿Tienen tienda física?",
      answer: "Actualmente somos una tienda 100% online, pero pronto abriremos nuestro primer showroom. ¡Mantente atenta a nuestras redes!"
    }
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const { data } = await supabase
          .from('site_content')
          .select('content')
          .eq('section_key', 'page_faq')
          .single();
        
        if (data?.content && Array.isArray(data.content)) {
          setFaqs(data.content);
        }
      } catch (err) {
        console.error('Error fetching FAQ content:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center p-20 min-h-screen">
      <Loader2 className="w-8 h-8 animate-spin text-vandora-emerald" />
    </div>
  );

  return (
    <div className="min-h-screen bg-vandora-cream py-12 px-4 sm:px-6 lg:px-8">
      <SEO title="Preguntas Frecuentes" description="Respuestas a las preguntas más comunes sobre compras, envíos y devoluciones en Vandora." />
      <div className="max-w-3xl mx-auto">
        <h1 className="font-serif text-4xl text-vandora-emerald mb-8 text-center">Preguntas Frecuentes</h1>
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-serif text-lg font-medium text-gray-900 mb-2">{faq.question}</h3>
              <p className="text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
