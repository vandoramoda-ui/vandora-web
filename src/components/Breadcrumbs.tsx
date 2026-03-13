import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (location.pathname === '/' || pathnames.length === 0) return null;

  const breadcrumbMap: { [key: string]: string } = {
    'tienda': 'Tienda',
    'nuestra-historia': 'Nuestra Historia',
    'preguntas-frecuentes': 'Preguntas Frecuentes',
    'contacto': 'Contacto',
    'envio': 'Envíos y Devoluciones',
    'producto': 'Producto',
    'mi-cuenta': 'Mi Cuenta',
    'pagar': 'Finalizar Compra',
    'rastreo': 'Rastreo de Pedido'
  };

  return (
    <nav className="w-full py-2 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-[10px] md:text-xs text-gray-400 overflow-x-auto whitespace-nowrap hide-scrollbar" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        <li>
          <Link to="/" className="hover:text-vandora-emerald transition-colors flex items-center">
            <Home className="h-3 w-3 mr-1" />
            Inicio
          </Link>
        </li>
        {pathnames.map((value, index) => {
          const last = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          
          // Try to get a readable name, otherwise capitalize the value
          let displayName = breadcrumbMap[value] || value.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
          
          // Shorten long names if they don't have a map entry
          if (!breadcrumbMap[value] && displayName.length > 20) {
            displayName = displayName.substring(0, 20) + '...';
          }

          return (
            <li key={to} className="flex items-center">
              <ChevronRight className="h-4 w-4 mx-1 flex-shrink-0 text-gray-400" />
              {last ? (
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
  );
};

export default Breadcrumbs;
