import React from 'react';
import SEO from '../components/SEO';

const StoryPage = () => {
  return (
    <div className="min-h-screen bg-vandora-cream py-20 px-4">
      <SEO title="Nuestra Historia" description="Conoce la inspiración detrás de Vandora y cómo empoderamos a las mujeres a través de la moda." />
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="font-serif text-5xl text-vandora-emerald mb-8">Nuestra Historia</h1>
        <p className="text-xl text-gray-700 leading-relaxed mb-12">
          "Vandora nació en las calles de Ecuador, inspirada por la fuerza de las mujeres que, contra todo pronóstico, florecen."
        </p>
        <div className="aspect-video bg-gray-300 rounded-lg mb-12 overflow-hidden">
          <img src="https://images.unsplash.com/photo-1551232864-3f0890e580d9?q=80&w=1000&auto=format&fit=crop" alt="Historia" className="w-full h-full object-cover" />
        </div>
        <div className="prose prose-lg mx-auto text-gray-600 text-left">
          <p>
            Cada puntada de nuestras prendas lleva consigo la promesa de calidad y la dedicación de manos artesanas.
            Creemos que la moda es una herramienta de empoderamiento, una armadura suave para enfrentar el mundo con dignidad y elegancia.
          </p>
          <p className="mt-4">
            Desde nuestros humildes comienzos hasta convertirnos en un referente de estilo, nuestra misión sigue intacta:
            celebrar la belleza real y la resiliencia de la mujer ecuatoriana.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StoryPage;
