import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Save, Loader2, Image as ImageIcon } from 'lucide-react';
import ImageUpload from '../components/ImageUpload';

const SiteEditor = () => {
  const [content, setContent] = useState<any>({
    hero: {
      title: '',
      subtitle: '',
      image_url: '',
      cta_text: ''
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setLoading(true);
    // In a real app, fetch from Supabase 'site_content' table
    // For now, we'll mock the initial state or try to fetch if table exists
    try {
      const { data, error } = await supabase
        .from('site_content')
        .select('*')
        .eq('section_key', 'hero')
        .single();

      if (data) {
        setContent(prev => ({ ...prev, hero: data.content }));
      } else {
        // Default fallback if no DB entry
        setContent({
          hero: {
            title: "El Legado del Florecimiento",
            subtitle: "Para la mujer que empezó desde cero, para la que camina la calle con sueños y hoy conquista sus metas.",
            image_url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000&auto=format&fit=crop",
            cta_text: "Explorar Colección"
          }
        });
      }
    } catch (err) {
      console.error("Error fetching site content", err);
    } finally {
      setLoading(false);
    }
  };

  const handleHeroChange = (field: string, value: string) => {
    setContent(prev => ({
      ...prev,
      hero: { ...prev.hero, [field]: value }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('site_content')
        .upsert({ 
          section_key: 'hero',
          content: content.hero,
          updated_at: new Date().toISOString()
        }, { onConflict: 'section_key' });

      if (error) throw error;
      alert('Cambios guardados correctamente');
    } catch (err: any) {
      console.error('Error saving content:', err);
      alert('Error al guardar: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Cargando editor...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Editar Página de Inicio (Hero)</h2>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-vandora-emerald text-white px-4 py-2 rounded-md hover:bg-emerald-800 flex items-center disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Guardar Cambios
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título Principal</label>
                <input
                  type="text"
                  value={content.hero.title}
                  onChange={(e) => handleHeroChange('title', e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-vandora-emerald focus:border-vandora-emerald"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo</label>
                <textarea
                  value={content.hero.subtitle}
                  onChange={(e) => handleHeroChange('subtitle', e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-vandora-emerald focus:border-vandora-emerald"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Texto del Botón</label>
                <input
                  type="text"
                  value={content.hero.cta_text}
                  onChange={(e) => handleHeroChange('cta_text', e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-vandora-emerald focus:border-vandora-emerald"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Imagen de Fondo</label>
              <ImageUpload 
                currentImage={content.hero.image_url}
                onUpload={(url) => handleHeroChange('image_url', url)}
              />
              <p className="text-xs text-gray-500 mt-2">Recomendado: 1920x1080px o superior.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteEditor;
