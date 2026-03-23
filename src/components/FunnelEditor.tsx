import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Save, Loader2, Target, Zap, TrendingDown, Layout } from 'lucide-react';

interface FunnelStepConfig {
  product_id: string;
  title: string;
  subtitle: string;
  description: string;
  cta_text: string;
  decline_text: string;
  template: string;
  timer_seconds?: number;
  bg_color?: string;
  accent_color?: string;
}

interface FunnelConfig {
  order_bump: FunnelStepConfig;
  upsell: FunnelStepConfig;
  downsell: FunnelStepConfig;
}

const DEFAULT_CONFIG: FunnelConfig = {
  order_bump: {
    product_id: '',
    title: '¡Oferta Especial de Último Minuto!',
    subtitle: '',
    description: 'Añade este complemento perfecto a tu pedido con un descuento exclusivo solo por hoy.',
    cta_text: 'SÍ, AGREGAR A MI PEDIDO',
    decline_text: '',
    template: 'standard',
    bg_color: '#FEFCE8',
    accent_color: '#EAB308'
  },
  upsell: {
    product_id: '',
    title: '¡ESPERA! Tu pedido no está completo',
    subtitle: 'Tenemos una oferta exclusiva solo para ti.',
    description: 'Completa tu armario con nuestros básicos esenciales. Calidad garantizada.',
    cta_text: 'SÍ, AGREGAR A MI PEDIDO',
    decline_text: 'No gracias, no quiero ahorrar hoy.',
    template: 'urgency',
    timer_seconds: 300,
    bg_color: '#FFFFFF',
    accent_color: '#16a34a'
  },
  downsell: {
    product_id: '',
    title: '¿Qué tal solo una?',
    subtitle: 'Entendemos que no quieras el pack completo.',
    description: '¿Te gustaría llevarte solo una unidad a un precio especial?',
    cta_text: 'SÍ, AGREGAR A MI PEDIDO',
    decline_text: 'No gracias, no quiero esta oferta.',
    template: 'clean',
    bg_color: '#FFFFFF',
    accent_color: '#16a34a'
  }
};

const FunnelEditor = () => {
  const [config, setConfig] = useState<FunnelConfig>(DEFAULT_CONFIG);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Products for selection
      const { data: prodData } = await supabase.from('products').select('id, name').order('name');
      if (prodData) setProducts(prodData);

      // Fetch Funnel Config
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'funnel_config')
        .single();

      if (data) {
        setConfig({ ...DEFAULT_CONFIG, ...data.value });
      }
    } catch (error) {
      console.error('Error fetching funnel data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (step: keyof FunnelConfig, field: keyof FunnelStepConfig, value: any) => {
    setConfig(prev => ({
      ...prev,
      [step]: {
        ...prev[step],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('app_settings')
        .upsert({ key: 'funnel_config', value: config }, { onConflict: 'key' });

      if (error) throw error;
      alert('Configuración del embudo guardada correctamente.');
    } catch (error: any) {
      alert('Error al guardar: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando embudos...</div>;

  const StepForm = ({ title, step, icon: Icon, showTemplate = true }: { title: string, step: keyof FunnelConfig, icon: any, showTemplate?: boolean }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 space-y-4">
      <div className="flex items-center text-vandora-emerald border-b pb-3 mb-4">
        <Icon className="h-5 w-5 mr-2" />
        <h3 className="text-lg font-serif font-bold text-gray-800">{title}</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Producto</label>
          <select
            value={config[step].product_id}
            onChange={(e) => handleUpdate(step, 'product_id', e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-vandora-emerald focus:ring-vandora-emerald text-sm"
          >
            <option value="">-- Seleccionar Producto --</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
          <input
            type="text"
            value={config[step].title}
            onChange={(e) => handleUpdate(step, 'title', e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-vandora-emerald focus:ring-vandora-emerald text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo (Opcional)</label>
          <input
            type="text"
            value={config[step].subtitle}
            onChange={(e) => handleUpdate(step, 'subtitle', e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-vandora-emerald focus:ring-vandora-emerald text-sm"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción / Copy</label>
          <textarea
            value={config[step].description}
            onChange={(e) => handleUpdate(step, 'description', e.target.value)}
            rows={2}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-vandora-emerald focus:ring-vandora-emerald text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Texto Botón Aceptar</label>
          <input
            type="text"
            value={config[step].cta_text}
            onChange={(e) => handleUpdate(step, 'cta_text', e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-vandora-emerald focus:ring-vandora-emerald text-sm"
          />
        </div>

        {step !== 'order_bump' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Texto Botón Rechazar</label>
            <input
              type="text"
              value={config[step].decline_text}
              onChange={(e) => handleUpdate(step, 'decline_text', e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-vandora-emerald focus:ring-vandora-emerald text-sm"
            />
          </div>
        )}

        {showTemplate && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Plantilla de Diseño</label>
            <select
              value={config[step].template}
              onChange={(e) => handleUpdate(step, 'template', e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-vandora-emerald focus:ring-vandora-emerald text-sm"
            >
              <option value="urgency">Urgencia (Cronómetro + Rojo)</option>
              <option value="clean">Limpio (Moderno + Verde)</option>
              <option value="social_proof">Prueba Social (Insignias + Confianza)</option>
              <option value="standard">Estándar (Sencillo)</option>
            </select>
          </div>
        )}

        {step === 'upsell' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Segundos del Cronómetro</label>
            <input
              type="number"
              value={config[step].timer_seconds}
              onChange={(e) => handleUpdate(step, 'timer_seconds', parseInt(e.target.value) || 300)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-vandora-emerald focus:ring-vandora-emerald text-sm"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Color de Acento (Hex)</label>
          <div className="flex space-x-2">
            <input
              type="color"
              value={config[step].accent_color}
              onChange={(e) => handleUpdate(step, 'accent_color', e.target.value)}
              className="h-10 w-10 border-0 p-0 block"
            />
            <input
              type="text"
              value={config[step].accent_color}
              onChange={(e) => handleUpdate(step, 'accent_color', e.target.value)}
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-vandora-emerald focus:ring-vandora-emerald text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold text-gray-900">Configuración de Embudos (Funnels)</h2>
          <p className="text-sm text-gray-500">Optimiza tus ventas con Order Bumps, Upsells y Downsells personalizados.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-vandora-emerald text-white px-6 py-2 rounded-full hover:bg-emerald-800 flex items-center transition-all disabled:opacity-50 shadow-md"
        >
          {saving ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Save className="h-5 w-5 mr-2" />}
          Guardar Configuración
        </button>
      </div>

      <StepForm title="Order Bump (En Checkout)" step="order_bump" icon={Zap} showTemplate={false} />
      <StepForm title="Upsell (Venta Adicional - Post Pago)" step="upsell" icon={TrendingDown} />
      <StepForm title="Downsell (Alternativa - Post Rechazo)" step="downsell" icon={Layout} />
    </div>
  );
};

export default FunnelEditor;
