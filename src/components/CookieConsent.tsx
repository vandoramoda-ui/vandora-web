import React, { useState, useEffect } from 'react';
import { Cookie, X, ShieldCheck, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

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
  };

  const handleDecline = () => {
    localStorage.setItem('vandora-cookie-consent', 'essential');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
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
                  onClick={() => setIsVisible(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
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
                    onClick={handleDecline}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] font-bold py-2.5 px-3 rounded-xl transition-all"
                  >
                    Solo Esenciales
                  </button>
                  <button
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
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
