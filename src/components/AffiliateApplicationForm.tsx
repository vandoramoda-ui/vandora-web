import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Send, CheckCircle, Loader2 } from 'lucide-react';

const AffiliateApplicationForm = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    instagram: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: submitError } = await supabase
        .from('affiliate_applications')
        .insert([
          {
            full_name: formData.name,
            email: formData.email,
            social_media: formData.instagram,
            message: formData.message,
            status: 'pending'
          }
        ]);

      if (submitError) throw submitError;
      setSubmitted(true);
    } catch (err: any) {
      console.error('Error submitting application:', err);
      // Fallback if table doesn't exist: save to contact_messages or similar if possible
      // For now, assume table exists as per plan approval.
      setError('Hubo un error al enviar tu solicitud. Por favor intenta más tarde.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-8 text-center">
        <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">¡Solicitud Enviada!</h3>
        <p className="text-gray-600">
          Gracias por tu interés en unirte a Vandora. Revisaremos tu perfil y nos pondremos en contacto contigo pronto.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
          <input
            type="text"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-vandora-emerald focus:border-vandora-emerald"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Tu nombre"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
          <input
            type="email"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-vandora-emerald focus:border-vandora-emerald"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="tu@email.com"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Instagram / Redes Sociales</label>
        <input
          type="text"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-vandora-emerald focus:border-vandora-emerald"
          value={formData.instagram}
          onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
          placeholder="@usuario"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">¿Por qué quieres ser parte de Vandora?</label>
        <textarea
          rows={4}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-vandora-emerald focus:border-vandora-emerald"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="Cuéntanos un poco sobre ti..."
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-vandora-emerald text-white font-bold py-3 px-6 rounded-full hover:bg-emerald-800 transition-colors flex items-center justify-center disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
        ) : (
          <Send className="w-5 h-5 mr-2" />
        )}
        Enviar Solicitud
      </button>
    </form>
  );
};

export default AffiliateApplicationForm;
