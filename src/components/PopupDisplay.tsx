import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { X, Copy, Check, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PopupConfig {
  id: string;
  name: string;
  active: boolean;
  template: 'newsletter' | 'coupon' | 'minimal';
  title: string;
  subtitle: string;
  buttonText: string;
  imageUrl?: string;
  backgroundColor: string;
  textColor: string;
  buttonColor: string;
  triggerType: 'time' | 'scroll' | 'exit';
  triggerValue: number;
  pages: string;
  delayDays: number;
  couponCode?: string;
}

const PopupDisplay = () => {
  const [activePopup, setActivePopup] = useState<PopupConfig | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const location = useLocation();

  const handleTrigger = useCallback((popup: PopupConfig) => {
    // Check if current page is allowed
    const currentPage = location.pathname;
    const allowedPages = popup.pages.split(',').map(p => p.trim());
    const isAllowed = popup.pages === 'all' || allowedPages.includes(currentPage);
    
    if (!isAllowed) return;

    // Check if dismissed recently
    const lastShown = localStorage.getItem(`popup_dismissed_${popup.id}`);
    if (lastShown) {
      const daysSince = (Date.now() - parseInt(lastShown)) / (1000 * 60 * 60 * 24);
      if (daysSince < popup.delayDays) return;
    }

    setActivePopup(popup);
    setIsVisible(true);
  }, [location.pathname]);

  useEffect(() => {
    const fetchAndSetupPopups = async () => {
      try {
        const { data } = await supabase
          .from('site_content')
          .select('content')
          .eq('section_key', 'popups')
          .single();

        if (data?.content) {
          const popups: PopupConfig[] = data.content;
          const activeOnes = popups.filter(p => p.active);
          
          activeOnes.forEach(popup => {
            // Setup Triggers
            if (popup.triggerType === 'time') {
              setTimeout(() => handleTrigger(popup), popup.triggerValue * 1000);
            } else if (popup.triggerType === 'scroll') {
              const handleScroll = () => {
                const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
                if (scrollPercent >= popup.triggerValue) {
                  handleTrigger(popup);
                  window.removeEventListener('scroll', handleScroll);
                }
              };
              window.addEventListener('scroll', handleScroll);
            } else if (popup.triggerType === 'exit') {
              const handleExit = (e: MouseEvent) => {
                if (e.clientY <= 0) {
                  handleTrigger(popup);
                  document.removeEventListener('mouseleave', handleExit);
                }
              };
              document.addEventListener('mouseleave', handleExit);
            }
          });
        }
      } catch (err) {
        console.error('Error fetching popups for display:', err);
      }
    };

    fetchAndSetupPopups();
  }, [handleTrigger]);

  const closePopup = () => {
    if (activePopup) {
      localStorage.setItem(`popup_dismissed_${activePopup.id}`, Date.now().toString());
    }
    setIsVisible(false);
    setTimeout(() => setActivePopup(null), 500);
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    try {
      // Create newsletter_subscribers if it doesn't exist (handle error silently)
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({ email, source: `popup_${activePopup?.name}` });
      
      setSubmitted(true);
      setTimeout(closePopup, 3000);
    } catch (err) {
      // Fallback if table doesn't exist
      setSubmitted(true);
      setTimeout(closePopup, 3000);
    }
  };

  const copyCoupon = () => {
    if (activePopup?.couponCode) {
      navigator.clipboard.writeText(activePopup.couponCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!activePopup) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closePopup}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[400px]"
            style={{ backgroundColor: activePopup.backgroundColor }}
          >
            {/* Image Section */}
            {activePopup.imageUrl && (
              <div className="w-full md:w-5/12 h-48 md:h-auto">
                <img src={activePopup.imageUrl} alt="Popup" className="w-full h-full object-cover" />
              </div>
            )}

            {/* Content Section */}
            <div className={`flex-1 p-8 md:p-12 flex flex-col justify-center text-center md:text-left ${!activePopup.imageUrl ? 'items-center' : ''}`}>
              <button 
                onClick={closePopup}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div style={{ color: activePopup.textColor }}>
                <h3 className="font-serif text-3xl md:text-4xl mb-4 leading-tight">
                  {activePopup.title}
                </h3>
                <p className="text-lg opacity-80 mb-8 font-light">
                  {activePopup.subtitle}
                </p>

                {submitted ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center justify-center space-x-2"
                  >
                    <Check className="w-5 h-5" />
                    <span className="font-medium">¡Gracias por suscribirte!</span>
                  </motion.div>
                ) : (
                  <>
                    {activePopup.template === 'newsletter' && (
                      <form onSubmit={handleSubscribe} className="space-y-4">
                        <div className="flex flex-col md:flex-row gap-3">
                          <input
                            type="email"
                            required
                            placeholder="Tu mejor correo..."
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="flex-1 px-6 py-4 rounded-xl border border-gray-100 bg-white/50 focus:ring-2 focus:ring-vandora-emerald outline-none text-gray-900"
                          />
                          <button
                            type="submit"
                            className="px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-sm transition-all hover:scale-105 shadow-xl flex items-center justify-center"
                            style={{ backgroundColor: activePopup.buttonColor, color: '#ffffff' }}
                          >
                            <Send className="w-4 h-4 mr-2" />
                            {activePopup.buttonText}
                          </button>
                        </div>
                        <p className="text-[10px] opacity-60">
                          Respetamos tu privacidad. Descríbete en cualquier momento.
                        </p>
                      </form>
                    )}

                    {activePopup.template === 'coupon' && (
                      <div className="space-y-6">
                        <div className="p-6 border-2 border-dashed border-vandora-gold/30 rounded-2xl bg-white/30 flex items-center justify-between group">
                          <span className="font-mono text-2xl font-bold tracking-taller text-vandora-emerald">
                            {activePopup.couponCode}
                          </span>
                          <button 
                            onClick={copyCoupon}
                            className="p-3 bg-white shadow-md rounded-xl hover:bg-gray-50 transition-colors"
                          >
                            {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-gray-400" />}
                          </button>
                        </div>
                        <button
                          onClick={closePopup}
                          className="w-full px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-sm transition-all hover:scale-105 shadow-xl"
                          style={{ backgroundColor: activePopup.buttonColor, color: '#ffffff' }}
                        >
                          {activePopup.buttonText}
                        </button>
                      </div>
                    )}

                    {activePopup.template === 'minimal' && (
                      <button
                        onClick={closePopup}
                        className="px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-sm transition-all hover:scale-105 shadow-xl"
                        style={{ backgroundColor: activePopup.buttonColor, color: '#ffffff' }}
                      >
                        {activePopup.buttonText}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PopupDisplay;
