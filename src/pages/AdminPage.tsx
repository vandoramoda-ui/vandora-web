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
import { useAuth } from '../context/AuthContext';

const AdminPage = () => {
  const { profile } = useAuth();
  const role = profile?.role || 'cliente';

  const canManageProducts = ['admin', 'editor'].includes(role);
  const canManageOrders = ['admin', 'support'].includes(role);
  const canManageUsers = ['admin'].includes(role);

  const [activeTab, setActiveTab] = useState(
    canManageProducts ? 'products' : (canManageOrders ? 'orders' : 'users')
  );
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

  useEffect(() => {
    if (activeTab === 'products') fetchProducts();
    else if (activeTab === 'orders') fetchOrders();
    else if (activeTab === 'users') fetchUsers();
  }, [activeTab]);

  const fetchOrders = async () => {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (!error && data) setOrders(data);
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      setUsers(data.map(profile => ({
        id: profile.id,
        name: profile.full_name || 'Desconocido',
        email: profile.id,
        role: profile.role || 'Cliente',
        status: 'Activo'
      })));
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await supabase.from('products').select('*');
    if (data) {
      setProducts(data.map(p => ({
        ...p,
        images: Array.isArray(p.images) ? p.images.map((img: any) => typeof img === 'string' ? { url: img } : img) : []
      })));
    }
    setLoading(false);
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
    const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const productData = {
      ...formData,
      slug,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      upsell_product_id: formData.upsell_product_id || null,
      downsell_product_id: formData.downsell_product_id || null,
      order_bump_product_id: formData.order_bump_product_id || null
    };

    if (editingProduct) {
      const { error } = await supabase.from('products').update(productData).eq('id', editingProduct.id);
      if (!error) {
        setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...productData } : p));
        closeModal();
      }
    } else {
      const { data, error } = await supabase.from('products').insert([productData]).select();
      if (!error && data) {
        setProducts([...products, data[0]]);
        closeModal();
      }
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
    const { error } = await supabase.from('profiles').update({
      role: editingUser.role
    }).eq('id', editingUser.id);

    if (!error) {
      setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
      setIsUserModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      <SEO title="Admin Dashboard" description="Panel de control de Vandora" />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <h2 className="text-2xl font-serif text-gray-900 mb-6">Panel de Administración</h2>
        <div className="flex space-x-4 mb-6 border-b">
          {canManageProducts && (
            <button onClick={() => setActiveTab('products')} className={`pb-2 px-4 ${activeTab === 'products' ? 'border-b-2 border-vandora-emerald text-vandora-emerald font-medium' : 'text-gray-500'}`}>Productos</button>
          )}
          {canManageOrders && (
            <button onClick={() => setActiveTab('orders')} className={`pb-2 px-4 ${activeTab === 'orders' ? 'border-b-2 border-vandora-emerald text-vandora-emerald font-medium' : 'text-gray-500'}`}>Pedidos</button>
          )}
          {canManageUsers && (
            <button onClick={() => setActiveTab('users')} className={`pb-2 px-4 ${activeTab === 'users' ? 'border-b-2 border-vandora-emerald text-vandora-emerald font-medium' : 'text-gray-500'}`}>Usuarios</button>
          )}
        </div>

        {activeTab === 'products' && canManageProducts && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Inventario de Productos</h3>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setFormData({ name: '', price: '', category: '', stock: '', description: '', details: '', materials: '', care: '', images: [], videos: [], sizes: [], colors: [], variants: [], upsell_product_id: '', downsell_product_id: '', order_bump_product_id: '' });
                  setIsModalOpen(true);
                }}
                className="bg-vandora-emerald text-white px-4 py-2 rounded-md flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" /> Nuevo Producto
              </button>
            </div>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map(product => (
                    <tr key={product.id}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{formatPrice(product.price)}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{product.stock}</td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <button className="text-vandora-emerald mr-3" onClick={() => {
                          setEditingProduct(product);
                          setFormData({ ...product, price: product.price.toString(), stock: product.stock.toString() });
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
            <h3 className="text-lg font-medium mb-4">Gestión de Pedidos</h3>
            <div className="bg-white rounded-lg shadow overflow-hidden">
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
                <tbody className="divide-y divide-gray-200">
                  {orders.map(order => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">#{order.id.substring(0, 8)}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{order.customer_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{formatPrice(order.total_amount)}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                          {order.status}
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'users' && canManageUsers && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Gestión de Usuarios</h3>
              <button
                className="bg-vandora-emerald text-white px-4 py-2 rounded-md flex items-center text-sm"
                onClick={() => {
                  setEditingUser(null);
                  setIsUserModalOpen(true);
                }}
              >
                <Users className="h-4 w-4 mr-2" /> Invitar Usuario
              </button>
            </div>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID / Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map(userItem => (
                    <tr key={userItem.id}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{userItem.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{userItem.id.substring(0, 15)}...</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${userItem.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                          userItem.role === 'editor' ? 'bg-blue-100 text-blue-800' :
                            userItem.role === 'support' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                          {userItem.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <button className="text-vandora-emerald" onClick={() => {
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

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-medium">{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h2>
                <button onClick={closeModal}><X className="h-6 w-6" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Precio</label>
                    <input type="number" step="0.01" name="price" value={formData.price} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-6">
                  <button type="button" onClick={closeModal} className="px-4 py-2 border rounded-md">Cancelar</button>
                  <button type="submit" className="px-4 py-2 bg-vandora-emerald text-white rounded-md">Guardar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isOrderModalOpen && editingOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-medium">Editar Pedido</h2>
                <button onClick={() => setIsOrderModalOpen(false)}><X className="h-6 w-6" /></button>
              </div>
              <form onSubmit={handleSaveOrder} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estado</label>
                  <select
                    value={editingOrder.status}
                    onChange={(e) => setEditingOrder({ ...editingOrder, status: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                  >
                    <option value="pending">Pendiente</option>
                    <option value="processing">En Proceso</option>
                    <option value="shipped">Enviado</option>
                    <option value="completed">Completado</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notas</label>
                  <textarea
                    value={editingOrder.notes || ''}
                    onChange={(e) => setEditingOrder({ ...editingOrder, notes: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-6">
                  <button type="button" onClick={() => setIsOrderModalOpen(false)} className="px-4 py-2 border rounded-md">Cancelar</button>
                  <button type="submit" className="px-4 py-2 bg-vandora-emerald text-white rounded-md">Guardar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isUserModalOpen && editingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-medium">Gestionar Usuario</h2>
                <button onClick={() => setIsUserModalOpen(false)}><X className="h-6 w-6" /></button>
              </div>
              <p className="text-sm text-gray-600 mb-4">Editando rol para: {editingUser?.name}</p>
              <form onSubmit={handleSaveUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rol</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                  >
                    <option value="cliente">Cliente</option>
                    <option value="support">Soporte</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3 pt-6">
                  <button type="button" onClick={() => setIsUserModalOpen(false)} className="px-4 py-2 border rounded-md">Cancelar</button>
                  <button type="submit" className="px-4 py-2 bg-vandora-emerald text-white rounded-md">Guardar Cambios</button>
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
