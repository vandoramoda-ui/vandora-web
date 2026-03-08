import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Save, Loader2, BarChart } from 'lucide-react';

const SettingsEditor = () => {
  const [settings, setSettings] = useState({
    ga4_id: '',
    meta_pixel_id: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data } = await supabase.from('app_settings').select('*');
    if (data) {
      const newSettings = { ...settings };
      data.forEach(item => {
        if (item.key === 'ga4_id') newSettings.ga4_id = item.value;
        if (item.key === 'meta_pixel_id') newSettings.meta_pixel_id = item.value;
      });
      setSettings(newSettings);
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = [
        { key: 'ga4_id', value: settings.ga4_id },
        { key: 'meta_pixel_id', value: settings.meta_pixel_id }
      ];

      const { error } = await supabase.from('app_settings').upsert(updates);
      if (error) throw error;
      
      alert('Configuración guardada correctamente. Los cambios pueden tardar unos minutos en reflejarse.');
    } catch (error: any) {
      console.error('Error saving settings:', error);
      alert('Error al guardar: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Cargando configuración...</div>;

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8">
      <div className="flex items-center mb-6 text-vandora-emerald">
        <BarChart className="h-6 w-6 mr-2" />
        <h2 className="text-xl font-bold text-gray-800">Integraciones y Analítica</h2>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Google Analytics 4 (Measurement ID)</label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
              G-
            </span>
            <input
              type="text"
              name="ga4_id"
              value={settings.ga4_id}
              onChange={handleChange}
              placeholder="XXXXXXXXXX"
              className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-vandora-emerald focus:border-vandora-emerald sm:text-sm"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">Ejemplo: G-1234567890</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Meta Pixel ID (Facebook Ads)</label>
          <input
            type="text"
            name="meta_pixel_id"
            value={settings.meta_pixel_id}
            onChange={handleChange}
            placeholder="123456789012345"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-vandora-emerald focus:border-vandora-emerald sm:text-sm"
          />
          <p className="mt-1 text-xs text-gray-500">El ID numérico de tu Pixel de Facebook.</p>
        </div>

        <div className="pt-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-vandora-emerald text-white px-6 py-2 rounded-md hover:bg-emerald-800 flex items-center shadow-sm disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Guardar Configuración
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsEditor;
