import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Check, X, Clock, Instagram, Mail, User } from 'lucide-react';

const AffiliateManagement = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('affiliate_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('affiliate_applications')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      setApplications(prev => prev.map(app => app.id === id ? { ...app, status } : app));
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Error al actualizar el estado');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando solicitudes...</div>;

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidata</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Redes Sociales</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mensaje</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {applications.map((app) => (
            <tr key={app.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center text-vandora-emerald">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{app.full_name}</div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <Mail className="h-3 w-3 mr-1" /> {app.email}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <a 
                  href={`https://instagram.com/${app.social_media.replace('@', '')}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-pink-600 flex items-center hover:underline"
                >
                  <Instagram className="h-4 w-4 mr-1" /> {app.social_media}
                </a>
              </td>
              <td className="px-6 py-4">
                <p className="text-sm text-gray-600 max-w-xs truncate" title={app.message}>
                  {app.message}
                </p>
              </td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 text-xs font-bold rounded-full uppercase ${
                  app.status === 'approved' ? 'bg-green-100 text-green-800' :
                  app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {app.status === 'approved' ? 'Aprobada' :
                   app.status === 'rejected' ? 'Rechazada' :
                   'Pendiente'}
                </span>
              </td>
              <td className="px-6 py-4 text-right space-x-2">
                {app.status === 'pending' && (
                  <>
                    <button 
                      onClick={() => updateStatus(app.id, 'approved')}
                      className="text-green-600 hover:bg-green-50 p-1 rounded-full transition-colors"
                      title="Aprobar"
                    >
                      <Check className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => updateStatus(app.id, 'rejected')}
                      className="text-red-600 hover:bg-red-50 p-1 rounded-full transition-colors"
                      title="Rechazar"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </>
                )}
                <div className="text-[10px] text-gray-400 mt-1 flex items-center justify-end">
                  <Clock className="h-3 w-3 mr-1" /> {new Date(app.created_at).toLocaleDateString()}
                </div>
              </td>
            </tr>
          ))}
          {applications.length === 0 && (
            <tr>
              <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                No hay solicitudes de afiliados pendientes.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AffiliateManagement;
