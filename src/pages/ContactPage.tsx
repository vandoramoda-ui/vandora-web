import React from 'react';
import SEO from '../components/SEO';

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-white py-20 px-4">
      <SEO title="Contacto" description="Contáctanos para cualquier duda o consulta sobre nuestros productos." />
      <div className="max-w-3xl mx-auto">
        <h1 className="font-serif text-4xl text-vandora-emerald mb-8 text-center">Contáctanos</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h3 className="font-serif text-xl mb-4">Visítanos</h3>
            <p className="text-gray-600 mb-2">Av. Amazonas y Naciones Unidas</p>
            <p className="text-gray-600 mb-2">Quito, Ecuador</p>
            <p className="text-gray-600">Lunes a Sábado: 10am - 8pm</p>
          </div>
          <div>
            <h3 className="font-serif text-xl mb-4">Escríbenos</h3>
            <p className="text-gray-600 mb-2">hola@vandora.com</p>
            <p className="text-gray-600">+593 99 999 9999</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
