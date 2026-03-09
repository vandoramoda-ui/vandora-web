import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Edit, Trash, Package, ShoppingBag, Users, Layout as LayoutIcon, Sparkles, Settings, X, Image as ImageIcon, Menu } from 'lucide-react';
import { formatPrice } from '../lib/utils';
import MediaManager from '../components/MediaManager';
import SiteEditor from '../components/SiteEditor';
import QuizBuilder from '../components/QuizBuilder';
import SettingsEditor from '../components/SettingsEditor';
import VisualQuizBuilder from '../components/flow/VisualQuizBuilder';
import CheckoutSettingsEditor from '../components/CheckoutSettingsEditor';
import SEO from '../components/SEO';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Live Data State
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  // Edit State for Orders and Users
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    stock: '', // Total stock (calculated or manual)
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

  // Temporary state for adding new size/color
  const [newSize, setNewSize] = useState('');
  const [newColorName, setNewColorName] = useState('');
  const [newColorCode, setNewColorCode] = useState('#000000');

  useEffect(() => {
    if (activeTab === 'products') {
      fetchProducts();
    } else if (activeTab === 'orders') {
      fetchOrders();
    } else if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchOrders = async () => {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      setOrders(data);
    }
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      // Map to local mock-like structure if needed or keep raw
      const mapped = data.map((profile: any) => ({
        id: profile.id,
        name: profile.full_name || 'Desconocido',
        email: profile.id, // Supabase doesn't return email in profiles by default on client, just ID. Wait, sometimes it's mapped.
        // Actually we might not have raw email unless we query an RPC or have an `email` column in `profiles` (which we might).
        // For visual, we can use id if email isn't there, or if we have it in profile.
        role: profile.role || 'Cliente',
        status: 'Activo',
        loyaltyPoints: profile.loyalty_points || 0
      }));
      setUsers(mapped);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('products').select('*');

    if (data && data.length > 0) {
      // Normalize images to object structure if they are strings
      const normalizedData = data.map(p => ({
        ...p,
        images: Array.isArray(p.images)
          ? p.images.map((img: any) => typeof img === 'string' ? { url: img } : img)
          : []
      }));
      setProducts(normalizedData);
    } else {
      setProducts([]); // Avoid fallback
    }
    setLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImagesChange = (images: { url: string; color?: string }[]) => {
    setFormData({ ...formData, images });
  };

  const handleVideosChange = (urls: string[]) => {
    setFormData({ ...formData, videos: urls });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const productData = {
      name: formData.name,
      price: parseFloat(formData.price),
      category: formData.category,
      stock: parseInt(formData.stock),
      description: formData.description,
      details: formData.details,
      materials: formData.materials,
      care: formData.care,
      images: formData.images, // Send as objects
      videos: formData.videos,
      sizes: formData.sizes,
      colors: formData.colors,
      variants: formData.variants,
      upsell_product_id: formData.upsell_product_id || null,
      downsell_product_id: formData.downsell_product_id || null,
      order_bump_product_id: formData.order_bump_product_id || null
    };

    if (editingProduct) {
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', editingProduct.id);
      if (!error) {
        setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...productData } : p));
        closeModal();
      } else {
        console.error("Error updating product:", error);
        alert("Error al actualizar producto. Verifica la consola.");
      }
    } else {
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select();
      if (!error && data) {
        setProducts([...products, data[0]]);
        closeModal();
      } else {
        console.error("Error creating product:", error);
        alert("Error al crear producto. Verifica la consola.");
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (!error) {
        setProducts(products.filter(p => p.id !== id));
      } else {
        console.error("Error deleting product:", error);
        alert("Error al eliminar producto.");
      }
    }
  };

  const openModal = (product: any = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        price: product.price,
        category: product.category,
        stock: product.stock,
        description: product.description || '',
        details: product.details || '',
        materials: product.materials || '',
        care: product.care || '',
        images: Array.isArray(product.images)
          ? product.images.map((img: any) => typeof img === 'string' ? { url: img } : img)
          : [],
        videos: product.videos || [],
        sizes: product.sizes || [],
        colors: product.colors || [],
        variants: product.variants || [],
        upsell_product_id: product.upsell_product_id || '',
        downsell_product_id: product.downsell_product_id || '',
        order_bump_product_id: product.order_bump_product_id || ''
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        price: '',
        category: '',
        stock: '',
        description: '',
        details: '',
        materials: '',
        care: '',
        images: [],
        videos: [],
        sizes: [],
        colors: [],
        variants: [],
        upsell_product_id: '',
        downsell_product_id: '',
        order_bump_product_id: ''
      });
    }
    setIsModalOpen(true);
  };

  const addSize = () => {
    if (newSize && !formData.sizes.includes(newSize)) {
      setFormData({ ...formData, sizes: [...formData.sizes, newSize] });
      setNewSize('');
    }
  };

  const removeSize = (sizeToRemove: string) => {
    setFormData({ ...formData, sizes: formData.sizes.filter(s => s !== sizeToRemove) });
  };

  const addColor = () => {
    if (newColorName && newColorCode) {
      setFormData({
        ...formData,
        colors: [...formData.colors, { name: newColorName, code: newColorCode }]
      });
      setNewColorName('');
      setNewColorCode('#000000');
    }
  };

  const removeColor = (colorName: string) => {
    setFormData({ ...formData, colors: formData.colors.filter(c => c.name !== colorName) });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Order Handlers
  const handleEditOrder = (order: any) => {
    setEditingOrder({ ...order });
    setIsOrderModalOpen(true);
  };

  const handleSaveOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setOrders(orders.map(o => o.id === editingOrder.id ? editingOrder : o));
    setIsOrderModalOpen(false);
    setEditingOrder(null);
  };

  // User Handlers
  const handleEditUser = (user: any) => {
    setEditingUser({ ...user });
    setIsUserModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
    setIsUserModalOpen(false);
    setEditingUser(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      <SEO title="Admin Dashboard" description="Panel de control de Vandora" />
      {/* Mobile Header */}
      <div className="md:hidden bg-vandora-emerald text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-serif text-vandora-gold">Vandora Admin</h1>
        <button onClick={toggleSidebar} className="text-white">
          {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'block' : 'hidden'} md:block w-full md:w-64 bg-vandora-emerald text-white flex-shrink-0 transition-all duration-300 ease-in-out`}>
        <div className="p-6 hidden md:block">
          <h1 className="text-2xl font-serif text-vandora-gold">Vandora Admin</h1>
        </div>
        <nav className="mt-6">
          <button
            onClick={() => { setActiveTab('products'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center px-6 py-3 hover:bg-emerald-800 transition-colors ${activeTab === 'products' ? 'bg-emerald-800 border-r-4 border-vandora-gold' : ''}`}
          >
            <Package className="h-5 w-5 mr-3" />
            Inventario
          </button>
          <button
            onClick={() => { setActiveTab('site'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center px-6 py-3 hover:bg-emerald-800 transition-colors ${activeTab === 'site' ? 'bg-emerald-800 border-r-4 border-vandora-gold' : ''}`}
          >
            <LayoutIcon className="h-5 w-5 mr-3" />
            Sitio Web
          </button>
          <button
            onClick={() => { setActiveTab('funnels'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center px-6 py-3 hover:bg-emerald-800 transition-colors ${activeTab === 'funnels' ? 'bg-emerald-800 border-r-4 border-vandora-gold' : ''}`}
          >
            <Sparkles className="h-5 w-5 mr-3" />
            Funnels & Quizzes
          </button>
          <button
            onClick={() => { setActiveTab('orders'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center px-6 py-3 hover:bg-emerald-800 transition-colors ${activeTab === 'orders' ? 'bg-emerald-800 border-r-4 border-vandora-gold' : ''}`}
          >
            <ShoppingBag className="h-5 w-5 mr-3" />
            Pedidos
          </button>
          <button
            onClick={() => { setActiveTab('users'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center px-6 py-3 hover:bg-emerald-800 transition-colors ${activeTab === 'users' ? 'bg-emerald-800 border-r-4 border-vandora-gold' : ''}`}
          >
            <Users className="h-5 w-5 mr-3" />
            Usuarios
          </button>
          <button
            onClick={() => { setActiveTab('checkout'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center px-6 py-3 hover:bg-emerald-800 transition-colors ${activeTab === 'checkout' ? 'bg-emerald-800 border-r-4 border-vandora-gold' : ''}`}
          >
            <ShoppingBag className="h-5 w-5 mr-3" />
            Checkout & Envíos
          </button>
          <button
            onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center px-6 py-3 hover:bg-emerald-800 transition-colors ${activeTab === 'settings' ? 'bg-emerald-800 border-r-4 border-vandora-gold' : ''}`}
          >
            <Settings className="h-5 w-5 mr-3" />
            Configuración
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h2 className="text-2xl font-bold text-gray-800 capitalize">
            {activeTab === 'products' ? 'Gestión de Inventario' :
              activeTab === 'site' ? 'Editor de Sitio Web' :
                activeTab === 'funnels' ? 'Constructor de Funnels IA' :
                  activeTab === 'checkout' ? 'Configuración de Checkout' :
                    activeTab}
          </h2>
          {activeTab === 'products' && (
            <button
              onClick={() => openModal()}
              className="bg-vandora-emerald text-white px-4 py-2 rounded-md hover:bg-emerald-800 flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nuevo Producto
            </button>
          )}
        </div>

        {activeTab === 'site' && <SiteEditor />}
        {activeTab === 'funnels' && (
          selectedQuizId ? (
            <VisualQuizBuilder quizId={selectedQuizId} onBack={() => setSelectedQuizId(null)} />
          ) : (
            <QuizBuilder onEdit={(id) => setSelectedQuizId(id)} />
          )
        )}
        {activeTab === 'checkout' && <CheckoutSettingsEditor />}
        {activeTab === 'settings' && <SettingsEditor />}

        {activeTab === 'products' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      No hay productos. Añade uno nuevo o verifica la conexión a Supabase.
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img className="h-10 w-10 rounded-full object-cover" src={product.images?.[0] || 'https://placehold.co/100'} alt="" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatPrice(product.price)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.stock}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => openModal(product)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                          <Edit className="h-5 w-5" />
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900">
                          <Trash className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Pedidos Recientes</h3>
              <div className="flex gap-2">
                <button className="text-sm text-gray-500 hover:text-gray-700">Exportar CSV</button>
              </div>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Pedido</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.customer}</div>
                      <div className="text-sm text-gray-500">{order.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${order.status === 'Completado' ? 'bg-green-100 text-green-800' :
                          order.status === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'Enviado' ? 'bg-blue-100 text-blue-800' :
                              'bg-red-100 text-red-800'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatPrice(order.total)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditOrder(order)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Ver Detalles / Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Usuarios Registrados</h3>
              <button className="bg-vandora-emerald text-white px-3 py-1 rounded text-sm hover:bg-emerald-800">Invitar Usuario</button>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Último Acceso</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                          {user.name.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.lastLogin}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Editar
                      </button>
                      <button className="text-red-600 hover:text-red-900">Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Order Modal */}
        {isOrderModalOpen && editingOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold mb-4">Editar Pedido {editingOrder.id}</h3>
              <form onSubmit={handleSaveOrder} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ID Usuario</label>
                    <input type="text" value={editingOrder.userId} readOnly className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Cliente</label>
                    <input type="text" value={editingOrder.customer} onChange={(e) => setEditingOrder({ ...editingOrder, customer: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                    <input type="text" value={editingOrder.phone} onChange={(e) => setEditingOrder({ ...editingOrder, phone: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" value={editingOrder.email} onChange={(e) => setEditingOrder({ ...editingOrder, email: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Dirección</label>
                  <input type="text" value={editingOrder.address} onChange={(e) => setEditingOrder({ ...editingOrder, address: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">UTM Source</label>
                    <input type="text" value={editingOrder.utm_source} onChange={(e) => setEditingOrder({ ...editingOrder, utm_source: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">UTM Medium</label>
                    <input type="text" value={editingOrder.utm_medium} onChange={(e) => setEditingOrder({ ...editingOrder, utm_medium: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">UTM Campaign</label>
                    <input type="text" value={editingOrder.utm_campaign} onChange={(e) => setEditingOrder({ ...editingOrder, utm_campaign: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notas</label>
                  <textarea value={editingOrder.notes} onChange={(e) => setEditingOrder({ ...editingOrder, notes: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" rows={3} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estado</label>
                  <select value={editingOrder.status} onChange={(e) => setEditingOrder({ ...editingOrder, status: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2">
                    <option value="Pendiente">Pendiente</option>
                    <option value="Enviado">Enviado</option>
                    <option value="Completado">Completado</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total</label>
                  <input type="number" value={editingOrder.total} onChange={(e) => setEditingOrder({ ...editingOrder, total: parseFloat(e.target.value) })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button type="button" onClick={() => setIsOrderModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Cancelar</button>
                  <button type="submit" className="px-4 py-2 bg-vandora-emerald text-white rounded-md hover:bg-emerald-800">Guardar Cambios</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* User Modal */}
        {isUserModalOpen && editingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold mb-4">Editar Usuario</h3>
              <form onSubmit={handleSaveUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre</label>
                  <input type="text" value={editingUser.name} onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input type="email" value={editingUser.email} onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Rol</label>
                    <select value={editingUser.role} onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2">
                      <option value="Administrador">Administrador</option>
                      <option value="Editor">Editor</option>
                      <option value="Soporte">Soporte</option>
                      <option value="Cliente">Cliente</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Puntos de Lealtad</label>
                    <input type="number" value={editingUser.loyaltyPoints} onChange={(e) => setEditingUser({ ...editingUser, loyaltyPoints: parseInt(e.target.value) })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estado</label>
                  <select value={editingUser.status} onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2">
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notas</label>
                  <textarea value={editingUser.notes} onChange={(e) => setEditingUser({ ...editingUser, notes: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" rows={3} />
                </div>

                {/* Purchase History */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Historial de Compras</label>
                  {editingUser.purchaseHistory.length > 0 ? (
                    <div className="border rounded-md overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-2 py-1 text-left">ID</th>
                            <th className="px-2 py-1 text-left">Fecha</th>
                            <th className="px-2 py-1 text-left">Total</th>
                            <th className="px-2 py-1 text-left">Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {editingUser.purchaseHistory.map((p: any, idx: number) => (
                            <tr key={idx}>
                              <td className="px-2 py-1">{p.orderId}</td>
                              <td className="px-2 py-1">{p.date}</td>
                              <td className="px-2 py-1">{formatPrice(p.total)}</td>
                              <td className="px-2 py-1">{p.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No hay compras registradas.</p>
                  )}
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button type="button" onClick={() => setIsUserModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Cancelar</button>
                  <button type="submit" className="px-4 py-2 bg-vandora-emerald text-white rounded-md hover:bg-emerald-800">Guardar Cambios</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Product Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold mb-4">{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h3>
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Categoría</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                      required
                    >
                      <option value="">Seleccionar...</option>
                      <option value="Vestidos">Vestidos</option>
                      <option value="Blusas">Blusas</option>
                      <option value="Pantalones">Pantalones</option>
                      <option value="Faldas">Faldas</option>
                      <option value="Chaquetas">Chaquetas</option>
                    </select>
                  </div>
                </div>

                {/* Media Manager */}
                <MediaManager
                  images={formData.images}
                  videos={formData.videos}
                  colors={formData.colors}
                  onImagesChange={handleImagesChange}
                  onVideosChange={handleVideosChange}
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Precio</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Stock Total</label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                      required
                    />
                  </div>
                </div>

                {/* Sales Strategy */}
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                    <Sparkles className="h-4 w-4 mr-2 text-vandora-emerald" />
                    Estrategia de Ventas (Funnels)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Order Bump (En Checkout)</label>
                      <select
                        name="order_bump_product_id"
                        value={formData.order_bump_product_id}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm border p-2 text-sm"
                      >
                        <option value="">Ninguno</option>
                        {products.filter(p => p.id !== editingProduct?.id).map(p => (
                          <option key={p.id} value={p.id}>{p.name} - {formatPrice(p.price)}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Upsell (Post-Compra)</label>
                      <select
                        name="upsell_product_id"
                        value={formData.upsell_product_id}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm border p-2 text-sm"
                      >
                        <option value="">Ninguno</option>
                        {products.filter(p => p.id !== editingProduct?.id).map(p => (
                          <option key={p.id} value={p.id}>{p.name} - {formatPrice(p.price)}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Downsell (Si rechaza Upsell)</label>
                      <select
                        name="downsell_product_id"
                        value={formData.downsell_product_id}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm border p-2 text-sm"
                      >
                        <option value="">Ninguno</option>
                        {products.filter(p => p.id !== editingProduct?.id).map(p => (
                          <option key={p.id} value={p.id}>{p.name} - {formatPrice(p.price)}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Descriptions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Descripción Corta</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Detalles</label>
                    <textarea
                      name="details"
                      value={formData.details}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-sm"
                      rows={4}
                      placeholder="Cierre invisible, forro interno..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Materiales</label>
                    <textarea
                      name="materials"
                      value={formData.materials}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-sm"
                      rows={4}
                      placeholder="95% Poliéster, 5% Elastano..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Cuidados</label>
                    <textarea
                      name="care"
                      value={formData.care}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-sm"
                      rows={4}
                      placeholder="Lavar a mano, no usar blanqueador..."
                    />
                  </div>
                </div>

                {/* Sizes Management */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tallas</label>

                  {/* Standard Sizes Checkboxes */}
                  <div className="flex flex-wrap gap-4 mb-4">
                    {STANDARD_SIZES.map(size => (
                      <label key={size} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.sizes.includes(size)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(prev => ({ ...prev, sizes: [...prev.sizes, size] }));
                            } else {
                              setFormData(prev => ({ ...prev, sizes: prev.sizes.filter(s => s !== size) }));
                            }
                          }}
                          className="rounded text-vandora-emerald focus:ring-vandora-emerald"
                        />
                        <span className="text-sm text-gray-700">{size}</span>
                      </label>
                    ))}
                  </div>

                  {/* Custom Size Input */}
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newSize}
                      onChange={(e) => setNewSize(e.target.value.toUpperCase())}
                      placeholder="Otra talla (ej: 38, 40)"
                      className="flex-1 rounded-md border-gray-300 shadow-sm border p-2 text-sm"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSize())}
                    />
                    <button
                      type="button"
                      onClick={addSize}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Selected Sizes Tags (for custom ones mainly, but shows all) */}
                  <div className="flex flex-wrap gap-2">
                    {formData.sizes.filter(s => !STANDARD_SIZES.includes(s)).map((size) => (
                      <span key={size} className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center">
                        {size}
                        <button
                          type="button"
                          onClick={() => removeSize(size)}
                          className="ml-2 text-gray-500 hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Colors Management */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Colores</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newColorName}
                      onChange={(e) => setNewColorName(e.target.value)}
                      placeholder="Nombre (ej: Azul Noche)"
                      className="flex-1 rounded-md border-gray-300 shadow-sm border p-2"
                    />
                    <input
                      type="color"
                      value={newColorCode}
                      onChange={(e) => setNewColorCode(e.target.value)}
                      className="h-10 w-14 rounded-md border border-gray-300 p-1 cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={addColor}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.colors.map((color, idx) => (
                      <span key={idx} className="bg-gray-100 pl-3 pr-2 py-1 rounded-full text-sm flex items-center border border-gray-200">
                        <span
                          className="w-3 h-3 rounded-full mr-2 border border-gray-300"
                          style={{ backgroundColor: color.code }}
                        />
                        {color.name}
                        <button
                          type="button"
                          onClick={() => removeColor(color.name)}
                          className="ml-2 text-gray-500 hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Variant Stock Management Table */}
                {formData.sizes.length > 0 && formData.colors.length > 0 && (
                  <div className="mt-4 border rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Talla</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Color</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {formData.sizes.map(size => (
                          formData.colors.map(color => (
                            <tr key={`${size}-${color.name}`}>
                              <td className="px-4 py-2 text-sm text-gray-900">{size}</td>
                              <td className="px-4 py-2 text-sm text-gray-900 flex items-center">
                                <span className="w-3 h-3 rounded-full mr-2 border border-gray-300" style={{ backgroundColor: color.code }} />
                                {color.name}
                              </td>
                              <td className="px-4 py-2">
                                <input
                                  type="number"
                                  min="0"
                                  className="w-20 border-gray-300 rounded-md shadow-sm text-sm p-1 border"
                                  placeholder="0"
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value) || 0;
                                    setFormData(prev => {
                                      const newVariants = [...prev.variants];
                                      const index = newVariants.findIndex(v => v.size === size && v.color === color.name);
                                      if (index >= 0) {
                                        newVariants[index].stock = val;
                                      } else {
                                        newVariants.push({ size, color: color.name, stock: val });
                                      }
                                      return { ...prev, variants: newVariants };
                                    });
                                  }}
                                />
                              </td>
                            </tr>
                          ))
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-vandora-emerald text-white rounded-md hover:bg-emerald-800"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPage;
