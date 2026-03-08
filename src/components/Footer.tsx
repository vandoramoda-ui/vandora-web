import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
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
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-vandora-gold transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-vandora-gold transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-vandora-gold transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-serif text-lg mb-4 text-vandora-gold">Explorar</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/shop" className="hover:text-white transition-colors">Nueva Colección</Link></li>
              <li><Link to="/shop?category=dresses" className="hover:text-white transition-colors">Vestidos</Link></li>
              <li><Link to="/shop?category=blouses" className="hover:text-white transition-colors">Blusas</Link></li>
              <li><Link to="/shop?category=pants" className="hover:text-white transition-colors">Pantalones</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-serif text-lg mb-4 text-vandora-gold">Compañía</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/story" className="hover:text-white transition-colors">Nuestra Historia</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contacto</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">Preguntas Frecuentes</Link></li>
              <li><Link to="/shipping" className="hover:text-white transition-colors">Envíos y Devoluciones</Link></li>
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
