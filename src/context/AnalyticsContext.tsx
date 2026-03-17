import React, { createContext, useContext, useEffect, useState } from 'react';
import ReactGA from 'react-ga4';
import ReactPixel from 'react-facebook-pixel';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface AnalyticsContextType {
  trackEvent: (category: string, action: string, label?: string, value?: number, eventId?: string) => void;
  trackStandardEvent: (eventName: string, params?: any) => void;
  trackPurchase: (transactionId: string, value: number, currency?: string, eventId?: string, extraUserData?: any) => void;
  trackQuizStart: (quizName: string) => void;
  trackQuizComplete: (quizName: string, result: string) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { user, profile } = useAuth();
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
          }

          if (pixelId) {
            ReactPixel.init(pixelId);
          }

          setInitialized(true);
        }
      } catch (error) {
        console.error('Error initializing analytics:', error);
      }
    };

    initAnalytics();
  }, []);

  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return null;
  };

  const generateEventId = (prefix = 'ev') => {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  };

  const trackCAPI = async (eventName: string, eventId: string, params: any = {}, extraUserData: any = {}) => {
    try {
      const fbc = getCookie('_fbc');
      const fbp = getCookie('_fbp');

      // We send the data to our Supabase Edge Function
      supabase.functions.invoke('meta-capi', {
        body: { 
          eventName, 
          eventId, 
          params, 
          url: window.location.href,
          userData: {
            email: user?.email || extraUserData?.email || null,
            phone: profile?.phone || extraUserData?.phone || null,
            fbc,
            fbp,
          }
        }
      }).catch(err => console.warn('CAPI error:', err));
    } catch (error) {
      console.warn('CAPI track error:', error);
    }
  };

  // Track Page Views
  useEffect(() => {
    if (initialized) {
      ReactGA.send({ hitType: "pageview", page: location.pathname + location.search });
      ReactPixel.pageView();
    }
  }, [location, initialized]);

  const trackEvent = (category: string, action: string, label?: string, value?: number, eventId?: string) => {
    if (!initialized) return;
    
    const evId = eventId || generateEventId();
    
    ReactGA.event({ category, action, label, value });
    // @ts-ignore - Meta Pixel supports 3rd arg for eventID but types may be limited
    ReactPixel.trackCustom(action, { category, label, value }, { eventID: evId });
    trackCAPI(action, evId, { category, label, value });
  };

  const trackStandardEvent = (eventName: string, params: any = {}, customEventId?: string) => {
    if (!initialized) return;

    // Use custom event ID if provided (e.g. view-ID-time) or generate one
    const eventId = customEventId || generateEventId(eventName.toLowerCase());

    // GA4 Mapping
    ReactGA.event({
      category: 'MetaStandard',
      action: eventName,
      ...params
    });

    // Meta Pixel
    // @ts-ignore - Meta Pixel supports 3rd arg for eventID
    ReactPixel.track(eventName, params, { eventID: eventId });

    // Meta CAPI
    trackCAPI(eventName, eventId, params);
  };

  const trackPurchase = (transactionId: string, value: number, currency = 'USD', eventId?: string, extraUserData?: any) => {
    if (!initialized) return;

    const evId = eventId || `purchase_${transactionId}`;

    ReactGA.event({
      category: "Ecommerce",
      action: "Purchase",
      value: value,
      label: transactionId
    });

    const params = {
      value: value,
      currency: currency,
      content_ids: [transactionId],
      content_type: 'product'
    };

    // @ts-ignore - Meta Pixel supports 3rd arg for eventID
    ReactPixel.track('Purchase', params, { eventID: evId });
    trackCAPI('Purchase', evId, params, extraUserData);
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
    <AnalyticsContext.Provider value={{ trackEvent, trackStandardEvent, trackPurchase, trackQuizStart, trackQuizComplete }}>
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
