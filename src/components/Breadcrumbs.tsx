import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const BREADCRUMB_MAP: Record<string, string> = {
  'tienda': 'Tienda',
  'nuestra-historia': 'Nuestra Historia',
  'preguntas-frecuentes': 'Preguntas Frecuentes',
  'contacto': 'Contacto',
  'envio': 'Envíos y Devoluciones',
  'producto': 'Tienda',
  'product': 'Tienda',
  'mi-cuenta': 'Mi Cuenta',
  'pagar': 'Finalizar Compra',
  'rastrear-pedido': 'Rastreo de Pedido',
  'thank-you': 'Gracias por tu Compra',
  'iniciar-sesion': 'Iniciar Sesión',
  'politica-de-privacidad': 'Política de Privacidad',
  'terminos-y-condiciones': 'Términos y Condiciones'
};

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Don't show breadcrumbs on home or empty paths
  if (!location.pathname || location.pathname === '/' || pathnames.length === 0) {
    return null;
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Inicio",
        "item": window.location.origin
      },
      ...pathnames.map((value, index) => {
        const to = `${window.location.origin}/${pathnames.slice(0, index + 1).join('/')}`;
        const decodedValue = decodeURIComponent(value);
        const mappedName = BREADCRUMB_MAP[decodedValue];
        let name = mappedName || decodedValue.replace(/-/g, ' ');
        
        // Handle last item name logic similar to the UI
        if (index === pathnames.length - 1 && (pathnames.includes('producto') || pathnames.includes('product')) && !mappedName) {
          const pageTitle = document.title.split(' | ')[0];
          if (pageTitle && !['Vandora', 'Tienda', 'Inicio'].some(t => pageTitle.includes(t))) {
            name = pageTitle;
          }
        }

        return {
          "@type": "ListItem",
          "position": index + 2,
          "name": name,
          "item": to.toLowerCase()
        };
      })
    ]
  };

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      </Helmet>
      <nav className="w-full py-2 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-[10px] md:text-xs text-gray-400 overflow-x-auto whitespace-nowrap" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        <li>
          <Link to="/" className="hover:text-vandora-emerald transition-colors flex items-center">
            <Home size={12} className="mr-1" />
            <span>Inicio</span>
          </Link>
        </li>
        {pathnames.map((value: string, index: number) => {
          const isLast = index === pathnames.length - 1;
          const decodedValue = decodeURIComponent(value);
          
          // Determine the correct URL for the breadcrumb level
          let to = `/${pathnames.slice(0, index + 1).join('/')}`;
          
          // Redirect intermediate "product(o)" segments to the shop
          if (value === 'producto' || value === 'product') {
            to = '/tienda';
          } else if (index > 0 && (pathnames[index - 1] === 'producto' || pathnames[index - 1] === 'product') && !isLast) {
            // Handle category segments in /producto/:categoria/:slug
            to = `/tienda/${value}`;
          }
          
          // Get readable name from map or format the slug
          const mappedName = BREADCRUMB_MAP[decodedValue];
          let displayName = mappedName || decodedValue.split('-').map((word: string) => {
            if (!word) return '';
            // If the word reflects a single character mangled to a space (e.g. "o" from "paño" -> "pa-o")
            // it will stay as "O" after capitalization.
            return word.charAt(0).toUpperCase() + word.slice(1);
          }).join(' ');

          // Fallback: if it's the last element of a product detail page,
          // use the page title (product name).
          if (isLast && (pathnames.includes('producto') || pathnames.includes('product')) && !mappedName) {
            const pageTitle = document.title.split(' | ')[0];
            const genericTitles = ['Vandora', 'Tienda', 'Inicio', 'Cargando', 'Moda Ecuatoriana'];
            
            // Only use pageTitle if it's not generic branding or boilerplate
            const isGeneric = genericTitles.some(t => pageTitle.toLowerCase().includes(t.toLowerCase()));
            
            if (pageTitle && !isGeneric) {
               displayName = pageTitle;
            }
          }

          // Truncate only if it's not the last element and still very long
          if (!mappedName && displayName.length > 30) {
            displayName = `${displayName.substring(0, 27)}...`;
          }

          return (
            <li key={`bc-${index}-${to}`} className="flex items-center">
              <ChevronRight size={16} className="mx-1 flex-shrink-0 text-gray-400" />
              {isLast ? (
                <span className="font-medium text-vandora-black truncate max-w-[150px] sm:max-w-none">
                  {displayName}
                </span>
              ) : (
                <Link to={to} className="hover:text-vandora-emerald transition-colors capitalize">
                  {displayName}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
      </nav>
    </>
  );
};

export default Breadcrumbs;
