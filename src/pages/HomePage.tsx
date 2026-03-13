import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight, Loader2 } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabase';

const HomePage = () => {
  const [heroSlides, setHeroSlides] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [founderSection, setFounderSection] = useState<any>({
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1000&auto=format&fit=crop',
    title: 'De la Calle a la Vitrina',
    description1: 'Vandora nació del sueño de una mujer que entendió que el verdadero lujo es la libertad de ser una misma. Cada prenda está diseñada pensando en la mujer ecuatoriana: fuerte, diversa y llena de ambición.',
    description2: 'Únete a nuestra comunidad de "Mujeres que Florecen". Comparte tu historia y viste con el orgullo de quien ha luchado por cada logro.',
    buttonText: 'Leer Nuestra Historia',
    buttonLink: '/nuestra-historia'
  });
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch Hero Slides
        const { data: heroData } = await supabase
          .from('site_content')
          .select('content')
          .eq('section_key', 'hero_slides')
          .single();
        
        if (heroData?.content) {
          setHeroSlides(heroData.content);
        } else {
          // Fallback static slides if record doesn't exist
          setHeroSlides([
            {
              id: 1,
              imageDesktop: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000&auto=format&fit=crop',
              imageMobile: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop',
              title: 'El Legado del Florecimiento',
              subtitle: 'Para la mujer que empezó desde cero y hoy conquista sus metas.',
              buttonText: 'Explorar Colección',
              buttonLink: '/tienda',
              buttonColor: '#D4AF37',
              textColor: '#FFFFFF'
            }
          ]);
        }

        // Fetch Categories
        const { data: catData } = await supabase
          .from('product_categories')
          .select('name, image_url')
          .order('name');
        
        if (catData) {
          setCategories(catData.map(c => ({
            name: c.name,
            image: c.image_url || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=500&auto=format&fit=crop',
            link: `/tienda?category=${encodeURIComponent(c.name)}`
          })));
        }

        // Fetch Featured Products (last 3 for now)
        const { data: prodData } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);
        
        if (prodData) {
          const parseJSON = (val: any) => {
            if (typeof val !== 'string') return val;
            try {
              const parsed = JSON.parse(val);
              return parsed && typeof parsed === 'object' ? parsed : val;
            } catch (e) {
              return val;
            }
          };

          const mappedProducts = prodData.map((p: any) => {
            const rawImages = parseJSON(p.images);
            const images = Array.isArray(rawImages) ? rawImages.map((img: any) => {
              const parsed = parseJSON(img);
              return typeof parsed === 'string' ? { url: parsed } : parsed;
            }) : [];

            const rawColors = parseJSON(p.colors);
            const colors = Array.isArray(rawColors) ? rawColors.map((c: any) => {
              const parsed = parseJSON(c);
              return typeof parsed === 'object' && parsed !== null ? parsed : { name: String(c), code: '#CCCCCC' };
            }) : [];

            return {
              ...p,
              image: images.length > 0 ? images[0].url : (p.image || 'https://placehold.co/600x800?text=No+Image'),
              colors
            };
          });
          setFeaturedProducts(mappedProducts);
        }

        // Fetch Founder Section
        const { data: founderData } = await supabase
          .from('site_content')
          .select('content')
          .eq('section_key', 'founder_section')
          .single();
        
        if (founderData?.content) {
          setFounderSection(founderData.content);
        }
      } catch (err) {
        console.error('Error fetching home data:', err);
        // Fallback on error
        setHeroSlides([
          {
            id: 1,
            imageDesktop: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000&auto=format&fit=crop',
            imageMobile: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop',
            title: 'El Legado del Florecimiento',
            subtitle: 'Para la mujer que empezó desde cero y hoy conquista sus metas.',
            buttonText: 'Explorar Colección',
            buttonLink: '/tienda',
            buttonColor: '#D4AF37',
            textColor: '#FFFFFF'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Auto-slide
  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const nextSlide = () => {
    if (heroSlides.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };
  
  const prevSlide = () => {
    if (heroSlides.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const categoryScrollRef = React.useRef<HTMLDivElement>(null);

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const scrollAmount = 300;
      categoryScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center p-20 min-h-screen">
      <Loader2 className="w-8 h-8 animate-spin text-vandora-emerald" />
    </div>
  );

  return (
    <div className="bg-vandora-cream">
      <SEO 
        title="Inicio" 
        description="Vandora - Moda ecuatoriana que empodera. Descubre nuestra colección de vestidos, blusas y pantalones diseñados para la mujer moderna." 
      />
      
      {/* Hero Slider */}
      <section className="relative h-[60vh] md:h-[70vh] max-h-[700px] w-full overflow-hidden md:px-4 md:pt-4 bg-vandora-cream">
        <div className="relative w-full h-full overflow-hidden md:rounded-2xl bg-gray-900 shadow-2xl">
          {heroSlides.length > 0 && (
            <>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="absolute inset-0"
                >
                  {/* Desktop Image */}
                  <img 
                    src={heroSlides[currentSlide]?.imageDesktop} 
                    alt={heroSlides[currentSlide]?.title}
                    className="hidden md:block w-full h-full object-cover opacity-80"
                  />
                  {/* Mobile Image */}
                  <img 
                    src={heroSlides[currentSlide]?.imageMobile} 
                    alt={heroSlides[currentSlide]?.title}
                    className="block md:hidden w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                </motion.div>
              </AnimatePresence>

            <div className="absolute inset-0 flex items-center justify-center z-10 px-4">
              <div className="text-center max-w-4xl mx-auto">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    <h1 
                      className="font-serif text-4xl md:text-7xl mb-6 tracking-tight drop-shadow-lg"
                      style={{ color: heroSlides[currentSlide]?.textColor }}
                    >
                      {heroSlides[currentSlide]?.title}
                    </h1>
                    <p 
                      className="text-lg md:text-xl font-light mb-8 max-w-2xl mx-auto drop-shadow-md"
                      style={{ color: heroSlides[currentSlide]?.textColor }}
                    >
                      {heroSlides[currentSlide]?.subtitle}
                    </p>
                    <Link 
                      to={heroSlides[currentSlide]?.buttonLink}
                      className="inline-block px-8 py-4 rounded-sm font-semibold uppercase tracking-widest text-sm transition-transform hover:scale-105 shadow-lg"
                      style={{ 
                        backgroundColor: heroSlides[currentSlide]?.buttonColor,
                        color: '#FFFFFF'
                      }}
                    >
                      {heroSlides[currentSlide]?.buttonText}
                    </Link>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </>
        )}

        {/* Slider Controls */}
        {heroSlides.length > 1 && (
          <>
            <button 
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-sm text-white transition-colors z-20"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>
            <button 
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-sm text-white transition-colors z-20"
            >
              <ChevronRight className="h-8 w-8" />
            </button>
            <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-2 z-20">
              {heroSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    currentSlide === idx ? 'bg-white scale-125' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
            </>
          )}
        </div>
      </section>

      {/* Category Slider (CRO) */}
      <section className="py-12 px-4 bg-white border-b border-gray-100 relative group">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6 px-2">
            <h2 className="text-2xl font-serif text-gray-900 text-center md:text-left">Explora por Categoría</h2>
            <div className="hidden md:flex space-x-2">
              <button 
                onClick={() => scrollCategories('left')}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                aria-label="Anterior"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button 
                onClick={() => scrollCategories('right')}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                aria-label="Siguiente"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div 
            ref={categoryScrollRef}
            className="flex overflow-x-auto pb-4 gap-4 snap-x hide-scrollbar scroll-smooth"
          >
            {categories.map((cat) => (
              <Link 
                key={cat.name} 
                to={cat.link}
                className="flex-shrink-0 w-40 md:w-56 snap-start group/card relative"
              >
                <div className="aspect-[3/4] rounded-lg overflow-hidden mb-3 relative shadow-md">
                  <img 
                    src={cat.image} 
                    alt={cat.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover/card:opacity-90 transition-opacity" />
                  <div className="absolute bottom-4 left-0 right-0 text-center">
                    <h3 className="text-white font-medium text-lg tracking-wide flex items-center justify-center">
                      {cat.name} 
                      <ArrowRight className="h-4 w-4 ml-1 opacity-0 -translate-x-2 group-hover/card:opacity-100 group-hover/card:translate-x-0 transition-all duration-300" />
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          {/* Mobile Arrows Overlay */}
          <div className="md:hidden absolute top-1/2 -translate-y-1/2 left-2 right-2 flex justify-between pointer-events-none">
             <button 
                onClick={() => scrollCategories('left')}
                className="p-2 rounded-full bg-white/80 shadow-md text-gray-800 pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button 
                onClick={() => scrollCategories('right')}
                className="p-2 rounded-full bg-white/80 shadow-md text-gray-800 pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
          </div>
        </div>
      </section>

      {/* Manifesto Section */}
      <section className="py-12 px-4 bg-vandora-cream overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="absolute -top-10 left-1/2 -translate-x-1/2 text-[120px] font-serif text-vandora-gold/5 pointer-events-none select-none"
          >
            Vandora
          </motion.div>
          <h2 className="font-serif text-2xl md:text-3xl text-vandora-emerald mb-4 relative z-10">Nuestra Ideología</h2>
          <p className="text-gray-700 text-base md:text-lg leading-relaxed mb-6 italic font-serif relative z-10 max-w-2xl mx-auto">
            "Vandora es el reflejo de tu esfuerzo. No solo vestimos cuerpos, vestimos historias de resiliencia. 
            La elegancia no es un privilegio de nacimiento, sino un estado de superación."
          </p>
          <div className="w-16 h-0.5 bg-vandora-gold mx-auto" />
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="font-serif text-3xl text-vandora-black mb-2">Favoritos de la Temporada</h2>
            <p className="text-gray-500">Piezas seleccionadas para tu éxito diario.</p>
          </div>
          <Link to="/tienda" className="text-vandora-emerald font-medium hover:text-vandora-gold transition-colors border-b border-vandora-emerald hover:border-vandora-gold pb-1">
            Ver todo
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
       {/* Story / Founder Section */}
      <section className="py-16 bg-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative order-2 md:order-1"
            >
              <div className="absolute top-4 left-4 w-full h-full border border-vandora-gold/30 rounded-lg z-0" />
              <img 
                src={founderSection.image} 
                alt="Fundadora Vandora" 
                className="relative z-10 rounded-lg shadow-xl w-full h-[400px] md:h-[500px] object-cover grayscale hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-vandora-emerald rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 md:order-2 space-y-6"
            >
              <div className="inline-block px-3 py-1 bg-vandora-gold/10 text-vandora-gold text-[10px] tracking-widest uppercase rounded-full mb-2">
                Nuestra Fundadora
              </div>
              <h2 className="font-serif text-3xl md:text-4xl text-vandora-emerald leading-tight">
                {founderSection.title}
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed text-sm md:text-base">
                <p>{founderSection.description1}</p>
                <p className="border-l-2 border-vandora-gold/20 pl-4 italic">
                  {founderSection.description2}
                </p>
              </div>
              <Link 
                to="/nuestra-historia" 
                className="inline-flex items-center text-vandora-emerald font-medium hover:text-vandora-gold transition-colors group"
              >
                Conocer historia completa
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
      </section>
    </div>
  );
};

export default HomePage;
