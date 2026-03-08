import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Menu, X, Search, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'motion/react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { items, setIsOpen: setIsCartOpen } = useCart();

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="bg-white text-vandora-black sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Hamburger Menu */}
          <div className="flex-shrink-0 flex items-center">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md text-gray-600 hover:text-vandora-emerald hover:bg-gray-50 focus:outline-none transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Center: Logo */}
          <div className="flex-grow flex justify-center">
            <Link to="/" className="font-serif text-2xl tracking-widest text-vandora-black hover:opacity-80 transition-opacity uppercase">
              VANDORA
            </Link>
          </div>

          {/* Right: Cart Icon */}
          <div className="flex-shrink-0 flex items-center">
            <button 
              onClick={() => setIsCartOpen(true)} 
              className="relative p-2 text-gray-600 hover:text-vandora-emerald transition-colors"
            >
              <ShoppingBag className="h-6 w-6" />
              {items.length > 0 && (
                <span className="absolute top-0 right-0 bg-vandora-emerald text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile/Desktop Menu Drawer (Reusing the mobile menu logic for the hamburger) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border-t border-gray-100 absolute w-full shadow-lg"
          >
            <div className="px-4 pt-4 pb-6 space-y-2">
              <Link to="/" onClick={toggleMenu} className="block px-3 py-3 rounded-md text-base font-medium text-gray-800 hover:text-vandora-emerald hover:bg-gray-50 transition-colors">INICIO</Link>
              <Link to="/shop" onClick={toggleMenu} className="block px-3 py-3 rounded-md text-base font-medium text-gray-800 hover:text-vandora-emerald hover:bg-gray-50 transition-colors">TIENDA</Link>
              <Link to="/story" onClick={toggleMenu} className="block px-3 py-3 rounded-md text-base font-medium text-gray-800 hover:text-vandora-emerald hover:bg-gray-50 transition-colors">HISTORIA</Link>
              <Link to="/contact" onClick={toggleMenu} className="block px-3 py-3 rounded-md text-base font-medium text-gray-800 hover:text-vandora-emerald hover:bg-gray-50 transition-colors">CONTACTO</Link>
              <Link to="/track-order" onClick={toggleMenu} className="block px-3 py-3 rounded-md text-base font-medium text-gray-800 hover:text-vandora-emerald hover:bg-gray-50 transition-colors">RASTREAR PEDIDO</Link>
              <div className="border-t border-gray-100 my-2 pt-2">
                <Link to="/login" onClick={toggleMenu} className="flex items-center px-3 py-3 rounded-md text-base font-medium text-gray-600 hover:text-vandora-emerald hover:bg-gray-50 transition-colors">
                  <User className="h-5 w-5 mr-3" /> MI CUENTA
                </Link>
                <button className="w-full text-left flex items-center px-3 py-3 rounded-md text-base font-medium text-gray-600 hover:text-vandora-emerald hover:bg-gray-50 transition-colors">
                  <Search className="h-5 w-5 mr-3" /> BUSCAR
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
