import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Package, User, MapPin, Mail, Phone, Calendar } from 'lucide-react';
import SEO from '../components/SEO';
import { formatPrice } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

const MyAccountPage = () => {
    const { user, profile, loading: authLoading } = useAuth();
    const [orders, setOrders] = useState<any[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
        }
    }, [user, authLoading, navigate]);

    useEffect(() => {
        if (user) {
            fetchOrders();
        }
    }, [user]);

    const fetchOrders = async () => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('user_id', user?.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoadingOrders(false);
        }
    };

    if (authLoading || (user && loadingOrders)) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-vandora-emerald"></div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="bg-vandora-cream min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <SEO title="Mi Cuenta" description="Administra tu perfil y pedidos en Vandora" />
            <div className="max-w-5xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-serif text-vandora-emerald">Mi Cuenta</h1>
                    <p className="text-gray-600">Bienvenida de nuevo, {user.user_metadata?.full_name || 'Cliente'}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Details Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center border-b pb-2">
                                <User className="w-5 h-5 mr-2 text-vandora-emerald" />
                                Mi Perfil
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-start">
                                    <Mail className="w-4 h-4 text-gray-400 mt-1 mr-3" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Correo Electrónico</p>
                                        <p className="text-sm text-gray-500">{user.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <User className="w-4 h-4 text-gray-400 mt-1 mr-3" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Nombre</p>
                                        <p className="text-sm text-gray-500">{user.user_metadata?.full_name || 'No proporcionado'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <MapPin className="w-4 h-4 text-gray-400 mt-1 mr-3" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Dirección</p>
                                        <p className="text-sm text-gray-500">Puedes actualizarla al realizar tu próximo pedido.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Orders List */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                                    <Package className="w-5 h-5 mr-2 text-vandora-emerald" />
                                    Mis Pedidos
                                </h2>
                            </div>

                            <div className="divide-y divide-gray-100">
                                {orders.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">
                                        <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                        <p>Aún no has realizado ningún pedido.</p>
                                    </div>
                                ) : (
                                    orders.map((order) => (
                                        <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                                            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
                                                <div>
                                                    <p className="text-sm text-gray-500 mb-1">
                                                        Pedido <span className="font-medium text-gray-900">#{order.id.substring(0, 8)}</span>
                                                    </p>
                                                    <p className="text-xs text-gray-400 flex items-center">
                                                        <Calendar className="w-3 h-3 mr-1" />
                                                        {new Date(order.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {formatPrice(order.total)}
                                                    </span>
                                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full 
                            ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-gray-100 text-gray-800'}`}>
                                                        {order.status === 'completed' ? 'Completado' : order.status === 'pending' ? 'En Proceso' : order.status}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded text-sm text-gray-600">
                                                {order.items && Array.isArray(order.items) ? (
                                                    <div className="space-y-2">
                                                        {order.items.map((item: any, idx: number) => (
                                                            <div key={idx} className="flex justify-between">
                                                                <span>{item.quantity}x {item.name} ({item.size})</span>
                                                                <span>{formatPrice(item.price * item.quantity)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p>Detalles no disponibles</p>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyAccountPage;
