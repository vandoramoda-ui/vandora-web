import React, { useState, useEffect } from 'react';
import { Cookie, X, ShieldCheck, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('vandora-cookie-consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('vandora-cookie-consent', 'all');
    setIsVisible(false);
    setShowSettings(false);
  };

  const handleDecline = () => {
    localStorage.setItem('vandora-cookie-consent', 'essential');
    setIsVisible(false);
    setShowSettings(false);
  };

  const handleRejectAll = () => {
    localStorage.setItem('vandora-cookie-consent', 'none');
    setIsVisible(false);
    setShowSettings(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Settings Modal Overlay */}
          <AnimatePresence>
            {showSettings && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
              >
                <motion.div 
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl overflow-hidden relative"
                >
                  <button 
                    onClick={() => setShowSettings(false)}
                    className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                  
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-vandora-gold/10 p-3 rounded-2xl">
                      <ShieldCheck className="h-8 w-8 text-vandora-gold" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Ajustes de Privacidad</h2>
                      <p className="text-sm text-gray-500">Gestiona cómo florece tu información.</p>
                    </div>
                  </div>

                  <div className="space-y-6 mb-8">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                      <div>
                        <h4 className="font-bold text-sm text-gray-900">Cookies Esenciales</h4>
                        <p className="text-xs text-gray-500">Necesarias para el funcionamiento de la tienda.</p>
                      </div>
                      <div className="w-10 h-6 bg-vandora-emerald rounded-full flex items-center px-1">
                        <div className="w-4 h-4 bg-white rounded-full translate-x-4" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl opacity-60">
                      <div>
                        <h4 className="font-bold text-sm text-gray-900">Marketing y Análisis</h4>
                        <p className="text-xs text-gray-500">Nos ayudan a mejorar tu experiencia.</p>
                      </div>
                      <div className="w-10 h-6 bg-gray-200 rounded-full flex items-center px-1">
                        <div className="w-4 h-4 bg-white rounded-full" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={handleAccept}
                      className="bg-vandora-black text-white font-bold py-4 rounded-2xl hover:bg-gray-800 transition-all text-sm"
                    >
                      Aceptar Selección
                    </button>
                    <button 
                      onClick={handleDecline}
                      className="bg-gray-100 text-gray-700 font-bold py-4 rounded-2xl hover:bg-gray-200 transition-all text-sm"
                    >
                      Solo Esenciales
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-6 z-[60] max-w-sm w-full"
          >
            <div className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl overflow-hidden ring-1 ring-black/5">
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <div className="bg-vandora-emerald/10 p-2.5 rounded-xl">
                    <Cookie className="h-6 w-6 text-vandora-emerald" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-1.5">
                      Privacidad y Cookies <span className="text-[10px] bg-vandora-gold/20 text-vandora-gold px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">2026</span>
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Utilizamos cookies para personalizar tu experiencia y analizar nuestro tráfico. ¿Aceptas nuestro legado de florecimiento digital?
                    </p>
                  </div>
                  <button 
                    onClick={handleRejectAll}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                    title="Rechazar Todas"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-5 space-y-2">
                  <button
                    onClick={handleAccept}
                    className="w-full bg-vandora-black text-white text-xs font-bold py-3 px-4 rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-black/10"
                  >
                    Aceptar Todas
                    <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleRejectAll}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] font-bold py-2.5 px-3 rounded-xl transition-all"
                    >
                      Rechazar Todas
                    </button>
                    <button
                      onClick={() => setShowSettings(true)}
                      className="w-full border border-gray-200 hover:border-gray-300 text-gray-600 text-[10px] font-bold py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5"
                    >
                      <ShieldCheck className="h-3 w-3" />
                      Ajustes
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50/50 px-5 py-2.5 border-t border-gray-100 flex items-center justify-between">
                <a href="/politica-de-privacidad" className="text-[9px] text-gray-400 hover:text-vandora-emerald uppercase font-bold tracking-widest transition-colors">Política de Privacidad</a>
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-vandora-gold rounded-full" />
                  <div className="w-1 h-1 bg-vandora-emerald rounded-full" />
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
