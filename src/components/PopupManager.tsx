import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Trash, Edit, Save, X, Eye, EyeOff, Image as ImageIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import ImageUpload from './ImageUpload';

interface PopupConfig {
  id: string;
  name: string;
  active: boolean;
  template: 'newsletter' | 'coupon' | 'minimal';
  title: string;
  subtitle: string;
  buttonText: string;
  imageUrl?: string;
  backgroundColor: string;
  textColor: string;
  buttonColor: string;
  triggerType: 'time' | 'scroll' | 'exit';
  triggerValue: number; // seconds, % scroll, or 0 for exit
  pages: string; // "all" or comma separated paths
  delayDays: number; // don't show again for X days
  couponCode?: string;
}

const PopupManager = () => {
  const [popups, setPopups] = useState<PopupConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPopup, setEditingPopup] = useState<PopupConfig | null>(null);
  
  const defaultPopup: PopupConfig = {
    id: '',
    name: 'Nuevo Popup',
    active: false,
    template: 'newsletter',
    title: '¡Suscríbete y obtén un 10%!',
    subtitle: 'Únete a nuestra comunidad de Mujeres que Florecen.',
    buttonText: 'Suscribirme',
    backgroundColor: '#ffffff',
    textColor: '#1a1a1a',
    buttonColor: '#064e3b',
    triggerType: 'time',
    triggerValue: 5,
    pages: 'all',
    delayDays: 7
  };

  const [formData, setFormData] = useState<PopupConfig>(defaultPopup);

  useEffect(() => {
    fetchPopups();
  }, []);

  const fetchPopups = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('site_content')
        .select('content')
        .eq('section_key', 'popups')
        .single();

      if (data?.content) {
        setPopups(data.content);
      }
    } catch (err) {
      console.error('Error fetching popups:', err);
    } finally {
      setLoading(false);
    }
  };

  const savePopups = async (updatedPopups: PopupConfig[]) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('site_content')
        .upsert({ 
          section_key: 'popups', 
          content: updatedPopups,
          updated_at: new Date().toISOString()
        }, { onConflict: 'section_key' });

      if (error) throw error;
      setPopups(updatedPopups);
    } catch (err: any) {
      alert('Error al guardar: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateOrUpdate = () => {
    let newPopups;
    if (editingPopup) {
      newPopups = popups.map(p => p.id === editingPopup.id ? formData : p);
    } else {
      const newPopup = { ...formData, id: Date.now().toString() };
      newPopups = [...popups, newPopup];
    }
    savePopups(newPopups);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este popup?')) {
      const newPopups = popups.filter(p => p.id !== id);
      savePopups(newPopups);
    }
  };

  const toggleActive = (id: string) => {
    const newPopups = popups.map(p => p.id === id ? { ...p, active: !p.active } : p);
    savePopups(newPopups);
  };

  const openModal = (popup: PopupConfig | null = null) => {
    if (popup) {
      setEditingPopup(popup);
      setFormData(popup);
    } else {
      setEditingPopup(null);
      setFormData(defaultPopup);
    }
    setIsModalOpen(true);
  };

  if (loading) return <div className="flex justify-center p-10"><Plus className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-xl font-serif text-gray-900">Gestión de Popups</h2>
          <p className="text-sm text-gray-500">Crea ventanas emergentes para marketing y promociones.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-vandora-emerald text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium hover:bg-emerald-800 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" /> Crear Popup
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {popups.map((popup) => (
          <div key={popup.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="h-32 bg-gray-50 flex items-center justify-center border-b border-gray-50 relative">
              {popup.imageUrl ? (
                <img src={popup.imageUrl} alt={popup.name} className="w-full h-full object-cover" />
              ) : (
                <div className="text-gray-300 flex flex-col items-center">
                  <Eye className="w-8 h-8 mb-1" />
                  <span className="text-xs uppercase tracking-widest">Sin imagen</span>
                </div>
              )}
              <div className="absolute top-2 right-2">
                <button
                  onClick={() => toggleActive(popup.id)}
                  className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${popup.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                >
                  {popup.active ? 'Activo' : 'Inactivo'}
                </button>
              </div>
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="font-medium text-gray-900 mb-1">{popup.name}</h3>
              <p className="text-xs text-gray-500 mb-4 flex-1">
                Trigger: {popup.triggerType === 'time' ? `${popup.triggerValue}s espera` : popup.triggerType === 'scroll' ? `${popup.triggerValue}% scroll` : 'Intento de salida'}
              </p>
              <div className="flex justify-end space-x-2 border-t pt-4">
                <button onClick={() => openModal(popup)} className="p-2 text-gray-400 hover:text-vandora-emerald transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(popup.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {popups.length === 0 && (
          <div className="col-span-full py-20 bg-white rounded-xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-gray-400">
            <Megaphone className="w-12 h-12 mb-3 opacity-20" />
            <p>No hay popups configurados aún.</p>
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-xl font-serif text-gray-900">{editingPopup ? 'Editar Popup' : 'Nuevo Popup'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Settings Column */}
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Nombre Interno</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-vandora-emerald outline-none"
                    placeholder="Ej: Promo Verano Newsletter"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Plantilla</label>
                    <select
                      value={formData.template}
                      onChange={(e) => setFormData({ ...formData, template: e.target.value as any })}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-vandora-emerald outline-none"
                    >
                      <option value="newsletter">Newsletter (Email)</option>
                      <option value="coupon">Cupón (Copia)</option>
                      <option value="minimal">Minimal (Solo Texto)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Activo</label>
                    <div className="flex items-center mt-2">
                       <button
                        onClick={() => setFormData({ ...formData, active: !formData.active })}
                        className={`w-12 h-6 rounded-full transition-colors relative ${formData.active ? 'bg-vandora-emerald' : 'bg-gray-200'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.active ? 'left-7' : 'left-1'}`} />
                      </button>
                      <span className="ml-2 text-sm text-gray-600">{formData.active ? 'Visible' : 'Oculto'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <h4 className="text-sm font-bold text-gray-900 uppercase">Contenido Visual</h4>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Imagen de Fondo/Lateral</label>
                    <ImageUpload
                      currentImage={formData.imageUrl}
                      onUpload={(url) => setFormData({ ...formData, imageUrl: url })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Título del Popup</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Subtítulo / Descripción</label>
                    <textarea
                      value={formData.subtitle}
                      onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 text-sm h-20"
                    />
                  </div>
                  {formData.template === 'coupon' && (
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Código de Cupón</label>
                      <input
                        type="text"
                        value={formData.couponCode}
                        onChange={(e) => setFormData({ ...formData, couponCode: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
                        placeholder="VANDORA10"
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Color Fondo</label>
                      <input
                        type="color"
                        value={formData.backgroundColor}
                        onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                        className="w-full h-10 p-1 border rounded-lg cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Color Texto</label>
                      <input
                        type="color"
                        value={formData.textColor}
                        onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                        className="w-full h-10 p-1 border rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Triggers Column */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-gray-900 uppercase">Configuración de Disparadores</h4>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Tipo de Disparador</label>
                    <div className="grid grid-cols-3 gap-2">
                       <button
                        onClick={() => setFormData({ ...formData, triggerType: 'time' })}
                        className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${formData.triggerType === 'time' ? 'bg-vandora-emerald/10 border-vandora-emerald text-vandora-emerald' : 'bg-white border-gray-200 text-gray-500'}`}
                      >
                        Tiempo
                      </button>
                      <button
                        onClick={() => setFormData({ ...formData, triggerType: 'scroll' })}
                        className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${formData.triggerType === 'scroll' ? 'bg-vandora-emerald/10 border-vandora-emerald text-vandora-emerald' : 'bg-white border-gray-200 text-gray-500'}`}
                      >
                        Scroll
                      </button>
                      <button
                        onClick={() => setFormData({ ...formData, triggerType: 'exit' })}
                        className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${formData.triggerType === 'exit' ? 'bg-vandora-emerald/10 border-vandora-emerald text-vandora-emerald' : 'bg-white border-gray-200 text-gray-500'}`}
                      >
                        Salida
                      </button>
                    </div>
                  </div>

                  {formData.triggerType !== 'exit' && (
                    <div>
                       <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                        {formData.triggerType === 'time' ? 'Segundos de espera' : 'Porcentaje de scroll (%)'}
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={formData.triggerType === 'scroll' ? 100 : 300}
                        value={formData.triggerValue}
                        onChange={(e) => setFormData({ ...formData, triggerValue: parseInt(e.target.value) || 0 })}
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Páginas (Separadas por coma, 'all' para todas)</label>
                    <input
                      type="text"
                      value={formData.pages}
                      onChange={(e) => setFormData({ ...formData, pages: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                      placeholder="Ej: all o /, /tienda"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">No mostrar más por (Días)</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.delayDays}
                      onChange={(e) => setFormData({ ...formData, delayDays: parseInt(e.target.value) || 1 })}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t">
                   <h4 className="text-sm font-bold text-gray-900 uppercase mb-4">Vista Previa Rápida</h4>
                   <div className="border border-gray-100 rounded-xl p-8 flex items-center justify-center bg-gray-50 relative overflow-hidden min-h-[250px]">
                      <div className="absolute inset-0 opacity-10" style={{ backgroundColor: formData.backgroundColor }} />
                      <div 
                        className="relative z-10 w-full max-w-[280px] p-6 rounded-lg shadow-xl text-center" 
                        style={{ backgroundColor: formData.backgroundColor, color: formData.textColor }}
                      >
                        <h5 className="font-serif text-lg mb-2">{formData.title}</h5>
                        <p className="text-[10px] mb-4 opacity-80">{formData.subtitle}</p>
                        {formData.template === 'newsletter' && (
                          <div className="mb-4">
                            <input disabled type="email" placeholder="email@ejemplo.com" className="w-full px-3 py-2 text-[10px] border rounded bg-white/50" />
                          </div>
                        )}
                        {formData.template === 'coupon' && (
                          <div className="mb-4 p-2 border-2 border-dashed rounded text-sm font-bold font-mono">
                            {formData.couponCode || 'CUPON'}
                          </div>
                        )}
                        <button 
                          disabled 
                          className="w-full py-2 rounded text-[10px] font-bold uppercase tracking-wider shadow-md"
                          style={{ backgroundColor: formData.buttonColor, color: '#ffffff' }}
                        >
                          {formData.buttonText}
                        </button>
                      </div>
                   </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3 sticky bottom-0 z-10">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Cancelar
              </button>
              <button 
                onClick={handleCreateOrUpdate}
                disabled={saving}
                className="bg-vandora-emerald text-white px-8 py-2 rounded-lg text-sm font-medium hover:bg-emerald-800 transition-colors shadow-lg disabled:opacity-50 flex items-center"
              >
                {saving ? <Plus className="animate-spin w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                {editingPopup ? 'Guardar Cambios' : 'Crear Popup'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Internal icon for empty state
const Megaphone = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m11 15 1.5 4.5a.5.5 0 0 0 .95 0l4.5-13.5A.5.5 0 0 0 17.5 5.5l-13.5 4.5a.5.5 0 0 0 0 .95l13.5 4.5z"/></svg>
);

export default PopupManager;
