import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const TRACKING_PARAM = 't';
const STORAGE_KEY = 'raider_tracking_id';
const EXPIRY_DAYS = 30;

export const AffiliateTracker = () => {
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const trackingId = searchParams.get(TRACKING_PARAM);

    if (trackingId) {
      console.log('Affiliate tracking ID detected:', trackingId);
      const expiry = new Date().getTime() + EXPIRY_DAYS * 24 * 60 * 60 * 1000;
      const data = {
        value: trackingId,
        expiry: expiry
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [location]);

  return null;
};

export const getAffiliateId = (): string | null => {
  const itemStr = localStorage.getItem(STORAGE_KEY);
  if (!itemStr) return null;

  try {
    const item = JSON.parse(itemStr);
    const now = new Date().getTime();
    if (now > item.expiry) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return item.value;
  } catch (e) {
    return null;
  }
};
