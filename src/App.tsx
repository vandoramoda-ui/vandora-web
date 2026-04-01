/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import PopupDisplay from './components/PopupDisplay';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import MyAccountPage from './pages/MyAccountPage';
import StoryPage from './pages/StoryPage';
import ContactPage from './pages/ContactPage';
import FAQPage from './pages/FAQPage';
import ShippingPage from './pages/ShippingPage';
import ThankYouPage from './pages/ThankYouPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import UpsellPage from './pages/UpsellPage';
import DownsellPage from './pages/DownsellPage';
import TermsPage from './pages/TermsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import RefundPolicyPage from './pages/RefundPolicyPage';

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

import ProtectedRoute from './components/ProtectedRoute';
import ResetPasswordPage from './pages/ResetPasswordPage';
import { AnalyticsProvider } from './context/AnalyticsContext';
import { AffiliateTracker } from './components/AffiliateTracker';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <AnalyticsProvider>
            <ScrollToTop />
            <AffiliateTracker />
            <Routes>
            {/* Public Routes with Layout */}
            <Route path="/" element={<Layout><HomePage /></Layout>} />
            <Route path="/tienda" element={<Layout><ShopPage /></Layout>} />
            <Route path="/tienda/:categoryName" element={<Layout><ShopPage /></Layout>} />
            <Route path="/producto/:categoria/:slug" element={<Layout><ProductDetailPage /></Layout>} />
            <Route path="/pagar" element={<Layout><CheckoutPage /></Layout>} />
            <Route path="/thank-you" element={<Layout><ThankYouPage /></Layout>} />
            <Route path="/nuestra-historia" element={<Layout><StoryPage /></Layout>} />
            <Route path="/contacto" element={<Layout><ContactPage /></Layout>} />
            <Route path="/preguntas-frecuentes" element={<Layout><FAQPage /></Layout>} />
            <Route path="/envio" element={<Layout><ShippingPage /></Layout>} />
            <Route path="/rastrear-pedido" element={<Layout><OrderTrackingPage /></Layout>} />
            <Route path="/mi-cuenta" element={<Layout><MyAccountPage /></Layout>} />
            <Route path="/politica-de-privacidad" element={<Layout><PrivacyPolicyPage /></Layout>} />
            <Route path="/politica-de-reembolso" element={<Layout><RefundPolicyPage /></Layout>} />
            <Route path="/terminos-y-condiciones" element={<Layout><TermsPage /></Layout>} />
            <Route path="/upsell" element={<UpsellPage />} />
            <Route path="/downsell" element={<DownsellPage />} />
            <Route path="/iniciar-sesion" element={<Layout><LoginPage /></Layout>} />
            <Route path="/restablecer-contrasena" element={<Layout><ResetPasswordPage /></Layout>} />
            <Route path="/administracion" element={
              <ProtectedRoute requireStaff>
                <AdminPage />
              </ProtectedRoute>
            } />
            {/* 404 Catch All */}
            <Route path="*" element={<Layout><NotFoundPage /></Layout>} />
          </Routes>
        </AnalyticsProvider>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
