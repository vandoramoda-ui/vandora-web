import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Edit, Trash, Package, ShoppingBag, Users, Layout as LayoutIcon, Sparkles, Settings, X, Image as ImageIcon, Menu, Ruler, Copy, Megaphone, Loader2, History } from 'lucide-react';
import { formatPrice } from '../lib/utils';
import MediaManager from '../components/MediaManager';
import SiteEditor from '../components/SiteEditor';
import QuizBuilder from '../components/QuizBuilder';
import SettingsEditor from '../components/SettingsEditor';
import VisualQuizBuilder from '../components/flow/VisualQuizBuilder';
import CheckoutSettingsEditor from '../components/CheckoutSettingsEditor';
import SizeGuideEditor from '../components/SizeGuideEditor';
import PopupManager from '../components/PopupManager';
import SEO from '../components/SEO';
import { useAuth } from '../context/AuthContext';

const AdminPage = () => {
  const { profile, loading: authLoading } = useAuth();
  const rawRole = profile?.role || 'cliente';
  const role = rawRole.toLowerCase().trim();

  const isSuperAdmin = ['superadmin'].includes(role);
  const isAdmin = ['superadmin', 'admin'].includes(role);
  const canManageProducts = ['superadmin', 'admin', 'editor'].includes(role);
  const canManageOrders = ['superadmin', 'admin', 'support'].includes(role);
  const canManageUsers = ['superadmin', 'admin'].includes(role);

  const [activeTab, setActiveTab] = useState(() => {
    if (canManageProducts) return 'products';
    if (canManageOrders) return 'orders';
    if (canManageUsers) return 'users';
    return 'dashboard';
  });

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [analyticsLogs, setAnalyticsLogs] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    stock: '',
    description: '',
    details: '',
    materials: '',
    care: '',
    images: [] as { url: string; color?: string }[],
    videos: [] as string[],
    sizes: [] as string[],
    colors: [] as { name: string; code: string }[],
    variants: [] as { size: string; color: string; stock: number }[],
    upsell_product_id: '',
    downsell_product_id: '',
    order_bump_product_id: ''
  });

  const STANDARD_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const [newSize, setNewSize] = useState('');
  const [newColorName, setNewColorName] = useState('');
  const [newColorCode, setNewColorCode] = useState('#000000');

  const [categories, setCategories] = useState<any[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const [improvingField, setImprovingField] = useState<string | null>(null);

  useEffect(() => {
    if (isModalOpen || isUserModalOpen || isOrderModalOpen || isCategoryModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen, isUserModalOpen, isOrderModalOpen, isCategoryModalOpen]);

  useEffect(() => {
    if (activeTab === 'dashboard' && profile) {
      if (canManageProducts) setActiveTab('products');
      else if (canManageOrders) setActiveTab('orders');
      else if (canManageUsers) setActiveTab('users');
    }
  }, [profile]);

  useEffect(() => {
    if (activeTab === 'products') {
      fetchProducts();
      fetchCategories();
    }
    else if (activeTab === 'orders') fetchOrders();
    else if (activeTab === 'users') fetchUsers();
    else if (activeTab === 'analytics-logs') fetchAnalyticsLogs();
  }, [activeTab]);

  const fetchAnalyticsLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('analytics_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) {
      console.warn('Could not fetch analytics logs. Table might not exist yet.', error);
    }
    if (data) setAnalyticsLogs(data);
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase.from('product_categories').select('*').order('name');
    if (!error && data) setCategories(data);
  };

  const fetchOrders = async () => {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Admin: Error fetching orders:', error);
      alert('Error al cargar pedidos: ' + error.message);
    }
    if (data) setOrders(data);
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      setUsers(data.map(profile => ({
        id: profile.id,
        name: profile.full_name || 'Desconocido',
        email: profile.email || profile.id,
        role: profile.role || 'Cliente',
        status: 'Activo'
      })));
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await supabase.from('products').select('*');
    if (data) {
      const parseJSON = (val: any) => {
        if (typeof val !== 'string') return val;
        try {
          const parsed = JSON.parse(val);
          return parsed && typeof parsed === 'object' ? parsed : val;
        } catch (e) {
          return val;
        }
      };

      setProducts(data.map(p => ({
        ...p,
        images: Array.isArray(p.images) ? p.images.map((img: any) => {
          const parsed = parseJSON(img);
          return typeof parsed === 'string' ? { url: parsed } : parsed;
        }) : [],
        videos: Array.isArray(p.videos) ? p.videos.map((vid: any) => {
          const parsed = parseJSON(vid);
          return typeof parsed === 'string' ? { url: parsed } : parsed;
        }) : [],
        colors: Array.isArray(p.colors) ? p.colors.map((c: any) => {
          const parsed = parseJSON(c);
          return typeof parsed === 'object' && parsed !== null ? parsed : { name: String(c), code: '#CCCCCC' };
        }) : []
      })));
    }
    setLoading(false);
  };

  const handleDuplicateProduct = async (product: any) => {
    if (!confirm(`¿Estás seguro de duplicar el producto "${product.name}"?`)) return;

    try {
      const { id, created_at, updated_at, slug: oldSlug, ...rest } = product;
      
      // Clean data based on what handleSubmit uses to avoid hidden state issues
      const newName = `${product.name} (Copia)`;
      const newSlug = `${oldSlug || newName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-copy-${Date.now()}`;
      
      const duplicatedProduct = {
        ...rest,
        name: newName,
        slug: newSlug,
        stock: 0,
        active: false
      };

      const { data, error } = await supabase
        .from('products')
        .insert(duplicatedProduct)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        // Normalize as we do in fetchProducts
        const normalized = {
          ...data,
          images: Array.isArray(data.images) ? data.images.map((img: any) => typeof img === 'string' ? { url: img } : img) : [],
          videos: Array.isArray(data.videos) ? data.videos.map((vid: any) => typeof vid === 'string' ? { url: vid } : vid) : [],
          colors: Array.isArray(data.colors) ? data.colors.map((c: any) => typeof c === 'string' ? { name: c, code: '#CCCCCC' } : c) : []
        };
        setProducts([normalized, ...products]);
        alert('Producto duplicado correctamente.');
      }
    } catch (error: any) {
      console.error('Error duplicating product:', error);
      alert('Error al duplicar: ' + error.message);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      
      // Explicitly construct product data with type conversions and validation
      const productData = {
        name: formData.name,
        price: parseFloat(formData.price) || 0,
        category: formData.category,
        stock: parseInt(formData.stock) || 0,
        description: formData.description,
        details: formData.details,
        materials: formData.materials,
        care: formData.care,
        images: formData.images,
        videos: formData.videos,
        sizes: formData.sizes,
        colors: formData.colors,
        slug,
        upsell_product_id: formData.upsell_product_id || null,
        downsell_product_id: formData.downsell_product_id || null,
        order_bump_product_id: formData.order_bump_product_id || null
      };

      if (editingProduct) {
        const { error } = await supabase.from('products').update(productData).eq('id', editingProduct.id);
        if (error) throw error;
        setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...productData } : p));
        closeModal();
      } else {
        const { data, error } = await supabase.from('products').insert([productData]).select();
        if (error) throw error;
        if (data) {
          // Normalize the returned data before adding to state
          const newProduct = {
            ...data[0],
            images: Array.isArray(data[0].images) ? data[0].images.map((img: any) => typeof img === 'string' ? { url: img } : img) : [],
            videos: Array.isArray(data[0].videos) ? data[0].videos.map((vid: any) => typeof vid === 'string' ? { url: vid } : vid) : [],
            colors: Array.isArray(data[0].colors) ? data[0].colors.map((c: any) => typeof c === 'string' ? { name: c, code: '#CCCCCC' } : c) : []
          };
          setProducts([...products, newProduct]);
          closeModal();
        }
      }
    } catch (error: any) {
      console.error('Error saving product:', error);
      alert('Error al guardar el producto: ' + (error.message || 'Error desconocido'));
    }
  };

  const handleSaveOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('orders').update({
      customer_name: editingOrder.customer_name,
      status: editingOrder.status,
      notes: editingOrder.notes
    }).eq('id', editingOrder.id);

    if (!error) {
      setOrders(orders.map(o => o.id === editingOrder.id ? editingOrder : o));
      setIsOrderModalOpen(false);
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser?.id) {
      const { error } = await supabase.from('profiles').update({
        role: editingUser.role
      }).eq('id', editingUser.id);

      if (!error) {
        setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
        setIsUserModalOpen(false);
      }
    } else {
      // Logic for new user invitation could go here if Supabase auth allows
      alert('Funcionalidad de invitación enviada (Simulación). Supabase requiere configuración de SMTP para invitaciones reales.');
      setIsUserModalOpen(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName) return;
    const { data, error } = await supabase.from('product_categories').insert([{ name: newCategoryName }]).select();
    if (!error && data) {
      setCategories([...categories, data[0]]);
      setNewCategoryName('');
    } else {
      alert('Error creando categoría: ' + (error?.message || 'Ya existe o error de conexión'));
    }
  };

  const handleUpdateCategory = async (id: string, oldName: string, newName: string) => {
    if (!newName || oldName === newName) return;
    
    // Update category name
    const { error: catError } = await supabase.from('product_categories').update({ name: newName }).eq('id', id);
    if (catError) {
      alert('Error al actualizar categoría: ' + catError.message);
      return;
    }

    // Update all products with this category
    const { error: prodError } = await supabase.from('products').update({ category: newName }).eq('category', oldName);
    if (prodError) {
      alert('Categoría actualizada, pero hubo un error al actualizar algunos productos.');
    }

    setCategories(categories.map(c => c.id === id ? { ...c, name: newName } : c));
    setProducts(products.map(p => p.category === oldName ? { ...p, category: newName } : p));
  };

  const handleUpdateCategoryImage = async (id: string, imageUrl: string) => {
    const { error } = await supabase.from('product_categories').update({ image_url: imageUrl }).eq('id', id);
    if (error) {
      alert('Error al actualizar imagen de categoría: ' + error.message);
      return;
    }
    setCategories(categories.map(c => c.id === id ? { ...c, image_url: imageUrl } : c));
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de eliminar la categoría "${name}"? Los productos asociados NO serán eliminados pero quedarán sin categoría.`)) return;

    const { error } = await supabase.from('product_categories').delete().eq('id', id);
    if (error) {
      alert('Error al eliminar categoría: ' + error.message);
      return;
    }

    setCategories(categories.filter(c => c.id !== id));
  };

  const handleImproveWithAI = async (field: 'description' | 'details') => {
    const text = formData[field as keyof typeof formData];
    if (typeof text !== 'string' || !text.trim()) {
      alert('Por favor escribe algo primero para que la IA pueda mejorarlo.');
      return;
    }

    setImprovingField(field);
    try {
      const { data: settingsData } = await supabase.from('app_settings').select('*');
      if (!settingsData) throw new Error('No se pudo cargar la configuración.');
      
      const settings: any = {};
      settingsData.forEach(item => {
        settings[item.key] = item.value;
      });

      const apiKey = settings.openai_api_key;
      if (!apiKey) throw new Error('Configura la API Key en la sección de Ajustes primero.');

      const provider = settings.ai_provider || 'openai';
      const model = settings.ai_model || 'gpt-4o-mini';

      const prompt = `Mejora la estructura y el copy de esta descripción de producto de moda, haciéndola más atractiva y profesional, pero MANTENIENDO toda la información técnica, tallas y detalles importantes. No inventes información nueva. Estructura el texto con párrafos claros o puntos clave.\n\nTexto original:\n${text}`;

      let apiUrl = 'https://api.openai.com/v1/chat/completions';
      const headers: any = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      };

      if (provider === 'openrouter') {
        apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
        headers['HTTP-Referer'] = window.location.origin;
        headers['X-Title'] = 'Vandora Admin';
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 1,
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Error en la comunicación con la IA.');
      }

      const data = await response.json();
      const improvedText = data.choices[0]?.message?.content?.trim();

      if (improvedText) {
        setFormData(prev => ({ ...prev, [field]: improvedText }));
      }
    } catch (error: any) {
      console.error('AI Improvement error:', error);
      alert('Error al mejorar con IA: ' + (error.message || 'Error desconocido'));
    } finally {
      setImprovingField(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      <SEO title="Admin Dashboard" description="Panel de control de Vandora" />

      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden bg-white p-4 flex justify-between items-center border-b">
        <h2 className="font-serif text-xl text-vandora-emerald">Vandora Admin</h2>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          <Menu className="h-6 w-6 text-gray-600" />
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6">
          <h2 className="font-serif text-2xl text-vandora-emerald hidden md:block">Vandora</h2>
          <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Panel de Control</p>
        </div>

        <nav className="mt-2 px-4 space-y-1">
          <button
            onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center px-4 py-3 text-sm rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-emerald-50 text-vandora-emerald font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <LayoutIcon className="h-5 w-5 mr-3" /> Dashboard
          </button>

          {canManageProducts && (
            <button
              onClick={() => { setActiveTab('products'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center px-4 py-3 text-sm rounded-lg transition-colors ${activeTab === 'products' ? 'bg-emerald-50 text-vandora-emerald font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Package className="h-5 w-5 mr-3" /> Productos
            </button>
          )}

          {canManageOrders && (
            <button
              onClick={() => { setActiveTab('orders'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center px-4 py-3 text-sm rounded-lg transition-colors ${activeTab === 'orders' ? 'bg-emerald-50 text-vandora-emerald font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <ShoppingBag className="h-5 w-5 mr-3" /> Pedidos
            </button>
          )}

          {canManageUsers && (
            <button
              onClick={() => { setActiveTab('users'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center px-4 py-3 text-sm rounded-lg transition-colors ${activeTab === 'users' ? 'bg-emerald-50 text-vandora-emerald font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Users className="h-5 w-5 mr-3" /> Usuarios
            </button>
          )}

          {isAdmin && (
            <>
              <button
                onClick={() => { setActiveTab('media'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center px-4 py-3 text-sm rounded-lg transition-colors ${activeTab === 'media' ? 'bg-emerald-50 text-vandora-emerald font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <ImageIcon className="h-5 w-5 mr-3" /> Multimedia
              </button>

              <button
                onClick={() => { setActiveTab('site'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center px-4 py-3 text-sm rounded-lg transition-colors ${activeTab === 'site' ? 'bg-emerald-50 text-vandora-emerald font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <Sparkles className="h-5 w-5 mr-3" /> Editor Sitio
              </button>

              <button
                onClick={() => { setActiveTab('quizzes'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center px-4 py-3 text-sm rounded-lg transition-colors ${activeTab === 'quizzes' ? 'bg-emerald-50 text-vandora-emerald font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <Plus className="h-5 w-5 mr-3" /> Quizzes
              </button>

              <button
                onClick={() => { setActiveTab('popups'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center px-4 py-3 text-sm rounded-lg transition-colors ${activeTab === 'popups' ? 'bg-emerald-50 text-vandora-emerald font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <Megaphone className="h-5 w-5 mr-3" /> Popups
              </button>

              <button
                onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center px-4 py-3 text-sm rounded-lg transition-colors ${activeTab === 'settings' ? 'bg-emerald-50 text-vandora-emerald font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <Settings className="h-5 w-5 mr-3" /> Ajustes
              </button>

              <button
                onClick={() => { setActiveTab('size-guide'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center px-4 py-3 text-sm rounded-lg transition-colors ${activeTab === 'size-guide' ? 'bg-emerald-50 text-vandora-emerald font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <Ruler className="h-5 w-5 mr-3" /> Guía de Tallas
              </button>

              <button
                onClick={() => { setActiveTab('analytics-logs'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center px-4 py-3 text-sm rounded-lg transition-colors ${activeTab === 'analytics-logs' ? 'bg-emerald-50 text-vandora-emerald font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <History className="h-5 w-5 mr-3" /> Logs de Meta
              </button>
            </>
          )}
        </nav>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-serif text-gray-900">
            {activeTab === 'dashboard' ? 'Dashboard' :
              activeTab === 'products' ? 'Inventario' :
                activeTab === 'orders' ? 'Pedidos' :
                  activeTab === 'users' ? 'Gestión de Usuarios' :
                    activeTab === 'media' ? 'Multimedia' :
                      activeTab === 'site' ? 'Editor de Sitio' :
                        activeTab === 'quizzes' ? 'Constructor de Quizzes' : 
                          activeTab === 'size-guide' ? 'Guía de Tallas' : 
                            activeTab === 'analytics-logs' ? 'Registro de Errores Meta CAPI' :
                              activeTab === 'popups' ? 'Gestión de Popups' : 'Ajustes'}
          </h1>
          <p className="text-sm text-gray-500">Bienvenido de nuevo, {role}</p>
        </header>

        {activeTab === 'popups' && <PopupManager />}

        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 uppercase font-bold mb-1">Total Pedidos</p>
              <h3 className="text-2xl font-serif text-vandora-emerald">{orders.length}</h3>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 uppercase font-bold mb-1">Productos</p>
              <h3 className="text-2xl font-serif text-vandora-emerald">{products.length}</h3>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 uppercase font-bold mb-1">Usuarios</p>
              <h3 className="text-2xl font-serif text-vandora-emerald">{users.length}</h3>
            </div>
          </div>
        )}

        {activeTab === 'products' && canManageProducts && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h3 className="text-lg font-medium text-gray-900 border-l-4 border-vandora-emerald pl-3">Inventario de Productos</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="bg-white text-gray-700 px-4 py-2 rounded-md flex items-center border border-gray-300 transition-colors hover:bg-gray-50 shadow-sm"
                >
                  <Plus className="h-4 w-4 mr-2" /> Categorías
                </button>
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setFormData({ name: '', price: '', category: '', stock: '', description: '', details: '', materials: '', care: '', images: [], videos: [], sizes: [], colors: [], variants: [], upsell_product_id: '', downsell_product_id: '', order_bump_product_id: '' });
                    setIsModalOpen(true);
                  }}
                  className="bg-vandora-emerald text-white px-4 py-2 rounded-md flex items-center transition-colors hover:bg-emerald-800 shadow-md"
                >
                  <Plus className="h-4 w-4 mr-2" /> Nuevo Producto
                </button>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-xs font-mono text-gray-400">
                        {product.id.substring(0, 8)}
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(product.id);
                            alert('ID copiado al portapapeles');
                          }}
                          className="ml-2 hover:text-vandora-emerald"
                          title="Copiar ID completo"
                        >
                          📋
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{product.category}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{formatPrice(product.price)}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{product.stock}</td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <button 
                          className="text-gray-400 hover:text-vandora-emerald transition-colors mr-4" 
                          onClick={() => handleDuplicateProduct(product)}
                          title="Duplicar Producto"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button className="text-vandora-emerald hover:text-emerald-800 mr-4" onClick={() => {
                          setEditingProduct(product);
                          const parseJSON = (val: any) => {
                            if (typeof val !== 'string') return val;
                            try {
                              const parsed = JSON.parse(val);
                              return parsed && typeof parsed === 'object' ? parsed : val;
                            } catch (e) {
                              return val;
                            }
                          };

                          setFormData({
                            ...product,
                            price: product.price.toString(),
                            stock: product.stock.toString(),
                            images: Array.isArray(product.images) 
                              ? product.images.map((img: any) => {
                                const parsed = parseJSON(img);
                                return typeof parsed === 'string' ? { url: parsed } : parsed;
                              }) : [],
                            videos: Array.isArray(product.videos) 
                              ? product.videos.map((vid: any) => {
                                const parsed = parseJSON(vid);
                                return typeof parsed === 'string' ? { url: parsed } : parsed;
                              }) : [],
                            colors: Array.isArray(product.colors) 
                              ? product.colors.map((c: any) => {
                                const parsed = parseJSON(c);
                                return typeof parsed === 'object' && parsed !== null ? parsed : { name: String(c), code: '#CCCCCC' };
                              }) : [],
                            sizes: Array.isArray(product.sizes) ? product.sizes : [],
                            variants: Array.isArray(product.variants) ? product.variants : []
                          });
                          setIsModalOpen(true);
                        }}><Edit className="h-4 w-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'orders' && canManageOrders && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Gestión de Pedidos</h3>
            <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orden</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">
                        No se encontraron pedidos.
                      </td>
                    </tr>
                  ) : (
                    orders.map(order => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">#{order.id.substring(0, 8)}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{order.customer_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{formatPrice(order.total)}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                            {order.status === 'pending' ? 'Pendiente' :
                              order.status === 'completed' ? 'Completado' : order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium">
                          <button className="text-vandora-emerald hover:text-emerald-900" onClick={() => {
                            setEditingOrder(order);
                            setIsOrderModalOpen(true);
                          }}>
                            <Edit className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'users' && canManageUsers && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Gestión de Usuarios</h3>
              <button
                className="bg-vandora-emerald text-white px-4 py-2 rounded-md flex items-center transition-colors hover:bg-emerald-800 text-sm"
                onClick={() => {
                  setEditingUser(null);
                  setIsUserModalOpen(true);
                }}
              >
                <Users className="h-4 w-4 mr-2" /> Invitar Usuario
              </button>
            </div>
            <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email / ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {users.map(userItem => (
                    <tr key={userItem.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{userItem.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{userItem.email || userItem.id.substring(0, 15) + '...'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${userItem.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                          userItem.role === 'editor' ? 'bg-blue-100 text-blue-800' :
                            userItem.role === 'support' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                          {userItem.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <button className="text-vandora-emerald hover:text-emerald-800" onClick={() => {
                          setEditingUser(userItem);
                          setIsUserModalOpen(true);
                        }}><Edit className="h-4 w-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'media' && <div className="bg-white p-6 rounded-lg shadow-sm"><MediaManager images={[]} videos={[]} colors={[]} onImagesChange={() => { }} onVideosChange={() => { }} /></div>}
        {activeTab === 'site' && <div className="bg-white p-6 rounded-lg shadow-sm"><SiteEditor /></div>}
        {activeTab === 'quizzes' && <div className="bg-white p-6 rounded-lg shadow-sm space-y-8"><QuizBuilder /><VisualQuizBuilder onBack={() => setActiveTab('quizzes')} /></div>}
        {activeTab === 'settings' && <div className="bg-white p-6 rounded-lg shadow-sm space-y-8"><SettingsEditor /><CheckoutSettingsEditor /></div>}
        {activeTab === 'size-guide' && <div className="bg-white p-6 rounded-lg shadow-sm"><SizeGuideEditor /></div>}

        {activeTab === 'analytics-logs' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Evento</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Error</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analyticsLogs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-500 italic">
                        No hay logs registrados. Los errores de Meta CAPI aparecerán aquí.
                      </td>
                    </tr>
                  ) : (
                    analyticsLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{log.event_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{log.status_code}</td>
                        <td className="px-6 py-4 text-sm text-red-500">{log.error_message}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modals remain same as before for products/orders/users edit */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-[60] backdrop-blur-sm">
            <div className="bg-white rounded-xl w-full sm:max-w-lg md:max-w-2xl lg:max-w-5xl xl:max-w-6xl max-h-[95vh] overflow-y-auto flex flex-col shadow-2xl transition-all duration-300">
              <div className="flex justify-between items-center p-4 md:p-6 sticky top-0 bg-white/80 backdrop-blur-md z-20 border-b">
                <h2 className="text-xl md:text-2xl font-serif text-gray-900">{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-all hover:scale-110"><X className="h-6 w-6 md:h-8 md:w-8" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-4 md:p-8 space-y-8 flex-1">
                {/* Media Section */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <ImageIcon className="w-5 h-5 mr-2 text-vandora-emerald" /> Multimedia
                  </h3>
                  <MediaManager
                    images={formData.images}
                    videos={formData.videos}
                    colors={formData.colors}
                    onImagesChange={(images) => setFormData({ ...formData, images })}
                    onVideosChange={(videos) => setFormData({ ...formData, videos })}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Información Básica</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                      <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full rounded-md border-gray-300 shadow-sm border p-3 focus:ring-2 focus:ring-vandora-emerald outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                        <input type="number" step="0.01" name="price" value={formData.price} onChange={handleInputChange} required className="w-full rounded-md border-gray-300 shadow-sm border p-3 focus:ring-2 focus:ring-vandora-emerald outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Stock Inicial</label>
                        <input type="number" name="stock" value={formData.stock} onChange={handleInputChange} required className="w-full rounded-md border-gray-300 shadow-sm border p-3 focus:ring-2 focus:ring-vandora-emerald outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                      <div className="flex gap-2">
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          required
                          className="flex-1 rounded-md border-gray-300 shadow-sm border p-3 focus:ring-2 focus:ring-vandora-emerald outline-none appearance-none bg-white"
                        >
                          <option value="">Seleccionar categoría...</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => setIsCategoryModalOpen(true)}
                          className="p-3 border rounded-md hover:bg-gray-50 text-gray-400 hover:text-vandora-emerald transition-colors"
                          title="Nueva Categoría"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium text-gray-700">Descripción Corta</label>
                        <button 
                          type="button"
                          onClick={() => handleImproveWithAI('description')}
                          disabled={improvingField === 'description'}
                          className="text-[10px] font-bold uppercase tracking-wider text-vandora-emerald hover:text-emerald-800 flex items-center transition-colors disabled:opacity-50"
                        >
                          {improvingField === 'description' ? <Loader2 className="animate-spin h-3 w-3 mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
                          Mejorar con IA
                        </button>
                      </div>
                      <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} className="w-full rounded-md border-gray-300 shadow-sm border p-3 focus:ring-2 focus:ring-vandora-emerald outline-none" />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Atributos y Variantes</h3>

                    {/* Sizes selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tallas Disponibles</label>
                      <div className="flex flex-wrap gap-2">
                        {STANDARD_SIZES.map(size => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => {
                              const sizes = formData.sizes.includes(size)
                                ? formData.sizes.filter(s => s !== size)
                                : [...formData.sizes, size];
                              setFormData({ ...formData, sizes });
                            }}
                            className={`px-3 py-2 rounded-md border text-sm transition-colors ${formData.sizes.includes(size)
                              ? 'bg-vandora-emerald text-white border-vandora-emerald'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-vandora-emerald'
                              }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Colors selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Colores</label>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-4">
                        <input
                          type="text"
                          placeholder="Nombre color"
                          value={newColorName}
                          onChange={(e) => setNewColorName(e.target.value)}
                          className="flex-1 rounded-md border p-2 text-sm border-gray-300 min-w-0"
                        />
                        <div className="flex gap-2 min-w-0">
                          <input
                            type="color"
                            value={newColorCode.startsWith('#') && newColorCode.length === 7 ? newColorCode : '#000000'}
                            onChange={(e) => setNewColorCode(e.target.value)}
                            className="w-10 h-10 border-0 p-0 rounded-md cursor-pointer shrink-0"
                          />
                          <input
                            type="text"
                            placeholder="Código (Hex, RGB...)"
                            value={newColorCode}
                            onChange={(e) => setNewColorCode(e.target.value)}
                            className="flex-1 rounded-md border p-2 text-sm border-gray-300 min-w-0"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (newColorName) {
                              setFormData({ ...formData, colors: [...formData.colors, { name: newColorName, code: newColorCode }] });
                              setNewColorName('');
                              setNewColorCode('#000000');
                            }
                          }}
                          className="bg-gray-100 p-2 rounded-md hover:bg-gray-200 shrink-0 flex items-center justify-center h-10 w-10"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.colors.map((c, i) => (
                          <div key={i} className="flex items-center bg-white border border-gray-200 rounded-full px-3 py-1 text-xs">
                            <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: c.code }}></span>
                            {c.name}
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, colors: formData.colors.filter((_, idx) => idx !== i) })}
                              className="ml-2 text-gray-400 hover:text-red-500"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Upsell/Downsell */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-gray-900">Estrategia de Ventas (Funnels)</h4>
                      <div className="grid grid-cols-1 gap-4">
                        <input type="text" name="upsell_product_id" value={formData.upsell_product_id} onChange={handleInputChange} className="w-full rounded-md border-gray-300 shadow-sm border p-2 text-sm outline-none" placeholder="Upsell Product ID" />
                        <input type="text" name="downsell_product_id" value={formData.downsell_product_id} onChange={handleInputChange} className="w-full rounded-md border-gray-300 shadow-sm border p-2 text-sm outline-none" placeholder="Downsell Product ID" />
                        <input type="text" name="order_bump_product_id" value={formData.order_bump_product_id} onChange={handleInputChange} className="w-full rounded-md border-gray-300 shadow-sm border p-2 text-sm outline-none" placeholder="Order Bump Product ID" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Extended Details */}
                <div className="space-y-6 bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Contenido Extendido</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium text-gray-700">Detalles</label>
                        <button 
                          type="button"
                          onClick={() => handleImproveWithAI('details')}
                          disabled={improvingField === 'details'}
                          className="text-[10px] font-bold uppercase tracking-wider text-vandora-emerald hover:text-emerald-800 flex items-center transition-colors disabled:opacity-50"
                        >
                          {improvingField === 'details' ? <Loader2 className="animate-spin h-3 w-3 mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
                          Mejorar con IA
                        </button>
                      </div>
                      <textarea name="details" value={formData.details} onChange={handleInputChange} rows={4} className="w-full rounded-md border-gray-300 shadow-sm border p-3 focus:ring-2 focus:ring-vandora-emerald outline-none text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Materiales</label>
                      <textarea name="materials" value={formData.materials} onChange={handleInputChange} rows={4} className="w-full rounded-md border-gray-300 shadow-sm border p-3 focus:ring-2 focus:ring-vandora-emerald outline-none text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cuidado</label>
                      <textarea name="care" value={formData.care} onChange={handleInputChange} rows={4} className="w-full rounded-md border-gray-300 shadow-sm border p-3 focus:ring-2 focus:ring-vandora-emerald outline-none text-sm" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 p-4 md:p-6 border-t sticky bottom-0 bg-white/80 backdrop-blur-md z-20">
                  <button type="button" onClick={closeModal} className="px-6 py-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 transition-colors">Cancelar</button>
                  <button type="submit" className="px-6 py-2 bg-vandora-emerald text-white rounded-md hover:bg-emerald-800 transition-colors shadow-md">Guardar Producto</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isOrderModalOpen && editingOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
            <div className="bg-white rounded-lg w-full max-w-lg p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-serif text-gray-900">Actualizar Pedido</h2>
                <button onClick={() => setIsOrderModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="h-6 w-6" /></button>
              </div>
              <form onSubmit={handleSaveOrder} className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg space-y-3 mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 border-b pb-1">Información del Cliente</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Nombre:</p>
                      <p className="font-medium">{editingOrder.customer_name}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Email:</p>
                      <p className="font-medium">{editingOrder.customer_email || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Teléfono:</p>
                      <p className="font-medium">{editingOrder.customer_phone || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Método Pago:</p>
                      <p className="font-medium text-vandora-emerald">
                        {editingOrder.payment_method === 'transfer' ? `Transferencia - ${editingOrder.bank || 'Banco no especificado'}` : 'Contra Entrega'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg space-y-3 mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 border-b pb-1">Dirección de Envío</h3>
                  <div className="text-sm space-y-1">
                    <p><span className="text-gray-500">Dirección:</span> {editingOrder.shipping_address || editingOrder.address || 'N/A'}</p>
                    <p><span className="text-gray-500">Ciudad:</span> {editingOrder.shipping_city || 'N/A'}</p>
                    <p><span className="text-gray-500">Provincia:</span> {editingOrder.shipping_province || 'N/A'}</p>
                    {editingOrder.shipping_reference && (
                      <p><span className="text-gray-500 font-medium">Referencia:</span> {editingOrder.shipping_reference}</p>
                    )}
                  </div>
                </div>

                <div className="bg-emerald-50 p-4 rounded-lg space-y-3 mb-6">
                  <h3 className="text-sm font-semibold text-vandora-emerald border-b border-emerald-100 pb-1">Productos</h3>
                  <div className="space-y-2">
                    {editingOrder.items && Array.isArray(editingOrder.items) ? (
                      editingOrder.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span>{item.quantity}x {item.name} ({item.size})</span>
                          <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 italic">No hay detalles de productos</p>
                    )}
                    <div className="pt-2 border-t border-emerald-100 flex justify-between font-bold text-vandora-emerald">
                      <span>Total:</span>
                      <span>{formatPrice(editingOrder.total)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado del Pedido</label>
                  <select
                    value={editingOrder.status}
                    onChange={(e) => setEditingOrder({ ...editingOrder, status: e.target.value })}
                    className="w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-2 focus:ring-vandora-emerald outline-none"
                  >
                    <option value="pending">Pendiente</option>
                    <option value="processing">En Proceso</option>
                    <option value="shipped">Enviado</option>
                    <option value="completed">Completado</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notas Administrativas</label>
                  <textarea
                    value={editingOrder.notes || ''}
                    onChange={(e) => setEditingOrder({ ...editingOrder, notes: e.target.value })}
                    className="w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-2 focus:ring-vandora-emerald outline-none"
                    rows={3}
                    placeholder="Detalles sobre el envío o pago..."
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <button type="button" onClick={() => setIsOrderModalOpen(false)} className="px-6 py-2 border rounded-md text-gray-600">Cancelar</button>
                  <button type="submit" className="px-6 py-2 bg-vandora-emerald text-white rounded-md hover:bg-emerald-800 transition-colors shadow-md">Guardar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isUserModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
            <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-serif text-gray-900">{editingUser ? 'Cambiar Rol de Usuario' : 'Invitar Usuario'}</h2>
                <button onClick={() => setIsUserModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="h-6 w-6" /></button>
              </div>

              {editingUser && (
                <div className="mb-6 p-3 bg-gray-50 rounded text-sm text-gray-600">
                  <p><strong>Usuario:</strong> {editingUser.name}</p>
                  <p><strong>Email:</strong> {editingUser.email || 'N/A'}</p>
                </div>
              )}

              <form onSubmit={handleSaveUser} className="space-y-4">
                {!editingUser && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email del Invitado</label>
                    <input
                      type="email"
                      required
                      className="w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-2 focus:ring-vandora-emerald outline-none"
                      placeholder="correo@ejemplo.com"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                  <select
                    value={editingUser?.role || 'cliente'}
                    onChange={(e) => editingUser ? setEditingUser({ ...editingUser, role: e.target.value }) : null}
                    className="w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-2 focus:ring-vandora-emerald outline-none"
                  >
                    <option value="cliente">Cliente (Usuario Estándar)</option>
                    <option value="support">Soporte (Pedidos)</option>
                    <option value="editor">Editor (Productos/Contenido)</option>
                    <option value="admin">Administrador (Total)</option>
                    <option value="superadmin">Superadmin (Creador/Dueño)</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <button type="button" onClick={() => setIsUserModalOpen(false)} className="px-6 py-2 border rounded-md text-gray-600 font-medium">Cancelar</button>
                  <button type="submit" className="px-6 py-2 bg-vandora-emerald text-white rounded-md hover:bg-emerald-800 transition-colors shadow-md font-medium">
                    {editingUser ? 'Actualizar Rol' : 'Enviar Invitación'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isCategoryModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[70]">
            <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-serif text-gray-900">Gestionar Categorías</h2>
                <button onClick={() => setIsCategoryModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="h-6 w-6" /></button>
              </div>
              
              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
                {categories.map(cat => (
                  <div key={cat.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md group">
                    <input 
                      type="text" 
                      defaultValue={cat.name}
                      onBlur={(e) => handleUpdateCategory(cat.id, cat.name, e.target.value)}
                      className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium text-gray-700"
                    />
                    <div className="flex items-center gap-2">
                       {cat.image_url ? (
                         <img src={cat.image_url} alt="" className="w-8 h-8 rounded object-cover border" />
                       ) : (
                         <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center border border-dashed text-gray-400">
                           <ImageIcon className="w-4 h-4" />
                         </div>
                       )}
                       <button 
                         onClick={() => {
                           const url = prompt('URL de la imagen para ' + cat.name, cat.image_url || '');
                           if (url !== null) handleUpdateCategoryImage(cat.id, url);
                         }}
                         className="text-gray-400 hover:text-vandora-emerald p-1"
                         title="Cambiar imagen"
                       >
                         <ImageIcon className="h-4 w-4" />
                       </button>
                    </div>
                    <button 
                      onClick={() => handleDeleteCategory(cat.id, cat.name)}
                      className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Eliminar categoría"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Categoría</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="flex-1 rounded-md border-gray-300 shadow-sm border p-2 focus:ring-2 focus:ring-vandora-emerald outline-none text-sm"
                      placeholder="Ej: Vestidos, Accesorios..."
                    />
                    <button 
                      onClick={handleCreateCategory}
                      className="bg-vandora-emerald text-white px-4 py-2 rounded-md hover:bg-emerald-800 transition-colors shadow-sm text-sm"
                    >
                      Añadir
                    </button>
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="px-6 py-2 border rounded-md text-gray-600 text-sm">Cerrar</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};



export default AdminPage;
