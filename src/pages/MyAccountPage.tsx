import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Package, User, MapPin, Mail, Phone, Calendar, Megaphone, ExternalLink, Sparkles, ArrowUpRight, TrendingUp } from 'lucide-react';
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
            navigate('/iniciar-sesion');
        }
    }, [user, authLoading, navigate]);

    useEffect(() => {
        if (user) {
            fetchOrders();
        }
    }, [user]);

    const fetchOrders = async () => {
        try {
            console.log('MyAccount: Fetching orders for user ID:', user?.id, 'and email:', user?.email);
            const { data, error, count } = await supabase
                .from('orders')
                .select('*', { count: 'exact' })
                .or(`user_id.eq.${user?.id},customer_email.eq.${user?.email}`)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('MyAccount: Error fetching orders:', error);
                throw error;
            }
            
            console.log('MyAccount: Query successful. Orders found:', data?.length || 0, 'Total count:', count);
            setOrders(data || []);
        } catch (error: any) {
            console.error('Error detail in fetchOrders:', error.message || error);
        } finally {
            setLoadingOrders(false);
        }
    };

    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        full_name: '',
        phone: '',
        address: '',
        birthday: ''
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (profile) {
            setEditData({
                full_name: profile.full_name || '',
                phone: profile.phone || '',
                address: profile.address || '',
                birthday: profile.birthday || ''
            });
        }
    }, [profile]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: editData.full_name,
                    phone: editData.phone,
                    address: editData.address,
                    birthday: editData.birthday || null
                })
                .eq('id', user?.id);

            if (error) throw error;
            setIsEditing(false);
            window.location.reload(); // Quick way to refresh profile in context
        } catch (error: any) {
            alert('Error al actualizar el perfil: ' + error.message);
        } finally {
            setSaving(false);
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
                <div className="mb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-serif text-vandora-emerald">Mi Cuenta</h1>
                        <p className="text-gray-600">Bienvenida de nuevo, {profile?.full_name || user.user_metadata?.full_name || 'Cliente'}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Details Sidebar */}
                    {/* Profile & Affiliate Sidebar */}
                    <div className="lg:col-span-1 space-y-8">
                        {/* Profile Details */}
                        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                            <div className="flex justify-between items-center mb-4 border-b pb-2">
                                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                                    <User className="w-5 h-5 mr-2 text-vandora-emerald" />
                                    Mi Perfil
                                </h2>
                                <button 
                                    onClick={() => setIsEditing(!isEditing)}
                                    className="text-vandora-emerald hover:text-emerald-800 text-sm font-medium"
                                >
                                    {isEditing ? 'Cancelar' : 'Editar'}
                                </button>
                            </div>
                            
                            {isEditing ? (
                                <form onSubmit={handleUpdateProfile} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Nombre Completo</label>
                                        <input 
                                            type="text"
                                            value={editData.full_name}
                                            onChange={(e) => setEditData({...editData, full_name: e.target.value})}
                                            className="w-full p-2 border rounded-md text-sm"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Teléfono</label>
                                        <input 
                                            type="tel"
                                            value={editData.phone}
                                            onChange={(e) => setEditData({...editData, phone: e.target.value})}
                                            className="w-full p-2 border rounded-md text-sm"
                                            placeholder="099 999 9999"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Dirección</label>
                                        <input 
                                            type="text"
                                            value={editData.address}
                                            onChange={(e) => setEditData({...editData, address: e.target.value})}
                                            className="w-full p-2 border rounded-md text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Fecha de Cumpleaños</label>
                                        <input 
                                            type="date"
                                            value={editData.birthday}
                                            onChange={(e) => setEditData({...editData, birthday: e.target.value})}
                                            className="w-full p-2 border rounded-md text-sm"
                                        />
                                    </div>
                                    <button 
                                        type="submit"
                                        disabled={saving}
                                        className="w-full bg-vandora-emerald text-white py-2 rounded-md hover:bg-emerald-800 transition-colors text-sm font-medium disabled:opacity-50"
                                    >
                                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                                    </button>
                                </form>
                            ) : (
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
                                            <p className="text-sm text-gray-500">{profile?.full_name || user.user_metadata?.full_name || 'No proporcionado'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <Phone className="w-4 h-4 text-gray-400 mt-1 mr-3" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Teléfono</p>
                                            <p className="text-sm text-gray-500">{profile?.phone || 'No proporcionado'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <MapPin className="w-4 h-4 text-gray-400 mt-1 mr-3" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Dirección</p>
                                            <p className="text-sm text-gray-500">{profile?.address || 'No proporcionado'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <Calendar className="w-4 h-4 text-gray-400 mt-1 mr-3" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Cumpleaños</p>
                                            <p className="text-sm text-gray-500">{profile?.birthday || 'No proporcionado'}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Affiliate Program Section */}
                        <AffiliateSection profile={profile} user={user} />

                        {/* Info Box */}
                        <div className="bg-white rounded-lg p-5 border border-dashed border-gray-300">
                            <h3 className="text-sm font-bold text-gray-700 mb-2 font-serif italic">¿Cómo empezar?</h3>
                            <ul className="text-xs text-gray-500 space-y-2 list-none p-0">
                                <li className="flex gap-2">
                                    <span className="text-vandora-emerald font-bold">1.</span>
                                    Comparte tu enlace único en redes sociales.
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-vandora-emerald font-bold">2.</span>
                                    Tus seguidoras reciben beneficios exclusivos.
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-vandora-emerald font-bold">3.</span>
                                    Tú ganas una comisión por cada compra.
                                </li>
                            </ul>
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

const AffiliateSection = ({ profile, user }: { profile: any, user: any }) => {
    const [affiliate, setAffiliate] = useState<any>(null);
    const [referrals, setReferrals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [copySuccess, setCopySuccess] = useState(false);

    useEffect(() => {
        if (user) {
            fetchAffiliateData();
        }
    }, [user]);

    const fetchAffiliateData = async () => {
        try {
            const { data: aff, error: affError } = await supabase
                .from('affiliates')
                .select('*')
                .eq('user_id', user.id)
                .maybeSingle();

            if (affError) throw affError;
            setAffiliate(aff);

            if (aff) {
                const { data: refs, error: refsError } = await supabase
                    .from('affiliate_referrals')
                    .select('*, orders(total, status)')
                    .eq('affiliate_id', aff.id)
                    .order('created_at', { ascending: false })
                    .limit(5);

                if (refsError) throw refsError;
                setReferrals(refs || []);
            }
        } catch (err) {
            console.error('Error fetching affiliate data:', err);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        const link = `${window.location.origin}?t=${affiliate?.referral_code}`;
        navigator.clipboard.writeText(link);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    if (loading) return <div className="p-4 text-center text-gray-400">Cargando datos de afiliada...</div>;

    if (!affiliate) {
        return (
            <div className="bg-gradient-to-br from-vandora-emerald to-emerald-900 rounded-lg shadow-md p-6 text-white overflow-hidden relative group">
                <div className="absolute top-0 right-0 -m-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Megaphone className="w-32 h-32 rotate-12" />
                </div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <Sparkles className="w-5 h-5 text-yellow-300" />
                        </div>
                        <h2 className="text-xl font-serif">Programa de Afiliadas</h2>
                    </div>
                    
                    <p className="text-emerald-50 text-sm mb-6 leading-relaxed">
                        ¡Comparte tu pasión por Vandora y gana comisiones por cada venta que refieras! 
                        Únete a nuestro programa exclusivo.
                    </p>
                    
                    <div className="space-y-4">
                        <div className="bg-white/10 p-3 rounded-md backdrop-blur-sm border border-white/10">
                            <p className="text-xs uppercase font-bold text-emerald-200 mb-1">Tu Beneficio</p>
                            <p className="font-medium">10% de Comisión en efectivo</p>
                        </div>
                        
                        <button 
                            onClick={() => window.location.href = '/contacto'}
                            className="w-full bg-white text-vandora-emerald py-3 rounded-md hover:bg-emerald-50 transition-all text-center font-bold text-sm flex items-center justify-center gap-2 shadow-lg"
                        >
                            Quiero Unirme
                            <ArrowUpRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-emerald-100 flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-serif text-vandora-emerald flex items-center">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Panel de Afiliada
                </h2>
                <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase ${affiliate.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {affiliate.status === 'active' ? 'Activa' : 'Inactiva'}
                </span>
            </div>

            <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
                <label className="block text-[10px] uppercase font-bold text-emerald-700 mb-2">Tu Enlace de Referido</label>
                <div className="flex gap-2">
                    <div className="flex-1 bg-white border border-emerald-200 rounded px-3 py-2 text-sm font-mono text-gray-600 truncate">
                        {window.location.origin}?t={affiliate.referral_code}
                    </div>
                    <button 
                        onClick={copyToClipboard}
                        className="bg-vandora-emerald text-white px-4 py-2 rounded text-sm font-bold hover:bg-emerald-800 transition-colors shrink-0"
                    >
                        {copySuccess ? '¡Copiado!' : 'Copiar'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Ganado Total</p>
                    <p className="text-xl font-bold text-gray-900">{formatPrice(affiliate.earnings_total || 0)}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-[10px] uppercase font-bold text-emerald-700 mb-1">Disponible</p>
                    <p className="text-xl font-bold text-vandora-emerald">{formatPrice(affiliate.balance || 0)}</p>
                </div>
            </div>

            {referrals.length > 0 && (
                <div>
                    <h3 className="text-xs font-bold text-gray-700 uppercase mb-3 flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Ventas Recientes
                    </h3>
                    <div className="space-y-3">
                        {referrals.map((ref) => (
                            <div key={ref.id} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                                <div>
                                    <p className="font-medium text-gray-900">Referido #{ref.order_id.substring(0,6)}</p>
                                    <p className="text-[10px] text-gray-400 font-mono tracking-tighter">
                                        {new Date(ref.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-emerald-600">+{formatPrice(ref.amount)}</p>
                                    <p className={`text-[9px] uppercase font-bold ${ref.status === 'paid' ? 'text-blue-500' : 'text-yellow-500'}`}>
                                        {ref.status === 'paid' ? 'Pagado' : 'Pendiente'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyAccountPage;
