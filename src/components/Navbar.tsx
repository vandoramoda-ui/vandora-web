import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Menu, X, Search, User, LogOut, Settings } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { items, setIsOpen: setIsCartOpen } = useCart();
  const { user, profile, isStaff, signOut } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = async () => {
    await signOut();
    toggleMenu();
    navigate('/');
  };

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

      {/* Mobile/Desktop Menu Drawer */}
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
              <Link to="/tienda" onClick={toggleMenu} className="block px-3 py-3 rounded-md text-base font-medium text-gray-800 hover:text-vandora-emerald hover:bg-gray-50 transition-colors">TIENDA</Link>
              <Link to="/nuestra-historia" onClick={toggleMenu} className="block px-3 py-3 rounded-md text-base font-medium text-gray-800 hover:text-vandora-emerald hover:bg-gray-50 transition-colors">HISTORIA</Link>
              <Link to="/contacto" onClick={toggleMenu} className="block px-3 py-3 rounded-md text-base font-medium text-gray-800 hover:text-vandora-emerald hover:bg-gray-50 transition-colors">CONTACTO</Link>
              <Link to="/rastrear-pedido" onClick={toggleMenu} className="block px-3 py-3 rounded-md text-base font-medium text-gray-800 hover:text-vandora-emerald hover:bg-gray-50 transition-colors">RASTREAR PEDIDO</Link>
              <div className="border-t border-gray-100 my-2 pt-2">
                {!user ? (
                  <Link to="/iniciar-sesion" onClick={toggleMenu} className="flex items-center px-3 py-3 rounded-md text-base font-medium text-gray-600 hover:text-vandora-emerald hover:bg-gray-50 transition-colors">
                    <User className="h-5 w-5 mr-3" /> INICIAR SESIÓN
                  </Link>
                ) : (
                  <>
                    {isStaff ? (
                      <Link to="/administracion" onClick={toggleMenu} className="flex items-center px-3 py-3 rounded-md text-base font-medium text-vandora-emerald bg-emerald-50 hover:bg-emerald-100 transition-colors mb-2">
                        <Settings className="h-5 w-5 mr-3" /> PANEL ADMINISTRADOR
                      </Link>
                    ) : (
                      <Link to="/mi-cuenta" onClick={toggleMenu} className="flex items-center px-3 py-3 rounded-md text-base font-medium text-gray-600 hover:text-vandora-emerald hover:bg-gray-50 transition-colors mb-2">
                        <User className="h-5 w-5 mr-3" /> MI CUENTA
                      </Link>
                    )}
                    <button onClick={handleLogout} className="w-full text-left flex items-center px-3 py-3 rounded-md text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors">
                      <LogOut className="h-5 w-5 mr-3" /> CERRAR SESIÓN
                    </button>
                  </>
                )}
                <button className="w-full mt-2 text-left flex items-center px-3 py-3 rounded-md text-base font-medium text-gray-600 hover:text-vandora-emerald hover:bg-gray-50 transition-colors">
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
