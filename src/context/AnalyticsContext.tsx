import React, { createContext, useContext, useEffect, useState } from 'react';
import ReactGA from 'react-ga4';
import ReactPixel from 'react-facebook-pixel';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface AnalyticsContextType {
  trackEvent: (category: string, action: string, label?: string, value?: number) => void;
  trackPurchase: (transactionId: string, value: number, currency?: string) => void;
  trackQuizStart: (quizName: string) => void;
  trackQuizComplete: (quizName: string, result: string) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initAnalytics = async () => {
      try {
        const { data } = await supabase.from('app_settings').select('*');
        if (data) {
          const ga4Id = data.find(s => s.key === 'ga4_id')?.value;
          const pixelId = data.find(s => s.key === 'meta_pixel_id')?.value;

          if (ga4Id) {
            ReactGA.initialize(ga4Id);
            console.log('GA4 Initialized');
          }

          if (pixelId) {
            ReactPixel.init(pixelId);
            console.log('Meta Pixel Initialized');
          }

          setInitialized(true);
        }
      } catch (error) {
        console.error('Error initializing analytics:', error);
      }
    };

    initAnalytics();
  }, []);

  // Track Page Views
  useEffect(() => {
    if (initialized) {
      ReactGA.send({ hitType: "pageview", page: location.pathname + location.search });
      ReactPixel.pageView();
    }
  }, [location, initialized]);

  const trackEvent = (category: string, action: string, label?: string, value?: number) => {
    if (!initialized) return;
    
    ReactGA.event({ category, action, label, value });
    // Map generic events to Pixel standard events where possible, or custom
    ReactPixel.trackCustom(action, { category, label, value });
  };

  const trackPurchase = (transactionId: string, value: number, currency = 'USD') => {
    if (!initialized) return;

    ReactGA.event({
      category: "Ecommerce",
      action: "Purchase",
      value: value,
      label: transactionId
    });

    ReactPixel.track('Purchase', {
      value: value,
      currency: currency,
      content_ids: [transactionId],
      content_type: 'product'
    });
  };

  const trackQuizStart = (quizName: string) => {
    trackEvent('Quiz', 'Start', quizName);
    if (initialized) ReactPixel.trackCustom('QuizStart', { quiz_name: quizName });
  };

  const trackQuizComplete = (quizName: string, result: string) => {
    trackEvent('Quiz', 'Complete', `${quizName} - Result: ${result}`);
    if (initialized) ReactPixel.trackCustom('QuizComplete', { quiz_name: quizName, result });
  };

  return (
    <AnalyticsContext.Provider value={{ trackEvent, trackPurchase, trackQuizStart, trackQuizComplete }}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};
