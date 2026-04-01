import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import SEO from '../components/SEO';

const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] bg-vandora-cream flex flex-col items-center justify-center px-4 py-20 text-center">
      <SEO 
        title="Página no encontrada" 
        description="Lo sentimos, no pudimos encontrar la página que buscas en Vandora." 
      />
      
      <div className="max-w-xl mx-auto space-y-8">
        <h1 className="text-8xl md:text-[150px] font-serif text-vandora-gold/20 mb-4 select-none">
          404
        </h1>
        
        <div className="space-y-4 relative z-10 -mt-16 md:-mt-24">
          <h2 className="text-3xl md:text-4xl font-serif text-vandora-emerald">
            Parece que te perdiste
          </h2>
          <p className="text-gray-600 text-base md:text-lg font-light leading-relaxed max-w-md mx-auto">
            No pudimos encontrar la pieza que buscas. Es posible que el enlace sea incorrecto o que la página ya no exista en nuestra colección.
          </p>
        </div>

        <div className="pt-8 relative z-10">
          <Link 
            to="/"
            className="inline-flex items-center px-8 py-4 bg-vandora-emerald text-white rounded-sm font-medium uppercase tracking-widest text-sm transition-transform hover:scale-105 hover:bg-emerald-900 shadow-lg"
          >
            <Home className="w-5 h-5 mr-3" />
            Regresar al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
