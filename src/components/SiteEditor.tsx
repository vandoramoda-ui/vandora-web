import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Save, Loader2, Image as ImageIcon, Plus, Trash, Globe, Instagram, Facebook as FbIcon, Twitter, CheckCircle2, AlertCircle, Truck } from 'lucide-react';
import ImageUpload from '../components/ImageUpload';

const SiteEditor = () => {
  const [heroSlides, setHeroSlides] = useState<any[]>([]);
  const [socialLinks, setSocialLinks] = useState<any>({});
  const [founderSection, setFounderSection] = useState<any>({
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1000&auto=format&fit=crop',
    title: 'De la Calle a la Vitrina',
    description1: 'Vandora nació del sueño de una mujer que entendió que el verdadero lujo es la libertad de ser una misma. Cada prenda está diseñada pensando en la mujer ecuatoriana: fuerte, diversa y llena de ambición.',
    description2: 'Únete a nuestra comunidad de "Mujeres que Florecen". Comparte tu historia y viste con el orgullo de quien ha luchado por cada logro.',
    buttonText: 'Leer Nuestra Historia',
    buttonLink: '/nuestra-historia'
  });
  const [storyPage, setStoryPage] = useState<any>({
    title: 'Nuestra Historia',
    quote: '"Vandora nació en las calles de Ecuador, inspirada por la fuerza de las mujeres que, contra todo pondóstico, florecen."',
    image: 'https://images.unsplash.com/photo-1551232864-3f0890e580d9?q=80&w=1000&auto=format&fit=crop',
    body1: 'Cada puntada de nuestras prendas lleva consigo la promesa de calidad y la dedicación de manos artesanas.',
    body2: 'Desde nuestros humildes comienzos hasta convertirnos en un referente de estilo.'
  });
  const [faqPage, setFaqPage] = useState<any[]>([]);
  const [contactPage, setContactPage] = useState<any>({
    title: 'Contáctanos',
    address_title: 'Visítanos',
    address_line1: 'Av. Amazonas y Naciones Unidas',
    address_line2: 'Quito, Ecuador',
    hours: 'Lunes a Sábado: 10am - 8pm',
    write_title: 'Escríbenos',
    email: 'hola@vandora.com',
    phone: '+593 99 999 9999'
  });
  const [shippingPage, setShippingPage] = useState<any>({
    title: 'Envíos y Devoluciones',
    shipping_title: 'Política de Envíos',
    shipping_line1: 'Envíos a nivel nacional a través de Servientrega o transporte seguro.',
    shipping_line2: 'Tiempo de entrega: 2-3 días hábiles en ciudades principales. 3-5 días en cantones y parroquias.',
    shipping_line3: 'Costo fijo de envío: $5.00 a cualquier parte del país.',
    return_title: 'Cambios y Devoluciones',
    return_desc: 'Queremos que ames tu prenda Vandora. Si no es así, tienes 7 días calendario desde la recepción para solicitar un cambio.',
    return_conditions: [
      'La prenda debe estar nueva, sin uso y con etiquetas.',
      'No aplica para prendas en oferta o liquidación.',
      'Los costos de envío por cambio de talla corren por cuenta del cliente.',
      'Si el producto tiene defecto de fábrica, nosotros cubrimos todos los gastos.'
    ],
    footer_text: 'Para gestionar un cambio, escríbenos a hola@vandora.com con tu número de pedido.',
    contact_email: 'hola@vandora.com'
  });
  const [privacyPage, setPrivacyPage] = useState<any>({
    title: 'Política de Privacidad',
    sections: [{ title: 'Título de Sección', text: 'Contenido de la sección...' }]
  });
  const [termsPage, setTermsPage] = useState<any>({
    title: 'Términos y Condiciones',
    sections: [{ title: 'Título de Sección', text: 'Contenido de la sección...' }]
  });
  const [branding, setBranding] = useState<any>({
    favicon: '',
    siteLogo: '',
    siteName: 'Vandora'
  });
  const [activeTab, setActiveTab] = useState('home');
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

      // Fetch Founder Section
      const { data: founderData } = await supabase
        .from('site_content')
        .select('*')
        .eq('section_key', 'founder_section')
        .single();

      if (founderData) {
        setFounderSection(founderData.content);
      }

      // Fetch Story Page
      const { data: storyData } = await supabase
        .from('site_content')
        .select('*')
        .eq('section_key', 'page_story')
        .single();
      if (storyData) setStoryPage(storyData.content);

      // Fetch FAQ Page
      const { data: faqData } = await supabase
        .from('site_content')
        .select('*')
        .eq('section_key', 'page_faq')
        .single();
      if (faqData) setFaqPage(faqData.content);

      // Fetch Contact Page
      const { data: contactData } = await supabase
        .from('site_content')
        .select('*')
        .eq('section_key', 'page_contact')
        .single();
      if (contactData) setContactPage(contactData.content);

      // Fetch Shipping Page
      const { data: shippingData } = await supabase
        .from('site_content')
        .select('*')
        .eq('section_key', 'page_shipping')
        .single();
      if (shippingData) setShippingPage(shippingData.content);

      // Fetch Privacy Page
      const { data: privacyData } = await supabase
        .from('site_content')
        .select('*')
        .eq('section_key', 'page_privacy')
        .single();
      if (privacyData) setPrivacyPage(privacyData.content);

      // Fetch Terms Page
      const { data: termsData } = await supabase
        .from('site_content')
        .select('*')
        .eq('section_key', 'page_terms')
        .single();
      if (termsData) setTermsPage(termsData.content);

      // Fetch Branding
      const { data: brandingData } = await supabase
        .from('site_content')
        .select('*')
        .eq('section_key', 'branding')
        .single();
      if (brandingData) setBranding(brandingData.content);
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

      // Save Founder Section
      const { error: founderError } = await supabase
        .from('site_content')
        .upsert({ 
          section_key: 'founder_section',
          content: founderSection,
          updated_at: new Date().toISOString()
        }, { onConflict: 'section_key' });

      if (founderError) throw founderError;

      // Save Story Page
      const { error: storyError } = await supabase
        .from('site_content')
        .upsert({ section_key: 'page_story', content: storyPage, updated_at: new Date().toISOString() }, { onConflict: 'section_key' });
      if (storyError) throw storyError;

      // Save FAQ Page
      const { error: faqError } = await supabase
        .from('site_content')
        .upsert({ section_key: 'page_faq', content: faqPage, updated_at: new Date().toISOString() }, { onConflict: 'section_key' });
      if (faqError) throw faqError;

      // Save Contact Page
      const { error: contactError } = await supabase
        .from('site_content')
        .upsert({ section_key: 'page_contact', content: contactPage, updated_at: new Date().toISOString() }, { onConflict: 'section_key' });
      if (contactError) throw contactError;

      // Save Shipping Page
      const { error: shippingError } = await supabase
        .from('site_content')
        .upsert({ section_key: 'page_shipping', content: shippingPage, updated_at: new Date().toISOString() }, { onConflict: 'section_key' });
      if (shippingError) throw shippingError;

      // Save Privacy Page
      const { error: privacyError } = await supabase
        .from('site_content')
        .upsert({ section_key: 'page_privacy', content: privacyPage, updated_at: new Date().toISOString() }, { onConflict: 'section_key' });
      if (privacyError) throw privacyError;

      // Save Terms Page
      const { error: termsError } = await supabase
        .from('site_content')
        .upsert({ section_key: 'page_terms', content: termsPage, updated_at: new Date().toISOString() }, { onConflict: 'section_key' });
      if (termsError) throw termsError;

      // Save Branding
      const { error: brandingError } = await supabase
        .from('site_content')
        .upsert({ 
          section_key: 'branding', 
          content: branding, 
          updated_at: new Date().toISOString() 
        }, { onConflict: 'section_key' });
      if (brandingError) throw brandingError;

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
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 gap-8 mb-8 overflow-x-auto hide-scrollbar">
        {['home', 'branding', 'story', 'faq', 'contact', 'shipping', 'privacy', 'terms'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 px-2 text-sm font-medium transition-colors border-b-2 capitalize whitespace-nowrap ${
              activeTab === tab 
                ? 'border-vandora-emerald text-vandora-emerald font-bold' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'home' ? 'Página de Inicio' : 
             tab === 'branding' ? 'Marca / Branding' :
             tab === 'story' ? 'Nuestra Historia' : 
             tab === 'faq' ? 'Preguntas Frecuentes' : 
             tab === 'contact' ? 'Contacto' : 
             tab === 'shipping' ? 'Envíos' :
             tab === 'privacy' ? 'Privacidad' : 'Términos'}
          </button>
        ))}
      </div>

      {activeTab === 'branding' && (
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in transition-all duration-300">
          <div className="bg-gray-50 border-b px-8 py-4 flex items-center justify-between">
            <div className="flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-vandora-emerald" />
              <h2 className="text-xl font-serif text-gray-900">Configuración de Marca</h2>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-vandora-emerald text-white px-6 py-2 rounded-md hover:bg-emerald-800 flex items-center shadow-md disabled:opacity-50"
            >
              {saving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Guardar Marca
            </button>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Favicon (Icono de pestaña)</label>
                   <p className="text-xs text-gray-400 mb-4">Se recomienda una imagen cuadrada (.png o .ico) de 32x32px o 64x64px.</p>
                   <ImageUpload 
                    label="Subir Favicon"
                    currentImage={branding.favicon}
                    onUpload={(url: string) => setBranding({ ...branding, favicon: url })}
                   />
                </div>
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Logo de la Web (Navbar)</label>
                   <p className="text-xs text-gray-400 mb-4">Aparecerá en la parte superior de todas las páginas. Se recomienda fondo transparente.</p>
                   <ImageUpload 
                    label="Subir Logo"
                    currentImage={branding.siteLogo}
                    onUpload={(url: string) => setBranding({ ...branding, siteLogo: url })}
                   />
                </div>
              </div>
              <div className="space-y-6">
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Nombre del Sitio</label>
                   <input 
                    type="text" 
                    value={branding.siteName}
                    onChange={(e) => setBranding({...branding, siteName: e.target.value})}
                    className="w-full border rounded-lg p-3 font-medium focus:ring-2 focus:ring-vandora-emerald outline-none"
                    placeholder="Ej: Vandora"
                   />
                </div>
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                  <h4 className="text-blue-800 font-bold text-sm mb-2 flex items-center">
                    <Sparkles className="w-4 h-4 mr-2" /> ¿Dónde se aplica esto?
                  </h4>
                  <ul className="text-blue-700 text-xs space-y-2">
                    <li>• El <strong>Favicon</strong> aparecerá en la pestaña del navegador de tus clientes.</li>
                    <li>• El <strong>Logo</strong> reemplazará el nombre de texto "VANDORA" en la barra de navegación superior.</li>
                    <li>• El <strong>Nombre del Sitio</strong> se usará para correos electrónicos y títulos de página predeterminados.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {activeTab === 'home' && (
        <div className="space-y-12 animate-in fade-in transition-all duration-300">
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ImageUpload 
                          label="Imagen Escritorio (2000x1000px)"
                          currentImage={slide.imageDesktop} 
                          onUpload={(url) => handleSlideChange(slide.id, 'imageDesktop', url)}
                        />
                        <ImageUpload 
                          label="Imagen Mobile (800x1200px)"
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
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Color del Botón (Hex, RGB, HSL)</label>
                        <div className="flex gap-2">
                            <input 
                              type="color" 
                              value={slide.buttonColor.startsWith('#') && slide.buttonColor.length === 7 ? slide.buttonColor : '#000000'} 
                              onChange={(e) => handleSlideChange(slide.id, 'buttonColor', e.target.value)}
                              className="h-12 w-16 border rounded cursor-pointer" 
                            />
                            <input 
                              type="text" 
                              placeholder="Ej: #D4AF37 o rgb(212, 175, 55)"
                              value={slide.buttonColor} 
                              onChange={(e) => handleSlideChange(slide.id, 'buttonColor', e.target.value)}
                              className="flex-1 border rounded-lg px-3 text-sm" 
                            />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Color de Texto (Hex, RGB, HSL)</label>
                        <div className="flex gap-2">
                            <input 
                              type="color" 
                              value={(slide.textColor && slide.textColor.startsWith('#') && slide.textColor.length === 7) ? slide.textColor : '#FFFFFF'} 
                              onChange={(e) => handleSlideChange(slide.id, 'textColor', e.target.value)}
                              className="h-12 w-16 border rounded cursor-pointer" 
                            />
                             <input 
                              type="text" 
                              placeholder="Ej: #FFFFFF o white"
                              value={slide.textColor || '#FFFFFF'} 
                              onChange={(e) => handleSlideChange(slide.id, 'textColor', e.target.value)}
                              className="flex-1 border rounded-lg px-3 text-sm" 
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

          {/* Founder Section */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 border-b px-8 py-4 flex items-center">
              <ImageIcon className="w-5 h-5 mr-2 text-vandora-emerald" />
              <h2 className="text-xl font-serif text-gray-900">Sección Fundadora (Home)</h2>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Imagen Fundadora</label>
                  <ImageUpload 
                    label="Imagen Fundadora"
                    currentImage={founderSection.image}
                    onUpload={(url: string) => setFounderSection({ ...founderSection, image: url })}
                  />
                </div>
                <div className="lg:col-span-8 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Título</label>
                    <input 
                      type="text" 
                      value={founderSection.title}
                      onChange={(e) => setFounderSection({ ...founderSection, title: e.target.value })}
                      className="w-full border rounded-lg p-3 font-serif text-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Párrafo 1</label>
                    <textarea 
                      rows={3}
                      value={founderSection.description1}
                      onChange={(e) => setFounderSection({ ...founderSection, description1: e.target.value })}
                      className="w-full border rounded-lg p-3"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Párrafo 2</label>
                    <textarea 
                      rows={3}
                      value={founderSection.description2}
                      onChange={(e) => setFounderSection({ ...founderSection, description2: e.target.value })}
                      className="w-full border rounded-lg p-3"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Texto del Botón</label>
                      <input 
                        type="text" 
                        value={founderSection.buttonText}
                        onChange={(e) => setFounderSection({ ...founderSection, buttonText: e.target.value })}
                        className="w-full border rounded-lg p-3"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Link del Botón</label>
                      <input 
                        type="text" 
                        value={founderSection.buttonLink}
                        onChange={(e) => setFounderSection({ ...founderSection, buttonLink: e.target.value })}
                        className="w-full border rounded-lg p-3"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {activeTab === 'story' && (
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in transition-all duration-300">
          <div className="bg-gray-50 border-b px-8 py-4 flex items-center">
            <ImageIcon className="w-5 h-5 mr-2 text-vandora-emerald" />
            <h2 className="text-xl font-serif text-gray-900">Página: Nuestra Historia</h2>
          </div>
          <div className="p-8">
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Imagen Principal</label>
                  <ImageUpload 
                    label="Imagen Principal"
                    currentImage={storyPage.image}
                    onUpload={(url: string) => setStoryPage({ ...storyPage, image: url })}
                  />
                </div>
                <div className="lg:col-span-8 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Título de la Página</label>
                    <input type="text" value={storyPage.title} onChange={(e) => setStoryPage({ ...storyPage, title: e.target.value })} className="w-full border rounded-lg p-3" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Frase / Cita</label>
                    <textarea rows={2} value={storyPage.quote} onChange={(e) => setStoryPage({ ...storyPage, quote: e.target.value })} className="w-full border rounded-lg p-3" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Párrafo 1</label>
                    <textarea rows={4} value={storyPage.body1} onChange={(e) => setStoryPage({ ...storyPage, body1: e.target.value })} className="w-full border rounded-lg p-3" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Párrafo 2</label>
                    <textarea rows={4} value={storyPage.body2} onChange={(e) => setStoryPage({ ...storyPage, body2: e.target.value })} className="w-full border rounded-lg p-3" />
                  </div>
                </div>
             </div>
          </div>
        </section>
      )}

      {activeTab === 'faq' && (
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in transition-all duration-300">
          <div className="bg-gray-50 border-b px-8 py-4 flex justify-between items-center">
            <div className="flex items-center">
              <Plus className="w-5 h-5 mr-2 text-vandora-emerald" />
              <h2 className="text-xl font-serif text-gray-900">Página: Preguntas Frecuentes</h2>
            </div>
            <button
               onClick={() => setFaqPage([...faqPage, { question: '', answer: '' }])}
               className="bg-white text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 border flex items-center shadow-sm text-sm"
            >
              <Plus className="h-4 w-4 mr-2" /> Añadir Pregunta
            </button>
          </div>
          <div className="p-8 space-y-6">
            {faqPage.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                No hay preguntas configuradas.
              </div>
            )}
            {faqPage.map((faq, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200 relative group">
                 <button 
                  onClick={() => setFaqPage(faqPage.filter((_, i) => i !== idx))}
                  className="absolute -top-3 -right-3 bg-red-500 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash className="h-4 w-4" />
                </button>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Pregunta</label>
                    <input type="text" value={faq.question} onChange={(e) => {
                      const newFaqs = [...faqPage];
                      newFaqs[idx].question = e.target.value;
                      setFaqPage(newFaqs);
                    }} className="w-full border rounded-lg p-2" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Respuesta</label>
                    <textarea rows={2} value={faq.answer} onChange={(e) => {
                      const newFaqs = [...faqPage];
                      newFaqs[idx].answer = e.target.value;
                      setFaqPage(newFaqs);
                    }} className="w-full border rounded-lg p-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
      {activeTab === 'contact' && (
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in transition-all duration-300">
           <div className="bg-gray-50 border-b px-8 py-4 flex items-center">
            <Globe className="w-5 h-5 mr-2 text-vandora-emerald" />
            <h2 className="text-xl font-serif text-gray-900">Página: Contacto</h2>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                 <h3 className="font-bold text-gray-700 uppercase tracking-widest text-xs border-b pb-2">Sección Ubicación</h3>
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Título</label>
                    <input type="text" value={contactPage.address_title} onChange={(e) => setContactPage({...contactPage, address_title: e.target.value})} className="w-full border rounded-lg p-2" />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Dirección Línea 1</label>
                    <input type="text" value={contactPage.address_line1} onChange={(e) => setContactPage({...contactPage, address_line1: e.target.value})} className="w-full border rounded-lg p-2" />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Dirección Línea 2</label>
                    <input type="text" value={contactPage.address_line2} onChange={(e) => setContactPage({...contactPage, address_line2: e.target.value})} className="w-full border rounded-lg p-2" />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Horarios</label>
                    <input type="text" value={contactPage.hours} onChange={(e) => setContactPage({...contactPage, hours: e.target.value})} className="w-full border rounded-lg p-2" />
                 </div>
              </div>
              <div className="space-y-4">
                 <h3 className="font-bold text-gray-700 uppercase tracking-widest text-xs border-b pb-2">Sección Contacto Directo</h3>
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Título</label>
                    <input type="text" value={contactPage.write_title} onChange={(e) => setContactPage({...contactPage, write_title: e.target.value})} className="w-full border rounded-lg p-2" />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                    <input type="email" value={contactPage.email} onChange={(e) => setContactPage({...contactPage, email: e.target.value})} className="w-full border rounded-lg p-2" />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Teléfono</label>
                    <input type="text" value={contactPage.phone} onChange={(e) => setContactPage({...contactPage, phone: e.target.value})} className="w-full border rounded-lg p-2" />
                 </div>
              </div>
          </div>
        </section>
      )}

      {activeTab === 'shipping' && (
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in transition-all duration-300">
           <div className="bg-gray-50 border-b px-8 py-4 flex items-center">
            <Truck className="w-5 h-5 mr-2 text-vandora-emerald" />
            <h2 className="text-xl font-serif text-gray-900">Página: Envíos y Devoluciones</h2>
          </div>
          <div className="p-8 space-y-8">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Título de la Página</label>
                <input type="text" value={shippingPage.title} onChange={(e) => setShippingPage({...shippingPage, title: e.target.value})} className="w-full border rounded-lg p-3" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-700 uppercase tracking-widest text-xs border-b pb-2">Sección Envíos</h3>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Título Sección</label>
                    <input type="text" value={shippingPage.shipping_title} onChange={(e) => setShippingPage({...shippingPage, shipping_title: e.target.value})} className="w-full border rounded-lg p-2" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Línea 1 (Empresa/Metodo)</label>
                    <input type="text" value={shippingPage.shipping_line1} onChange={(e) => setShippingPage({...shippingPage, shipping_line1: e.target.value})} className="w-full border rounded-lg p-2" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Línea 2 (Tiempos)</label>
                    <input type="text" value={shippingPage.shipping_line2} onChange={(e) => setShippingPage({...shippingPage, shipping_line2: e.target.value})} className="w-full border rounded-lg p-2" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Línea 3 (Costos)</label>
                    <input type="text" value={shippingPage.shipping_line3} onChange={(e) => setShippingPage({...shippingPage, shipping_line3: e.target.value})} className="w-full border rounded-lg p-2" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-gray-700 uppercase tracking-widest text-xs border-b pb-2">Sección Devoluciones</h3>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Título Sección</label>
                    <input type="text" value={shippingPage.return_title} onChange={(e) => setShippingPage({...shippingPage, return_title: e.target.value})} className="w-full border rounded-lg p-2" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descripción</label>
                    <textarea rows={3} value={shippingPage.return_desc} onChange={(e) => setShippingPage({...shippingPage, return_desc: e.target.value})} className="w-full border rounded-lg p-2" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-700 uppercase tracking-widest text-xs border-b pb-2 mb-4">Condiciones de Retorno</h3>
                <div className="space-y-2">
                  {shippingPage.return_conditions.map((cond: string, idx: number) => (
                    <div key={idx} className="flex gap-2">
                       <input type="text" value={cond} onChange={(e) => {
                         const newConds = [...shippingPage.return_conditions];
                         newConds[idx] = e.target.value;
                         setShippingPage({...shippingPage, return_conditions: newConds});
                       }} className="flex-1 border rounded-lg p-2" />
                       <button 
                        onClick={() => setShippingPage({...shippingPage, return_conditions: shippingPage.return_conditions.filter((_: any, i: number) => i !== idx)})}
                        className="p-2 text-red-500 hover:bg-red-50 rounded"
                       >
                         <Trash className="h-4 w-4" />
                       </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => setShippingPage({...shippingPage, return_conditions: [...shippingPage.return_conditions, '']})}
                    className="text-vandora-emerald text-sm font-bold flex items-center mt-2"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Añadir Condición
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Texto Footer (Contactar para cambios)</label>
                    <textarea rows={2} value={shippingPage.footer_text} onChange={(e) => setShippingPage({...shippingPage, footer_text: e.target.value})} className="w-full border rounded-lg p-2" />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email de Contacto (para el link)</label>
                    <input type="email" value={shippingPage.contact_email} onChange={(e) => setShippingPage({...shippingPage, contact_email: e.target.value})} className="w-full border rounded-lg p-2" />
                 </div>
              </div>
          </div>
        </section>
      )}

      {(activeTab === 'privacy' || activeTab === 'terms') && (
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in transition-all duration-300">
          <div className="bg-gray-50 border-b px-8 py-4 flex items-center">
            <Globe className="w-5 h-5 mr-2 text-vandora-emerald" />
            <h2 className="text-xl font-serif text-gray-900">
              Página: {activeTab === 'privacy' ? 'Política de Privacidad' : 'Términos y Condiciones'}
            </h2>
          </div>
          <div className="p-8 space-y-8">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Título de la Página</label>
              <input 
                type="text" 
                value={activeTab === 'privacy' ? privacyPage.title : termsPage.title} 
                onChange={(e) => {
                  if (activeTab === 'privacy') setPrivacyPage({...privacyPage, title: e.target.value});
                  else setTermsPage({...termsPage, title: e.target.value});
                }} 
                className="w-full border rounded-lg p-3" 
              />
            </div>
            
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-bold text-gray-700 uppercase tracking-widest text-xs">Secciones de Contenido</h3>
                <button 
                  onClick={() => {
                    const newSection = { title: '', text: '' };
                    if (activeTab === 'privacy') setPrivacyPage({...privacyPage, sections: [...privacyPage.sections, newSection]});
                    else setTermsPage({...termsPage, sections: [...termsPage.sections, newSection]});
                  }}
                  className="text-vandora-emerald text-xs font-bold flex items-center hover:underline"
                >
                  <Plus className="h-3 w-3 mr-1" /> Añadir Sección
                </button>
              </div>
              
              <div className="space-y-6">
                {(activeTab === 'privacy' ? privacyPage.sections : termsPage.sections).map((section: any, idx: number) => (
                  <div key={idx} className="bg-gray-50 p-4 rounded-lg relative group">
                    <button 
                      onClick={() => {
                        if (activeTab === 'privacy') setPrivacyPage({...privacyPage, sections: privacyPage.sections.filter((_: any, i: number) => i !== idx)});
                        else setTermsPage({...termsPage, sections: termsPage.sections.filter((_: any, i: number) => i !== idx)});
                      }}
                      className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Título de Sección</label>
                        <input 
                          type="text" 
                          value={section.title} 
                          onChange={(e) => {
                            const newSections = [...(activeTab === 'privacy' ? privacyPage.sections : termsPage.sections)];
                            newSections[idx].title = e.target.value;
                            if (activeTab === 'privacy') setPrivacyPage({...privacyPage, sections: newSections});
                            else setTermsPage({...termsPage, sections: newSections});
                          }}
                          className="w-full border rounded p-2 text-sm" 
                          placeholder="Ej: Información Recopilada"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Contenido</label>
                        <textarea 
                          rows={4} 
                          value={section.text} 
                          onChange={(e) => {
                            const newSections = [...(activeTab === 'privacy' ? privacyPage.sections : termsPage.sections)];
                            newSections[idx].text = e.target.value;
                            if (activeTab === 'privacy') setPrivacyPage({...privacyPage, sections: newSections});
                            else setTermsPage({...termsPage, sections: newSections});
                          }}
                          className="w-full border rounded p-2 text-sm"
                          placeholder="Escriba aquí el contenido detallado..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

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
