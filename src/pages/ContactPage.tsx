import React, { useEffect, useState } from 'react';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

const ContactPage = () => {
  const [content, setContent] = useState<any>({
    title: 'Contáctanos',
    address_title: 'Visítanos',
    address_line1: 'Av. Amazonas y Naciones Unidas',
    address_line2: 'Quito, Ecuador',
    hours: 'Lunes a Sábado: 10am - 8pm',
    write_title: 'Escríbenos',
    email: 'hola@vandora.com',
    phone: '+593 99 999 9999'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data } = await supabase
          .from('site_content')
          .select('content')
          .eq('section_key', 'page_contact')
          .single();
        
        if (data?.content) {
          setContent(data.content);
        }
      } catch (err) {
        console.error('Error fetching contact content:', err);
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
    <div className="min-h-screen bg-white py-20 px-4">
      <SEO title={content.title} description="Contáctanos para cualquier duda o consulta sobre nuestros productos." />
      <div className="max-w-3xl mx-auto">
        <h1 className="font-serif text-4xl text-vandora-emerald mb-8 text-center">{content.title}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h3 className="font-serif text-xl mb-4">{content.address_title}</h3>
            <p className="text-gray-600 mb-2">{content.address_line1}</p>
            <p className="text-gray-600 mb-2">{content.address_line2}</p>
            <p className="text-gray-600">{content.hours}</p>
          </div>
          <div>
            <h3 className="font-serif text-xl mb-4">{content.write_title}</h3>
            <p className="text-gray-600 mb-2">{content.email}</p>
            <p className="text-gray-600">{content.phone}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
