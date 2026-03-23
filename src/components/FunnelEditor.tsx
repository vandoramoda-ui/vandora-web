import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Save, Loader2, Target, Zap, TrendingDown, Layout, Clock, ShieldCheck, Star, Truck, CheckCircle } from 'lucide-react';

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

const PreviewSection = ({ config, type }: { config: FunnelStepConfig, type: string }) => {
  const isBump = type === 'order_bump';
  
  if (isBump) {
    return (
      <div className="mt-6 border-t pt-6">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Vista Previa (Diseño en Checkout)</h4>
        <div 
          className="border-2 border-dashed rounded-lg p-4 flex items-start gap-3 transition-colors"
          style={{ borderColor: config.accent_color, backgroundColor: `${config.accent_color}10` }}
        >
          <div className="mt-1">
            <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-vandora-emerald focus:ring-vandora-emerald" checked={true} readOnly />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded animate-pulse">OFERTA</span>
              <h4 className="font-bold text-sm text-gray-900">{config.title}</h4>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed mb-2">{config.description}</p>
            <div className="text-sm font-bold text-vandora-emerald" style={{ color: config.accent_color }}>
              ¡Añadir ahora por solo $XX.XX!
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 border-t pt-6 bg-gray-50 -mx-6 -mb-6 p-6 rounded-b-lg">
      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Vista Previa (Página de Oferta)</h4>
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200">
        {config.template === 'urgency' && (
          <div className="h-1.5 bg-gray-100">
            <div className="h-full bg-red-500 w-2/3"></div>
          </div>
        )}
        
        <div className="p-6 text-center">
          <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-900 mb-1 leading-tight">{config.title}</h3>
          <p className="text-xs text-gray-500 mb-3">{config.subtitle}</p>
          
          {config.template === 'urgency' && (
            <div className="inline-flex items-center bg-red-50 text-red-600 px-3 py-1 rounded-full text-[10px] font-bold mb-4">
              <Clock className="h-3 w-3 mr-1" /> EXPIRES IN 04:59
            </div>
          )}

          <div className="border rounded-md p-3 mb-4 flex gap-3 items-center text-left">
            <div className="w-12 h-12 bg-gray-100 rounded"></div>
            <div className="flex-1">
              <div className="h-3 w-20 bg-gray-200 rounded mb-1"></div>
              <div className="h-2 w-full bg-gray-100 rounded"></div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-red-600" style={{ color: config.accent_color }}>$XX.XX</div>
            </div>
          </div>

          <button 
            className="w-full py-2.5 rounded text-white text-sm font-bold shadow-md transform transition active:scale-95"
            style={{ backgroundColor: config.accent_color }}
          >
            {config.cta_text}
          </button>
          
          <button className="text-[10px] text-gray-400 mt-3 underline">
            {config.decline_text}
          </button>

          {config.template === 'social_proof' && (
            <div className="mt-4 pt-4 border-t flex justify-center gap-4 opacity-50 grayscale">
              <div className="flex flex-col items-center">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-[8px] uppercase mt-1">Seguro</span>
              </div>
              <div className="flex flex-col items-center">
                <Truck className="h-4 w-4" />
                <span className="text-[8px] uppercase mt-1">Envío</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
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
      const { data: prodData } = await supabase.from('products').select('id, name').order('name');
      if (prodData) setProducts(prodData);

      const { data } = await supabase
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div className="flex items-center text-vandora-emerald border-b pb-3 mb-6">
        <Icon className="h-5 w-5 mr-2" />
        <h3 className="text-lg font-serif font-bold text-gray-800">{title}</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        <div className="space-y-4">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción / Copy</label>
            <textarea
              value={config[step].description}
              onChange={(e) => handleUpdate(step, 'description', e.target.value)}
              rows={2}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-vandora-emerald focus:ring-vandora-emerald text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
          </div>

          <div className="grid grid-cols-2 gap-4">
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
                  className="h-9 w-12 border-0 p-0 block cursor-pointer rounded overflow-hidden"
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

        <div className="hidden md:block">
          <PreviewSection config={config[step]} type={step} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-gray-900">Configuración de Embudos (Funnels)</h2>
          <p className="text-sm text-gray-500">Optimiza tus ventas con Order Bumps, Upsells y Downsells personalizados.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-vandora-emerald text-white px-8 py-3 rounded-full hover:bg-emerald-800 flex items-center transition-all disabled:opacity-50 shadow-lg font-bold"
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
