import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Save, Loader2, BarChart, Sparkles, MessageSquare } from 'lucide-react';

const SettingsEditor = () => {
  const [settings, setSettings] = useState({
    ga4_id: '',
    meta_pixel_id: '',
    meta_capi_token: '',
    meta_test_event_code: '',
    openai_api_key: '',
    ai_agent_enabled: false,
    ai_welcome_message: '',
    ai_system_prompt: '',
    ai_provider: 'openai',
    ai_model: '',
    klaviyo_public_key: '',
    klaviyo_private_api_key: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchingModels, setFetchingModels] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);

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
        if (item.key === 'meta_capi_token') newSettings.meta_capi_token = item.value;
        if (item.key === 'meta_test_event_code') newSettings.meta_test_event_code = item.value;
        if (item.key === 'openai_api_key') newSettings.openai_api_key = item.value;
        if (item.key === 'ai_agent_enabled') newSettings.ai_agent_enabled = item.value;
        if (item.key === 'ai_welcome_message') newSettings.ai_welcome_message = item.value;
        if (item.key === 'ai_system_prompt') newSettings.ai_system_prompt = item.value;
        if (item.key === 'ai_provider') newSettings.ai_provider = item.value;
        if (item.key === 'ai_model') newSettings.ai_model = item.value;
        
        if (item.key === 'klaviyo_public_key') newSettings.klaviyo_public_key = item.value;
        if (item.key === 'klaviyo_private_api_key') newSettings.klaviyo_private_api_key = item.value;
        
        if (item.key === 'ai_available_models' && Array.isArray(item.value)) {
          setAvailableModels(item.value);
        }
      });
      setSettings(newSettings);
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleFetchModels = async () => {
    if (!settings.openai_api_key) {
      alert('Por favor ingresa primero la API Key.');
      return;
    }

    setFetchingModels(true);
    try {
      const provider = settings.ai_provider;
      let url = '';
      const headers: any = {
        'Authorization': `Bearer ${settings.openai_api_key}`
      };

      if (provider === 'openai') {
        url = 'https://api.openai.com/v1/models';
      } else {
        url = 'https://openrouter.ai/api/v1/models';
      }

      const response = await fetch(url, { headers });
      if (!response.ok) throw new Error('Error al obtener modelos. Verifica tu API Key.');

      const data = await response.json();
      let models: string[] = [];

      if (provider === 'openai') {
        models = data.data
          .filter((m: any) => m.id.includes('gpt') || m.id.includes('o1'))
          .map((m: any) => m.id)
          .sort();
      } else {
        models = data.data
          .map((m: any) => m.id)
          .sort();
      }

      setAvailableModels(models);
      
      // Cache models in database
      await supabase.from('app_settings').upsert(
        { key: 'ai_available_models', value: models },
        { onConflict: 'key' }
      );

      alert(`Se encontraron ${models.length} modelos disponibles y se guardaron en caché.`);
    } catch (error: any) {
      console.error('Fetch models error:', error);
      alert(error.message);
    } finally {
      setFetchingModels(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = [
        { key: 'ga4_id', value: settings.ga4_id },
        { key: 'meta_pixel_id', value: settings.meta_pixel_id },
        { key: 'meta_capi_token', value: settings.meta_capi_token },
        { key: 'meta_test_event_code', value: settings.meta_test_event_code },
        { key: 'openai_api_key', value: settings.openai_api_key },
        { key: 'ai_agent_enabled', value: settings.ai_agent_enabled },
        { key: 'ai_welcome_message', value: settings.ai_welcome_message },
        { key: 'ai_system_prompt', value: settings.ai_system_prompt },
        { key: 'ai_provider', value: settings.ai_provider },
        { key: 'ai_model', value: settings.ai_model },
        { key: 'klaviyo_public_key', value: settings.klaviyo_public_key },
        { key: 'klaviyo_private_api_key', value: settings.klaviyo_private_api_key }
      ];

      const { error } = await supabase.from('app_settings').upsert(updates, { onConflict: 'key' });
      if (error) throw error;

      alert('Configuración guardada correctamente.');
    } catch (error: any) {
      console.error('Error saving settings:', error);
      alert('Error al guardar: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando configuración...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Integrations & Analytics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
        <div className="flex items-center mb-6 text-vandora-emerald border-b pb-4">
          <BarChart className="h-6 w-6 mr-2" />
          <h2 className="text-xl font-serif text-gray-800">Integraciones y Analítica</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Google Analytics 4 (ID)</label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">G-</span>
              <input
                type="text"
                name="ga4_id"
                value={settings.ga4_id}
                onChange={handleChange}
                placeholder="XXXXXXXXXX"
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-vandora-emerald focus:border-vandora-emerald sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meta Pixel ID</label>
            <input
              type="text"
              name="meta_pixel_id"
              value={settings.meta_pixel_id}
              onChange={handleChange}
              placeholder="XXXXXXXXXXXXXXX"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-vandora-emerald focus:border-vandora-emerald sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              Meta CAPI Access Token
              <span className="ml-2 text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">RECOMENDADO</span>
            </label>
            <input
              type="password"
              name="meta_capi_token"
              value={settings.meta_capi_token}
              onChange={handleChange}
              placeholder="EAAB..."
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-vandora-emerald focus:border-vandora-emerald sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Test Event Code (CAPI)</label>
            <input
              type="text"
              name="meta_test_event_code"
              value={settings.meta_test_event_code}
              onChange={handleChange}
              placeholder="TESTXXXXX"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-vandora-emerald focus:border-vandora-emerald sm:text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">Úsalo solo para verificar eventos en tiempo real.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Klaviyo Public API Key</label>
            <input
              type="text"
              name="klaviyo_public_key"
              value={settings.klaviyo_public_key}
              onChange={handleChange}
              placeholder="Ej: AB12CD"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-vandora-emerald focus:border-vandora-emerald sm:text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">Necesaria para el seguimiento de compras y carritos abandonados.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Klaviyo Private API Key</label>
            <input
              type="password"
              name="klaviyo_private_api_key"
              value={settings.klaviyo_private_api_key}
              onChange={handleChange}
              placeholder="pk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-vandora-emerald focus:border-vandora-emerald sm:text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">Necesaria para sincronizar el catálogo de productos.</p>
          </div>
        </div>
      </div>

      {/* AI Configuration */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
        <div className="flex items-center mb-6 text-vandora-emerald border-b pb-4">
          <Sparkles className="h-6 w-6 mr-2" />
          <h2 className="text-xl font-serif text-gray-800">Configuración de Inteligencia Artificial</h2>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg border border-emerald-100">
            <div className="flex items-center">
              <MessageSquare className="h-5 w-5 text-vandora-emerald mr-3" />
              <div>
                <p className="text-sm font-bold text-gray-800">Burbuja de Chat (IA)</p>
                <p className="text-xs text-gray-500">Activa o desactiva el asistente virtual en la tienda.</p>
              </div>
            </div>
            <select
              name="ai_agent_enabled"
              value={settings.ai_agent_enabled}
              onChange={handleChange}
              className="rounded-md border-gray-300 shadow-sm focus:ring-vandora-emerald focus:border-vandora-emerald text-sm"
            >
              <option value="true">Activado</option>
              <option value="false">Desactivado</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor de IA</label>
              <select
                name="ai_provider"
                value={settings.ai_provider}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-vandora-emerald focus:border-vandora-emerald sm:text-sm"
              >
                <option value="openai">OpenAI (Oficial)</option>
                <option value="openrouter">OpenRouter (Multimodelo)</option>
              </select>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">Modelo de IA</label>
                <button
                  type="button"
                  onClick={handleFetchModels}
                  disabled={fetchingModels || !settings.openai_api_key}
                  className="text-[10px] font-bold uppercase tracking-wider text-vandora-emerald hover:text-emerald-800 flex items-center transition-colors disabled:opacity-50"
                >
                  {fetchingModels ? <Loader2 className="animate-spin h-3 w-3 mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
                  Cargar Modelos
                </button>
              </div>
              <div className="relative">
                <select
                  name="ai_model"
                  value={settings.ai_model}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-vandora-emerald focus:border-vandora-emerald sm:text-sm"
                >
                  <option value="">Selecciona un modelo...</option>
                  {/* Static defaults for immediate use if cache is empty */}
                  {!availableModels.length && (
                    <>
                      <option value="gpt-4o">gpt-4o</option>
                      <option value="gpt-4o-mini">gpt-4o-mini</option>
                      <option value="o1-preview">o1-preview</option>
                      <option value="o1-mini">o1-mini</option>
                    </>
                  )}
                  {availableModels.map(model => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">API Key (OpenAI o OpenRouter)</label>
            <input
              type="password"
              name="openai_api_key"
              value={settings.openai_api_key}
              onChange={handleChange}
              placeholder="sk-..."
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-vandora-emerald focus:border-vandora-emerald sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje de Bienvenida</label>
            <input
              type="text"
              name="ai_welcome_message"
              value={settings.ai_welcome_message}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-vandora-emerald focus:border-vandora-emerald sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prompt del Sistema (Personalidad)</label>
            <textarea
              name="ai_system_prompt"
              value={settings.ai_system_prompt}
              onChange={handleChange}
              rows={4}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-vandora-emerald focus:border-vandora-emerald sm:text-sm"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end sticky bottom-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-vandora-emerald text-white px-8 py-3 rounded-full hover:bg-emerald-800 flex items-center shadow-lg transform transition active:scale-95 disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Save className="h-5 w-5 mr-2" />}
          Guardar Cambios
        </button>
      </div>
    </div>
  );
};

export default SettingsEditor;
