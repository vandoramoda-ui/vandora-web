import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Save, CheckCircle, AlertCircle } from 'lucide-react';

interface CheckoutSettings {
  fields: {
    firstName: { enabled: boolean; required: boolean; label: string };
    lastName: { enabled: boolean; required: boolean; label: string };
    phone: { enabled: boolean; required: boolean; label: string };
    email: { enabled: boolean; required: boolean; label: string };
    province: { enabled: boolean; required: boolean; label: string };
    city: { enabled: boolean; required: boolean; label: string };
    sector: { enabled: boolean; required: boolean; label: string };
    address: { enabled: boolean; required: boolean; label: string };
    reference: { enabled: boolean; required: boolean; label: string };
    company: { enabled: boolean; required: boolean; label: string };
    address2: { enabled: boolean; required: boolean; label: string };
    postalCode: { enabled: boolean; required: boolean; label: string };
  };
  paymentMethods: {
    transfer: boolean;
    cash: boolean; // COD
    card: boolean; // Placeholder for Stripe/etc
  };
  transferDetails: string; // Legacy field, kept for compatibility
  banks: { name: string; details: string }[]; // New field for multiple banks
  shippingRules: {
    freeShippingThreshold: number;
    codCities: string[]; // Cities where COD is allowed
    freeShippingCities: string[]; // Cities where shipping is free regardless of threshold (optional)
  };
}

const DEFAULT_SETTINGS: CheckoutSettings = {
  fields: {
    firstName: { enabled: true, required: true, label: 'Nombres' },
    lastName: { enabled: true, required: true, label: 'Apellidos' },
    phone: { enabled: true, required: true, label: 'Teléfono / WhatsApp' },
    email: { enabled: true, required: true, label: 'Correo Electrónico' },
    province: { enabled: true, required: true, label: 'Provincia' },
    city: { enabled: true, required: true, label: 'Ciudad' },
    sector: { enabled: true, required: true, label: 'Sector / Barrio' },
    address: { enabled: true, required: true, label: 'Dirección Exacta' },
    reference: { enabled: true, required: true, label: 'Referencia' },
    company: { enabled: true, required: false, label: 'Empresa' },
    address2: { enabled: true, required: false, label: 'Apartamento / Suite' },
    postalCode: { enabled: false, required: false, label: 'Código Postal' },
  },
  paymentMethods: {
    transfer: true,
    cash: true,
    card: false,
  },
  transferDetails: "Banco Pichincha\nCuenta Corriente: 1234567890\nNombre: Vandora Moda\nRUC: 1790000000001",
  banks: [
    { name: 'Banco Pichincha', details: 'Cuenta Corriente: 1234567890\nNombre: Vandora Moda\nRUC: 1790000000001' },
    { name: 'Banco Guayaquil', details: 'Cuenta Ahorros: 0987654321\nNombre: Vandora Moda\nRUC: 1790000000001' }
  ],
  shippingRules: {
    freeShippingThreshold: 100,
    codCities: ['Quito', 'Guayaquil', 'Cuenca'],
    freeShippingCities: [],
  },
};

