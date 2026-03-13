import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Globe, Youtube, Linkedin, MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Footer = () => {
  const [socialLinks, setSocialLinks] = useState<any>({});

  useEffect(() => {
    const fetchSocial = async () => {
      const { data } = await supabase
        .from('site_content')
        .select('content')
        .eq('section_key', 'social_links')
        .single();
      
      if (data?.content) {
        setSocialLinks(data.content);
      }
    };
    fetchSocial();
  }, []);

  const getIcon = (key: string) => {
    switch (key) {
      case 'instagram': return <Instagram className="h-5 w-5" />;
      case 'facebook': return <Facebook className="h-5 w-5" />;
      case 'twitter': return <Twitter className="h-5 w-5" />;
      case 'tiktok': return (
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="h-5 w-5"
        >
          <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
        </svg>
      );
      case 'whatsapp': return <MessageCircle className="h-5 w-5" />;
      case 'youtube': return <Youtube className="h-5 w-5" />;
      case 'linkedin': return <Linkedin className="h-5 w-5" />;
      default: return <Globe className="h-5 w-5" />;
    }
  };

  return (
    <footer className="bg-vandora-black text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="font-serif text-2xl text-vandora-gold mb-4">VANDORA</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              "El Legado del Florecimiento". Moda elegante para la mujer que construye su propio camino.
            </p>
            <div className="flex flex-wrap gap-4">
              {Object.entries(socialLinks).filter(([_, data]: [any, any]) => data.enabled && data.url).map(([key, data]: [any, any]) => (
                <a 
                  key={key} 
                  href={data.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-vandora-gold transition-colors"
                  title={key}
                >
                  {getIcon(key)}
                </a>
              ))}
              {/* Default if none enabled yet */}
              {Object.values(socialLinks).filter((d: any) => d.enabled).length === 0 && (
                 <>
                    <a href="#" className="text-gray-400 hover:text-vandora-gold"><Instagram className="h-5 w-5" /></a>
                    <a href="#" className="text-gray-400 hover:text-vandora-gold"><Facebook className="h-5 w-5" /></a>
                 </>
              )}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-serif text-lg mb-4 text-vandora-gold">Explorar</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/tienda" className="hover:text-white transition-colors">Nueva Colección</Link></li>
              <li><Link to="/tienda?category=dresses" className="hover:text-white transition-colors">Vestidos</Link></li>
              <li><Link to="/tienda?category=blouses" className="hover:text-white transition-colors">Blusas</Link></li>
              <li><Link to="/tienda?category=pants" className="hover:text-white transition-colors">Pantalones</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-serif text-lg mb-4 text-vandora-gold">Compañía</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/nuestra-historia" className="hover:text-white transition-colors">Nuestra Historia</Link></li>
              <li><Link to="/contacto" className="hover:text-white transition-colors">Contacto</Link></li>
              <li><Link to="/preguntas-frecuentes" className="hover:text-white transition-colors">Preguntas Frecuentes</Link></li>
              <li><Link to="/envio" className="hover:text-white transition-colors">Envíos y Devoluciones</Link></li>
              <li><Link to="/politica-de-privacidad" className="hover:text-white transition-colors">Política de Privacidad</Link></li>
              <li><Link to="/terminos-y-condiciones" className="hover:text-white transition-colors">Términos y Condiciones</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-serif text-lg mb-4 text-vandora-gold">Únete al Círculo Vandora</h4>
            <p className="text-gray-400 text-sm mb-4">
              Recibe inspiración y ofertas exclusivas para mujeres que florecen.
            </p>
            <form className="flex flex-col space-y-2">
              <input 
                type="email" 
                placeholder="Tu correo electrónico" 
                className="bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded focus:outline-none focus:border-vandora-gold"
              />
              <button className="bg-vandora-gold text-vandora-emerald font-medium px-4 py-2 rounded hover:bg-yellow-600 transition-colors">
                Suscribirse
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500 text-xs">
          <p>&copy; {new Date().getFullYear()} Vandora. Todos los derechos reservados. Hecho con orgullo en Ecuador.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
