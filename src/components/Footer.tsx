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
        <svg fill="currentColor" viewBox="0 0 24 24" className="h-5 w-5">
           <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.13-1.47V18c0 1.94-.66 3.82-1.88 5.32A9 9 0 0 1 7.21 24.1c-2.4-.1-4.75-1.15-6.53-2.76A9 9 0 0 1 .15 14.18c.32-2.31 1.62-4.45 3.56-5.83 1.96-1.39 4.41-1.93 6.77-1.52.01 1.34 0 2.68.01 4.02-1.8-.49-3.79-.11-5.32.93-1.07.72-1.8 1.83-2.04 3.1-.2 1.07-.07 2.19.38 3.19.5 1.1 1.41 2.01 2.51 2.51 a4.4 4.4 0 0 0 5.43-.51c1.07-1.03 1.68-2.48 1.68-3.95V.02z"/>
        </svg>
      );
      case 'whatsapp': return (
        <svg fill="currentColor" viewBox="0 0 24 24" className="h-5 w-5">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.438 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.658 1.43 5.632 1.43h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      );
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
              <li><Link to="/envio" className="hover:text-white transition-colors">Envíos y Cambios</Link></li>
              <li><Link to="/politica-de-reembolso" className="hover:text-white transition-colors">Políticas de Reembolso</Link></li>
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
