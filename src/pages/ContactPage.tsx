import React, { useEffect, useState } from 'react';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabase';
import { Loader2, UserPlus, Mail } from 'lucide-react';
import AffiliateApplicationForm from '../components/AffiliateApplicationForm';

const ContactPage = () => {
  const [activeTab, setActiveTab] = useState<'info' | 'affiliates'>('info');
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
      <SEO title={activeTab === 'info' ? content.title : 'Programa de Afiliados'} description="Contáctanos o únete a nuestro programa de afiliados." />
      
      <div className="max-w-4xl mx-auto mb-12 flex justify-center border-b border-gray-100">
        <button 
          onClick={() => setActiveTab('info')}
          className={`px-8 py-4 text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'info' ? 'text-vandora-emerald border-b-2 border-vandora-emerald' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <div className="flex items-center">
            <Mail className="w-4 h-4 mr-2" />
            Atención al Cliente
          </div>
        </button>
        <button 
          onClick={() => setActiveTab('affiliates')}
          className={`px-8 py-4 text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'affiliates' ? 'text-vandora-emerald border-b-2 border-vandora-emerald' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <div className="flex items-center">
            <UserPlus className="w-4 h-4 mr-2" />
            Programa de Afiliados
          </div>
        </button>
      </div>

      <div className="max-w-3xl mx-auto">
        {activeTab === 'info' ? (
          <div>
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
        ) : (
          <div>
            <div className="text-center mb-12">
              <h1 className="font-serif text-4xl text-vandora-emerald mb-4">Conviértete en Embajadora Vandora</h1>
              <p className="text-gray-600 max-w-xl mx-auto">
                Comparte tu pasión por la moda ecuatoriana y gana comisiones por cada venta que refieras. 
                Vandora premia tu estilo y tu comunidad.
              </p>
            </div>
            <AffiliateApplicationForm />
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactPage;
