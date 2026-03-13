import React, { useEffect, useState } from 'react';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

const StoryPage = () => {
  const [content, setContent] = useState<any>({
    title: 'Nuestra Historia',
    quote: '"Vandora nació en las calles de Ecuador, inspirada por la fuerza de las mujeres que, contra todo pondóstico, florecen."',
    image: 'https://images.unsplash.com/photo-1551232864-3f0890e580d9?q=80&w=1000&auto=format&fit=crop',
    body1: 'Cada puntada de nuestras prendas lleva consigo la promesa de calidad y la dedicación de manos artesanas. Creemos que la moda es una herramienta de empoderamiento, una armadura suave para enfrentar el mundo con dignidad y elegancia.',
    body2: 'Desde nuestros humildes comienzos hasta convertirnos en un referente de estilo, nuestra misión sigue intacta: celebrar la belleza real y la resiliencia de la mujer ecuatoriana.'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data } = await supabase
          .from('site_content')
          .select('content')
          .eq('section_key', 'page_story')
          .single();
        
        if (data?.content) {
          setContent(data.content);
        }
      } catch (err) {
        console.error('Error fetching story content:', err);
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
    <div className="min-h-screen bg-vandora-cream py-20 px-4">
      <SEO title={content.title} description="Conoce la inspiración detrás de Vandora y cómo empoderamos a las mujeres a través de la moda." />
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="font-serif text-5xl text-vandora-emerald mb-8">{content.title}</h1>
        <p className="text-xl text-gray-700 leading-relaxed mb-12">
          {content.quote}
        </p>
        <div className="aspect-video bg-gray-300 rounded-lg mb-12 overflow-hidden">
          <img src={content.image} alt="Historia" className="w-full h-full object-cover" />
        </div>
        <div className="prose prose-lg mx-auto text-gray-600 text-left">
          <p>
            {content.body1}
          </p>
          <p className="mt-4">
            {content.body2}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StoryPage;
