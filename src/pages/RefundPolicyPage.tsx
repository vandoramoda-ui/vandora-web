import React, { useEffect, useState } from 'react';
import { History, ShieldCheck, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabase';

const RefundPolicyPage = () => {
  const [content, setContent] = useState<any>({
    title: 'Políticas de Reembolso',
    intro: 'En Vandora, nos esforzamos por garantizar tu satisfacción total.',
    conditions: [],
    process: '',
    footer_text: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data } = await supabase
          .from('site_content')
          .select('content')
          .eq('section_key', 'page_refund')
          .single();
        
        if (data?.content) {
          setContent(data.content);
        }
      } catch (err) {
        console.error('Error fetching refund content:', err);
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
      <SEO 
        title={content.title} 
        description="Conoce nuestras políticas de reembolso y devoluciones. Transparencia y confianza en cada compra." 
      />
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <History className="h-12 w-12 text-vandora-gold mx-auto mb-4" />
          <h1 className="font-serif text-4xl text-vandora-emerald mb-4">{content.title}</h1>
          <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {content.intro}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Conditions */}
          <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center mb-6">
              <ShieldCheck className="h-6 w-6 text-vandora-emerald mr-3" />
              <h2 className="font-serif text-2xl text-vandora-emerald">Condiciones</h2>
            </div>
            <ul className="space-y-4">
              {content.conditions.map((cond: string, i: number) => (
                <li key={i} className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-vandora-gold mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-sm leading-relaxed">{cond}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Process */}
          <div className="bg-vandora-cream p-8 rounded-2xl border border-vandora-gold/10 shadow-sm">
            <div className="flex items-center mb-6">
              <Clock className="h-6 w-6 text-vandora-emerald mr-3" />
              <h2 className="font-serif text-2xl text-vandora-emerald">Proceso</h2>
            </div>
            <div className="prose prose-sm text-gray-700 leading-relaxed">
              {content.process.split('\n').map((para: string, i: number) => (
                <p key={i} className="mb-4">{para}</p>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="bg-vandora-emerald text-white p-8 rounded-2xl text-center shadow-lg">
          <p className="text-lg font-serif mb-2 italic">Información Adicional</p>
          <p className="text-emerald-50 opacity-90 leading-relaxed">
            {content.footer_text}
          </p>
        </div>

        <div className="mt-12 text-center text-gray-400 text-xs">
          <p>Última actualización: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicyPage;
