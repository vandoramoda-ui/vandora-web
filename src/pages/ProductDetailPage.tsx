import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../lib/utils';
import { Star, Truck, ShieldCheck, ArrowLeft, Minus, Plus, ChevronDown, ChevronUp, Clock, Eye, ShoppingBag, Play, X, Ruler, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ProductCard from '../components/ProductCard';
import SEO from '../components/SEO';
import SizeGuideModal from '../components/SizeGuideModal';

// Reusing MOCK_PRODUCTS for simplicity in this demo if ID matches
const MOCK_PRODUCTS = [
  {
    id: '1',
    name: 'Vestido Esmeralda Real',
    price: 85.00,
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1000&auto=format&fit=crop',
    images: [
      { url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1000&auto=format&fit=crop', color: 'Esmeralda' },
      { url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=1000&auto=format&fit=crop', color: 'Esmeralda' },
      { url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=1000&auto=format&fit=crop' } // Generic
    ],
    videos: [],
    category: 'Vestidos',
    description: 'Un vestido que impone presencia. Corte elegante y tela suave que se adapta a tu figura. Perfecto para eventos formales o una cena especial.',
    details: 'Cierre invisible en la espalda. Forro interno suave. Largo midi. Diseñado para realzar la figura femenina con elegancia y comodidad.',
    materials: '95% Poliéster de alta calidad, 5% Elastano. Tela transpirable con caída perfecta que no se arruga fácilmente.',
    care: 'Lavar a mano con agua fría o en ciclo delicado. No usar blanqueador. Secar a la sombra. Planchar a temperatura baja si es necesario.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'Esmeralda', code: '#50C878' }, { name: 'Negro', code: '#000000' }],
    stock: 10
  },
  {
    id: '2',
    name: 'Blusa Seda Champagne',
    price: 45.00,
    image: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?q=80&w=1000&auto=format&fit=crop',
    images: [
      { url: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?q=80&w=1000&auto=format&fit=crop', color: 'Champagne' },
      { url: 'https://images.unsplash.com/photo-1551163943-3f6a29e39454?q=80&w=1000&auto=format&fit=crop', color: 'Blanco' }
    ],
    videos: [],
    category: 'Blusas',
    description: 'Suavidad y brillo sutil para tus reuniones más importantes. Combínala con pantalones de vestir o faldas lápiz.',
    details: 'Botones de nácar. Cuello clásico. Puños ajustables. Corte regular fit.',
    materials: '100% Seda Mulberry. Textura suave y lujosa.',
    care: 'Lavado en seco exclusivamente. Planchar a temperatura baja sin vapor.',
    sizes: ['S', 'M', 'L'],
    colors: [{ name: 'Champagne', code: '#F7E7CE' }, { name: 'Blanco', code: '#FFFFFF' }],
    stock: 15
  },
  {
    id: '3',
    name: 'Pantalón Palazzo Crema',
    price: 60.00,
    image: 'https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?q=80&w=1000&auto=format&fit=crop',
    images: [
      { url: 'https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?q=80&w=1000&auto=format&fit=crop', color: 'Crema' },
      { url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=1000&auto=format&fit=crop', color: 'Negro' }
    ],
    videos: [],
    category: 'Pantalones',
    description: 'Comodidad y estilo en una sola prenda. Perfecto para la oficina o un evento casual. Tela transpirable y caída perfecta.',
    details: 'Cintura alta. Bolsillos laterales funcionales. Cierre frontal con gancho y cremallera.',
    materials: '70% Viscosa, 30% Lino. Fresco y ligero.',
    care: 'Lavar a máquina en ciclo suave. No usar secadora. Planchar a temperatura media.',
    sizes: ['M', 'L', 'XL'],
    colors: [{ name: 'Crema', code: '#FFFDD0' }, { name: 'Negro', code: '#000000' }, { name: 'Azul Marino', code: '#000080' }],
    stock: 8
  },
  // ... add others if needed or fetch from DB
];

const ProductDetailPage = () => {
  const { categoria, slug } = useParams<{ categoria: string; slug: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeAccordion, setActiveAccordion] = useState<string | null>('details');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  // CRO States
  const [viewersCount, setViewersCount] = useState(12);
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 59 });

  // Filtered media based on color
  const [filteredImages, setFilteredImages] = useState<any[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<any[]>([]);

  const toggleAccordion = (id: string) => {
    setActiveAccordion(activeAccordion === id ? null : id);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setViewersCount(prev => Math.max(5, prev + Math.floor(Math.random() * 3) - 1));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .single();

      if (!error && data) {
        const parseJSON = (val: any) => {
          if (typeof val !== 'string') return val;
          try {
            const parsed = JSON.parse(val);
            return parsed && typeof parsed === 'object' ? parsed : val;
          } catch (e) {
            return val;
          }
        };

        // Normalize data to ensure arrays exist and have correct object shape
        const normalizedData = {
          ...data,
          images: Array.isArray(data.images) 
            ? data.images.map((img: any) => {
              const parsed = parseJSON(img);
              return typeof parsed === 'string' ? { url: parsed } : parsed;
            }) : [],
          colors: Array.isArray(data.colors) 
            ? data.colors.map((c: any) => {
              const parsed = parseJSON(c);
              return typeof parsed === 'object' && parsed !== null ? parsed : { name: String(c), code: '#CCCCCC' };
            }) : [],
          sizes: Array.isArray(data.sizes) ? data.sizes : [],
          videos: Array.isArray(data.videos) 
            ? data.videos.map((v: any) => {
              const parsed = parseJSON(v);
              return typeof parsed === 'string' ? { url: parsed } : parsed;
            }) : []
        };

        // Ensure a main image exists if the image column is empty but images array has data
        if (!normalizedData.image && normalizedData.images.length > 0) {
          normalizedData.image = normalizedData.images[0].url;
        }
        setProduct(normalizedData);
        if (normalizedData.sizes.length > 0) setSelectedSize(normalizedData.sizes[0]);
        if (normalizedData.colors.length > 0) setSelectedColor(normalizedData.colors[0].name);
      } else {
        navigate('/tienda');
      }
    };
    fetchProduct();
  }, [slug, navigate]);

  // Update filtered media when color changes
  useEffect(() => {
    if (product) {
      // Images
      const allImages = Array.isArray(product.images) ? product.images : [];
      const images = allImages.filter((img: any) => !img.color || img.color === selectedColor);
      setFilteredImages(images.length > 0 ? images : allImages);

      // Videos
      const allVideos = Array.isArray(product.videos) ? product.videos : [];
      const vids = allVideos.filter((vid: any) => !vid.color || vid.color === selectedColor);
      setFilteredVideos(vids.length > 0 ? vids : allVideos);

      setActiveImageIndex(0);
    }
  }, [selectedColor, product]);

  // Auto-slide for mobile
  useEffect(() => {
    const interval = setInterval(() => {
      if (!showVideo && filteredImages.length > 1) {
        setActiveImageIndex(prev => (prev + 1) % filteredImages.length);
      }
    }, 4000); // 4 seconds
    return () => clearInterval(interval);
  }, [filteredImages.length, showVideo]);

  if (!product) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: quantity,
      size: selectedSize,
      color: selectedColor
    });
  };

  const hasVideo = filteredVideos.length > 0;
  const activeVideo = filteredVideos[0];

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % filteredImages.length);
  };

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + filteredImages.length) % filteredImages.length);
  };

  return (
    <div className="bg-white min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <SEO
        title={product.name}
        description={product.description}
        image={product.image}
        type="product"
      />

      <SizeGuideModal isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} />

      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-500 hover:text-vandora-emerald mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-gray-100 group">
              {showVideo && hasVideo ? (
                <div className="w-full h-full flex items-center justify-center bg-black">
                  {/* Placeholder for video player - in real app use <video> or iframe */}
                  <div className="text-white text-center">
                    <Play className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Reproduciendo video: {activeVideo?.url || 'N/A'}</p>
                    <button
                      onClick={() => setShowVideo(false)}
                      className="mt-4 text-sm underline hover:text-gray-300"
                    >
                      Volver a imágenes
                    </button>
                  </div>
                </div>
              ) : (
                <motion.img
                  key={activeImageIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  src={filteredImages[activeImageIndex]?.url || product.image}
                  alt={product.name}
                  className="h-full w-full object-cover object-center"
                />
              )}

              {/* Mobile Arrows */}
              {!showVideo && filteredImages.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md lg:hidden"
                  >
                    <ArrowLeft className="h-4 w-4 text-gray-800" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md lg:hidden"
                  >
                    <ArrowLeft className="h-4 w-4 text-gray-800 rotate-180" />
                  </button>
                </>
              )}

              {/* Image Navigation Dots (Mobile/Tablet) */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 lg:hidden">
                {filteredImages.map((_: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-colors ${activeImageIndex === idx ? 'bg-white' : 'bg-white/50'
                      }`}
                  />
                ))}
              </div>
            </div>

            {/* Thumbnail Gallery (Desktop) */}
            <div className="hidden lg:grid grid-cols-5 gap-4">
              {filteredImages.map((img: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveImageIndex(idx);
                    setShowVideo(false);
                  }}
                  className={`aspect-square rounded-md overflow-hidden border-2 transition-all ${activeImageIndex === idx && !showVideo ? 'border-vandora-emerald opacity-100' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                >
                  <img src={img.url} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
              {hasVideo && (
                <button
                  onClick={() => setShowVideo(true)}
                  className={`aspect-square rounded-md overflow-hidden border-2 flex items-center justify-center bg-gray-100 transition-all ${showVideo ? 'border-vandora-emerald' : 'border-transparent hover:bg-gray-200'
                    }`}
                >
                  <Play className="h-8 w-8 text-gray-600" />
                </button>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="mb-6">
              <h1 className="text-3xl sm:text-4xl font-serif text-gray-900 mb-2">{product.name}</h1>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-500 underline cursor-pointer hover:text-vandora-emerald">(24 reseñas)</span>
                </div>

                {/* Social Proof */}
                <div className="flex items-center text-xs text-red-500 font-medium animate-pulse">
                  <Eye className="h-3 w-3 mr-1" />
                  {viewersCount} personas viendo ahora
                </div>
              </div>

              <p className="text-3xl font-medium text-vandora-emerald mb-4">{formatPrice(product.price)}</p>

              {/* Urgency/Scarcity */}
              {product.stock < 15 && (
                <div className="mb-6 bg-orange-50 border border-orange-100 rounded-md p-3 flex items-start">
                  <Clock className="h-5 w-5 text-orange-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-orange-800 font-medium">¡Solo quedan {product.stock} unidades!</p>
                    <p className="text-xs text-orange-600 mt-1">Ordena en las próximas {timeLeft.hours}h {timeLeft.minutes}m para recibirlo mañana.</p>
                  </div>
                </div>
              )}

              <div className="prose prose-sm text-gray-600 mb-8">
                <p>{product.description}</p>
              </div>
            </div>

            {/* Selectors */}
            <div className="space-y-6 mb-8 bg-gray-50 p-6 rounded-lg border border-gray-100">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Color: <span className="text-gray-500 font-normal">{selectedColor}</span></h3>
                <div className="flex space-x-3">
                  {product.colors.map((color: any) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={`w-10 h-10 rounded-full border-2 focus:outline-none transition-all ${selectedColor === color.name
                        ? 'border-vandora-emerald ring-2 ring-emerald-100 ring-offset-2 scale-110'
                        : 'border-gray-200 hover:border-gray-300 hover:scale-105'
                        }`}
                      style={{ backgroundColor: color.code }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-gray-900">Talla</h3>
                  <button
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="text-xs text-vandora-emerald underline flex items-center hover:text-emerald-800"
                  >
                    <Ruler className="h-3 w-3 mr-1" />
                    Guía de Tallas
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[3rem] h-12 px-3 flex items-center justify-center border rounded-md text-sm font-medium transition-all ${selectedSize === size
                        ? 'border-vandora-emerald text-vandora-emerald bg-white shadow-sm ring-1 ring-vandora-emerald'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
                        }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Cantidad</h3>
                <div className="flex items-center w-32 border border-gray-300 rounded-md bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-gray-50 text-gray-600 transition-colors disabled:opacity-50"
                    disabled={quantity <= 1}
                    aria-label="Disminuir cantidad"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="flex-1 text-center font-medium text-gray-900 select-none">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:bg-gray-50 text-gray-600 transition-colors"
                    aria-label="Aumentar cantidad"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col space-y-4 mb-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-vandora-emerald text-white py-4 px-8 rounded-md hover:bg-emerald-800 transition-all font-medium shadow-lg hover:shadow-xl active:transform active:scale-[0.98] flex items-center justify-center text-lg uppercase tracking-wide order-last sm:order-first"
                >
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  Añadir al Carrito
                </button>
                <a
                  href={`https://wa.me/593900000000?text=Hola! Estoy interesada en el producto: ${product.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-white text-[#25D366] border-2 border-[#25D366] py-4 px-8 rounded-md hover:bg-[#25D366] hover:text-white transition-all font-medium shadow-sm hover:shadow-md flex items-center justify-center text-lg uppercase tracking-wide"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Consultar WhatsApp
                </a>
              </div>

              {/* Free Shipping Progress */}
              <div className="bg-emerald-50 rounded-md p-3 text-center text-sm text-emerald-800 border border-emerald-100">
                <span className="font-medium">¡Envío Gratis!</span> en pedidos superiores a $100.
                {product.price * quantity < 100 && (
                  <span className="block text-xs mt-1 text-emerald-600">
                    Agrega {formatPrice(100 - (product.price * quantity))} más para calificar.
                  </span>
                )}
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4 border-t border-gray-200 pt-6">
              <div className="flex items-start space-x-3">
                <Truck className="h-6 w-6 text-vandora-gold flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Envío Rápido</h4>
                  <p className="text-xs text-gray-500 mt-1">Entrega en 2-3 días hábiles a todo el país.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <ShieldCheck className="h-6 w-6 text-vandora-gold flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Garantía Total</h4>
                  <p className="text-xs text-gray-500 mt-1">30 días para cambios o devoluciones sin costo.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Information Accordion */}
        <div className="mt-16 border-t border-gray-200 pt-10">
          <div className="max-w-4xl mx-auto space-y-4">
            {['Detalles', 'Materiales', 'Cuidados'].map((section) => (
              <div key={section} className="border-b border-gray-200 pb-4">
                <button
                  onClick={() => toggleAccordion(section.toLowerCase())}
                  className="flex w-full items-center justify-between py-4 text-left text-lg font-medium text-gray-900 hover:text-vandora-emerald transition-colors group"
                >
                  {section}
                  {activeAccordion === section.toLowerCase() ? (
                    <ChevronUp className="h-5 w-5 text-gray-500 group-hover:text-vandora-emerald" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500 group-hover:text-vandora-emerald" />
                  )}
                </button>
                <AnimatePresence>
                  {activeAccordion === section.toLowerCase() && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="pb-6 text-gray-600 leading-relaxed">
                        {section === 'Detalles' && (product.details || 'Sin detalles adicionales.')}
                        {section === 'Materiales' && (product.materials || 'Información de materiales no disponible.')}
                        {section === 'Cuidados' && (product.care || 'Información de cuidados no disponible.')}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16 border-t border-gray-200 pt-10">
          <h2 className="text-2xl font-serif text-gray-900 mb-8 text-center">Reseñas de Clientes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { id: 1, user: 'Maria G.', rating: 5, date: 'Hace 2 días', comment: 'Me encanta la tela, es súper suave y el corte es perfecto. Definitivamente compraré más.' },
              { id: 2, user: 'Ana P.', rating: 4, date: 'Hace 1 semana', comment: 'El color es un poco más oscuro que en la foto, pero igual es hermoso y muy elegante.' },
              { id: 3, user: 'Sofia L.', rating: 5, date: 'Hace 2 semanas', comment: 'Llegó súper rápido y el empaque es divino. Se nota el cariño en cada detalle.' }
            ].map((review) => (
              <div key={review.id} className="bg-gray-50 p-6 rounded-lg shadow-sm">
                <div className="flex items-center mb-3">
                  <div className="flex text-yellow-400 mr-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">{review.date}</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-2">{review.user}</h4>
                <p className="text-gray-600 text-sm italic">"{review.comment}"</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Products */}
        <div className="mt-16 border-t border-gray-200 pt-10">
          <h2 className="text-2xl font-serif text-gray-900 mb-8 text-center">También te podría gustar</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {MOCK_PRODUCTS.filter(p => p.id !== product.id).slice(0, 4).map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} {...relatedProduct} />
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Mobile Add to Cart */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 lg:hidden z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <div className="flex gap-4">
          <div className="flex flex-col justify-center">
            <span className="text-xs text-gray-500">Total:</span>
            <span className="font-bold text-vandora-emerald">{formatPrice(product.price * quantity)}</span>
          </div>
          <button
            onClick={handleAddToCart}
            className="flex-1 bg-vandora-emerald text-white py-3 rounded-md font-medium shadow-sm active:scale-[0.98] transition-transform"
          >
            Añadir al Carrito
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;

