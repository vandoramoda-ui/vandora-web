import React, { useEffect, useState } from 'react';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

const TermsPage = () => {
  const [content, setContent] = useState<any>({
    title: 'Términos y Condiciones',
    sections: [
      {
        title: 'Uso del Sitio',
        text: 'Al acceder a este sitio web, usted acepta los siguientes términos y condiciones de uso.'
      }
    ]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data } = await supabase
          .from('site_content')
          .select('content')
          .eq('section_key', 'page_terms')
          .single();
        
        if (data?.content) {
          setContent(data.content);
        }
      } catch (err) {
        console.error('Error fetching terms:', err);
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
    <div className="min-h-screen bg-vandora-cream py-12 px-4 sm:px-6 lg:px-8">
      <SEO title={content.title} description="Términos y condiciones de uso de Vandora." />
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-lg shadow-sm">
        <h1 className="font-serif text-3xl md:text-4xl text-vandora-emerald mb-8 text-center">{content.title}</h1>
        <div className="prose prose-emerald max-w-none">
          {content.sections?.map((section: any, idx: number) => (
            <div key={idx} className="mb-8">
              <h2 className="font-serif text-xl font-bold text-gray-900 mb-4">{section.title}</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{section.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