const CheckoutSettingsEditor = () => {
  const [settings, setSettings] = useState<CheckoutSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'checkout_config')
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setSettings({ ...DEFAULT_SETTINGS, ...data.value });
      }
    } catch (error) {
      console.error('Error fetching checkout settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const { error } = await supabase
        .from('app_settings')
        .upsert({ 
          key: 'checkout_config', 
          value: settings 
        }, { onConflict: 'key' });

      if (error) throw error;
      setMessage({ type: 'success', text: 'Configuración guardada correctamente' });
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Error al guardar la configuración' });
    } finally {
      setSaving(false);
    }
  };

  const handleFieldUpdate = (fieldKey: keyof CheckoutSettings['fields'], property: 'enabled' | 'required' | 'label', value: any) => {
    setSettings(prev => ({
      ...prev,
      fields: {
        ...prev.fields,
        [fieldKey]: {
          ...prev.fields[fieldKey],
          [property]: value
        }
      }
    }));
  };

  const handlePaymentToggle = (method: keyof CheckoutSettings['paymentMethods']) => {
    setSettings(prev => ({
      ...prev,
      paymentMethods: {
        ...prev.paymentMethods,
        [method]: !prev.paymentMethods[method]
      }
    }));
  };

  const handleCityChange = (type: 'codCities' | 'freeShippingCities', value: string) => {
    const cities = value.split(',').map(c => c.trim()).filter(c => c !== '');
    setSettings(prev => ({
      ...prev,
      shippingRules: {
        ...prev.shippingRules,
        [type]: cities
      }
    }));
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando configuración...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <Settings className="mr-2 h-5 w-5 text-vandora-emerald" />
          Configuración del Checkout
        </h2>

        {message && (
          <div className={`p-4 mb-6 rounded-md flex items-center ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message.type === 'success' ? <CheckCircle className="h-5 w-5 mr-2" /> : <AlertCircle className="h-5 w-5 mr-2" />}
            {message.text}
          </div>
        )}

        {/* Fields Configuration */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-800 mb-4 border-b pb-2">Campos del Formulario</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campo</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Habilitado</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Obligatorio</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Etiqueta Personalizada</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(settings.fields).map(([key, field]) => (
                  <tr key={key}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <input
                        type="checkbox"
                        checked={field.enabled}
                        onChange={(e) => handleFieldUpdate(key as keyof CheckoutSettings['fields'], 'enabled', e.target.checked)}
                        className="h-4 w-4 text-vandora-emerald focus:ring-vandora-emerald border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => handleFieldUpdate(key as keyof CheckoutSettings['fields'], 'required', e.target.checked)}
                        disabled={!field.enabled}
                        className="h-4 w-4 text-vandora-emerald focus:ring-vandora-emerald border-gray-300 rounded disabled:opacity-50"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => handleFieldUpdate(key as keyof CheckoutSettings['fields'], 'label', e.target.value)}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-vandora-emerald focus:border-vandora-emerald sm:text-sm p-1 border"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-800 mb-4 border-b pb-2">Métodos de Pago</h3>
          <div className="space-y-4">
            <div className="border rounded-md p-4">
              <label className="flex items-center space-x-3 mb-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.paymentMethods.transfer}
                  onChange={() => handlePaymentToggle('transfer')}
                  className="h-5 w-5 text-vandora-emerald rounded focus:ring-vandora-emerald"
                />
                <span className="font-medium text-gray-900">Transferencia Bancaria</span>
              </label>
              {settings.paymentMethods.transfer && (
                <div className="ml-8 space-y-4">
                  <p className="text-sm text-gray-600">Agrega los bancos disponibles para transferencia.</p>
                  
                  {(settings.banks || []).map((bank, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded border border-gray-200 relative">
                      <button
                        onClick={() => {
                          const newBanks = [...(settings.banks || [])];
                          newBanks.splice(index, 1);
                          setSettings({ ...settings, banks: newBanks });
                        }}
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                        title="Eliminar banco"
                      >
                        &times;
                      </button>
                      <div className="mb-2">
                        <label className="block text-xs font-medium text-gray-500">Nombre del Banco</label>
                        <input
                          type="text"
                          value={bank.name}
                          onChange={(e) => {
                            const newBanks = [...(settings.banks || [])];
                            newBanks[index].name = e.target.value;
                            setSettings({ ...settings, banks: newBanks });
                          }}
                          className="w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-vandora-emerald focus:ring-vandora-emerald text-sm"
                          placeholder="Ej: Banco Pichincha"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500">Datos de la Cuenta</label>
                        <textarea
                          value={bank.details}
                          onChange={(e) => {
                            const newBanks = [...(settings.banks || [])];
                            newBanks[index].details = e.target.value;
                            setSettings({ ...settings, banks: newBanks });
                          }}
                          rows={3}
                          className="w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-vandora-emerald focus:ring-vandora-emerald text-sm"
                          placeholder="Número de cuenta, tipo, titular, CI/RUC..."
                        />
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => setSettings({
                      ...settings,
                      banks: [...(settings.banks || []), { name: '', details: '' }]
                    })}
                    className="text-sm text-vandora-emerald font-medium hover:underline flex items-center"
                  >
                    + Agregar otro banco
                  </button>
                </div>
              )}
            </div>

            <div className="border rounded-md p-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.paymentMethods.cash}
                  onChange={() => handlePaymentToggle('cash')}
                  className="h-5 w-5 text-vandora-emerald rounded focus:ring-vandora-emerald"
                />
                <span className="font-medium text-gray-900">Pago Contra Entrega (Efectivo)</span>
              </label>
            </div>
            
            <div className="border rounded-md p-4 opacity-50">
              <label className="flex items-center space-x-3 cursor-not-allowed">
                <input
                  type="checkbox"
                  checked={settings.paymentMethods.card}
                  disabled
                  className="h-5 w-5 text-gray-400 rounded"
                />
                <span className="font-medium text-gray-500">Tarjeta de Crédito / Débito (Próximamente)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Shipping Rules */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-800 mb-4 border-b pb-2">Reglas de Envío</h3>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Umbral para Envío Gratis ($)
              </label>
              <input
                type="number"
                value={settings.shippingRules.freeShippingThreshold}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  shippingRules: { ...prev.shippingRules, freeShippingThreshold: parseFloat(e.target.value) || 0 }
                }))}
                className="w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-vandora-emerald focus:ring-vandora-emerald"
              />
              <p className="text-xs text-gray-500 mt-1">Si el subtotal supera este monto, el envío será gratuito.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ciudades con Pago Contra Entrega
              </label>
              <textarea
                value={settings.shippingRules.codCities.join(', ')}
                onChange={(e) => handleCityChange('codCities', e.target.value)}
                placeholder="Quito, Guayaquil, Cuenca"
                rows={2}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-vandora-emerald focus:ring-vandora-emerald"
              />
              <p className="text-xs text-gray-500 mt-1">Separa las ciudades con comas. Deja vacío para permitir en todas partes (no recomendado).</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <button
            onClick={saveSettings}
            disabled={saving}
            className="flex items-center px-6 py-3 bg-vandora-emerald text-white rounded-md hover:bg-emerald-800 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <>Guardando...</>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

import { Settings } from 'lucide-react';

export default CheckoutSettingsEditor;
