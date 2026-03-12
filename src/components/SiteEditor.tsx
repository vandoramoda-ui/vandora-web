import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Save, Loader2, Image as ImageIcon, Plus, Trash, Globe, Instagram, Facebook as FbIcon, Twitter, CheckCircle2, AlertCircle } from 'lucide-react';
import ImageUpload from '../components/ImageUpload';

const SiteEditor = () => {
  const [heroSlides, setHeroSlides] = useState<any[]>([]);
  const [socialLinks, setSocialLinks] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setLoading(true);
    try {
      // Fetch Hero Slides
      const { data: heroData } = await supabase
        .from('site_content')
        .select('*')
        .eq('section_key', 'hero_slides')
        .single();

      if (heroData) {
        setHeroSlides(heroData.content);
      } else {
        setHeroSlides([
          {
            id: Date.now(),
            imageDesktop: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000&auto=format&fit=crop",
            imageMobile: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop",
            title: "El Legado del Florecimiento",
            subtitle: "Para la mujer que empezó desde cero y hoy conquista sus metas.",
            buttonText: "Explorar Colección",
            buttonLink: "/tienda",
            buttonColor: "#D4AF37",
            textColor: "#FFFFFF"
          }
        ]);
      }

      // Fetch Social Links
      const { data: socialData } = await supabase
        .from('site_content')
        .select('*')
        .eq('section_key', 'social_links')
        .single();

      if (socialData) {
        setSocialLinks(socialData.content);
      } else {
        setSocialLinks({
          instagram: { enabled: true, url: '' },
          facebook: { enabled: true, url: '' },
          tiktok: { enabled: true, url: '' },
          whatsapp: { enabled: true, url: '' },
          twitter: { enabled: false, url: '' },
          pinterest: { enabled: false, url: '' }
        });
      }
    } catch (err) {
      console.error("Error fetching site content", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlide = () => {
    const newSlide = {
      id: Date.now(),
      imageDesktop: "",
      imageMobile: "",
      title: "Nueva Diapositiva",
      subtitle: "Texto descriptivo aquí",
      buttonText: "Boton",
      buttonLink: "/tienda",
      buttonColor: "#D4AF37",
      textColor: "#FFFFFF"
    };
    setHeroSlides([...heroSlides, newSlide]);
  };

  const handleRemoveSlide = (id: number) => {
    setHeroSlides(heroSlides.filter(s => s.id !== id));
  };

  const handleSlideChange = (id: number, field: string, value: string) => {
    setHeroSlides(heroSlides.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleSocialChange = (key: string, field: string, value: any) => {
    setSocialLinks({
      ...socialLinks,
      [key]: { ...socialLinks[key], [field]: value }
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save Hero Slides
      const { error: heroError } = await supabase
        .from('site_content')
        .upsert({ 
          section_key: 'hero_slides',
          content: heroSlides,
          updated_at: new Date().toISOString()
        }, { onConflict: 'section_key' });

      if (heroError) throw heroError;

      // Save Social Links
      const { error: socialError } = await supabase
        .from('site_content')
        .upsert({ 
          section_key: 'social_links',
          content: socialLinks,
          updated_at: new Date().toISOString()
        }, { onConflict: 'section_key' });

      if (socialError) throw socialError;

      alert('Cambios guardados correctamente');
    } catch (err: any) {
      console.error('Error saving content:', err);
      alert('Error al guardar: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center p-20">
      <Loader2 className="w-8 h-8 animate-spin text-vandora-emerald" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      {/* Hero Slides Section */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 border-b px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <ImageIcon className="w-5 h-5 mr-2 text-vandora-emerald" />
            <h2 className="text-xl font-serif text-gray-900">Slider Principal (Home)</h2>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleAddSlide}
              className="bg-white text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 border flex items-center shadow-sm text-sm"
            >
              <Plus className="h-4 w-4 mr-2" /> Añadir Diapositiva
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-vandora-emerald text-white px-6 py-2 rounded-md hover:bg-emerald-800 flex items-center shadow-md disabled:opacity-50"
            >
              {saving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Guardar Todo
            </button>
          </div>
        </div>

        <div className="p-8 space-y-12">
          {heroSlides.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                  No hay diapositivas configuradas. Haz clic en "Añadir Diapositiva".
              </div>
          )}
          {heroSlides.map((slide, index) => (
            <div key={slide.id} className="p-6 bg-gray-50 rounded-xl border border-gray-200 relative group animate-fade-in">
              <button 
                onClick={() => handleRemoveSlide(slide.id)}
                className="absolute -top-3 -right-3 bg-red-500 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                title="Eliminar slide"
              >
                <Trash className="h-4 w-4" />
              </button>
              
              <div className="flex items-center mb-6">
                <span className="bg-vandora-emerald text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mr-3 shadow-sm">{index + 1}</span>
                <h3 className="font-medium text-gray-700 uppercase tracking-widest text-sm">Configuración del Slide</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Images Column */}
                <div className="lg:col-span-5 space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Imagen Escritorio (1920x1080)</label>
                    <ImageUpload 
                      currentImage={slide.imageDesktop}
                      onUpload={(url) => handleSlideChange(slide.id, 'imageDesktop', url)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Imagen Móvil (800x1200)</label>
                    <ImageUpload 
                      currentImage={slide.imageMobile}
                      onUpload={(url) => handleSlideChange(slide.id, 'imageMobile', url)}
                    />
                  </div>
                </div>

                {/* Content Column */}
                <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Título del Slide</label>
                    <input 
                      type="text" 
                      value={slide.title} 
                      onChange={(e) => handleSlideChange(slide.id, 'title', e.target.value)}
                      className="w-full border rounded-lg p-3 text-lg font-serif" 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Subtítulo / Descripción</label>
                    <textarea 
                      rows={2}
                      value={slide.subtitle} 
                      onChange={(e) => handleSlideChange(slide.id, 'subtitle', e.target.value)}
                      className="w-full border rounded-lg p-3" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Texto del Botón</label>
                    <input 
                      type="text" 
                      value={slide.buttonText} 
                      onChange={(e) => handleSlideChange(slide.id, 'buttonText', e.target.value)}
                      className="w-full border rounded-lg p-3" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Link del Botón</label>
                    <input 
                      type="text" 
                      value={slide.buttonLink} 
                      onChange={(e) => handleSlideChange(slide.id, 'buttonLink', e.target.value)}
                      className="w-full border rounded-lg p-3" 
                      placeholder="/tienda o link externo"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Color del Botón</label>
                    <div className="flex gap-2">
                        <input 
                          type="color" 
                          value={slide.buttonColor} 
                          onChange={(e) => handleSlideChange(slide.id, 'buttonColor', e.target.value)}
                          className="h-12 w-16 border rounded cursor-pointer" 
                        />
                        <input 
                          type="text" 
                          value={slide.buttonColor} 
                          onChange={(e) => handleSlideChange(slide.id, 'buttonColor', e.target.value)}
                          className="flex-1 border rounded-lg px-3" 
                        />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Color de Texto</label>
                    <div className="flex gap-2">
                        <input 
                          type="color" 
                          value={slide.textColor || '#FFFFFF'} 
                          onChange={(e) => handleSlideChange(slide.id, 'textColor', e.target.value)}
                          className="h-12 w-16 border rounded cursor-pointer" 
                        />
                         <input 
                          type="text" 
                          value={slide.textColor || '#FFFFFF'} 
                          onChange={(e) => handleSlideChange(slide.id, 'textColor', e.target.value)}
                          className="flex-1 border rounded-lg px-3" 
                        />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Social Media Section */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 border-b px-8 py-4 flex items-center">
          <Globe className="w-5 h-5 mr-2 text-vandora-emerald" />
          <h2 className="text-xl font-serif text-gray-900">Redes Sociales (Footer)</h2>
        </div>
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(socialLinks).map(([key, data]: [string, any]) => (
              <div key={key} className={`p-4 rounded-xl border transition-all ${data.enabled ? 'bg-white border-vandora-emerald shadow-sm' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center capitalize font-medium text-gray-700">
                    <span className={`p-2 rounded-lg mr-2 ${data.enabled ? 'bg-emerald-100 text-vandora-emerald' : 'bg-gray-200 text-gray-500'}`}>
                        {key === 'instagram' && <Instagram size={18}/>}
                        {key === 'facebook' && <FbIcon size={18}/>}
                        {key === 'twitter' && <Twitter size={18}/>}
                        {!['instagram', 'facebook', 'twitter'].includes(key) && <Globe size={18}/>}
                    </span>
                    {key}
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={data.enabled}
                      onChange={(e) => handleSocialChange(key, 'enabled', e.target.checked)}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-vandora-emerald"></div>
                  </label>
                </div>
                <input 
                  type="url" 
                  disabled={!data.enabled}
                  value={data.url}
                  onChange={(e) => handleSocialChange(key, 'url', e.target.value)}
                  placeholder={`URL de ${key}`}
                  className={`w-full border rounded-lg p-2 text-sm focus:ring-1 focus:ring-vandora-emerald outline-none transition-colors ${!data.enabled ? 'bg-gray-100 text-gray-400' : 'bg-white'}`}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="flex justify-center pt-8">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-vandora-emerald text-white px-12 py-4 rounded-full font-bold text-lg hover:bg-emerald-800 transition-all shadow-xl hover:scale-105 flex items-center disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin h-5 w-5 mr-3" /> : <Save className="h-5 w-5 mr-3" />}
          Guardar Todos los Cambios del Sitio
        </button>
      </div>
    </div>
  );
};

export default SiteEditor;
