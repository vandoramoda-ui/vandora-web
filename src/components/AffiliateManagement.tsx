import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Check, X, Clock, Instagram, Mail, User, 
  DollarSign, TrendingUp, CreditCard, Users, 
  Search, Filter, ArrowUpRight, CheckCircle2
} from 'lucide-react';
import { formatPrice } from '../lib/utils';

type TabType = 'applications' | 'affiliates' | 'commissions' | 'payouts';

const AffiliateManagement = () => {
  const [activeTab, setActiveTab] = useState<TabType>('applications');
  const [applications, setApplications] = useState<any[]>([]);
  const [affiliates, setAffiliates] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAffiliates: 0,
    pendingCommissions: 0,
    totalPaid: 0
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'applications') {
        const { data } = await supabase
          .from('affiliate_applications')
          .select('*')
          .order('created_at', { ascending: false });
        setApplications(data || []);
      } else if (activeTab === 'affiliates') {
        const { data } = await supabase
          .from('affiliates')
          .select('*, profiles(full_name, email)')
          .order('referral_count', { ascending: false });
        setAffiliates(data || []);
      } else if (activeTab === 'commissions') {
        const { data } = await supabase
          .from('affiliate_referrals')
          .select('*, affiliates(referral_code), orders(total, customer_name)')
          .order('created_at', { ascending: false });
        setCommissions(data || []);
      } else if (activeTab === 'payouts') {
        const { data } = await supabase
          .from('affiliate_payouts')
          .select('*, affiliates(referral_code)')
          .order('created_at', { ascending: false });
        setPayouts(data || []);
      }

      // Fetch global stats (simulated or real if tables exist)
      // For now, let's just use what we have in views or simple counts
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (id: string, email: string, userId: string | null, fullName: string, status: 'approved' | 'rejected') => {
    try {
      const { error: appError } = await supabase
        .from('affiliate_applications')
        .update({ status })
        .eq('id', id);

      if (appError) throw appError;

      if (status === 'approved') {
        // Create an affiliate entry if approved
        const referralCode = fullName.split(' ')[0].toUpperCase() + Math.floor(1000 + Math.random() * 9000);
        
        const { error: affError } = await supabase
          .from('affiliates')
          .insert([{
            user_id: userId, // Might be null if guest applied
            referral_code: referralCode,
            status: 'active',
            commission_rate: 10,
            earnings_total: 0,
            balance: 0
          }]);
        
        if (affError) console.error('Error creating affiliate entry:', affError);
        else alert(`Afiliado aprobado. Código generado: ${referralCode}`);
      }

      fetchData();
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Error al procesar la solicitud');
    }
  };

  const approveCommission = async (id: string) => {
    try {
      // 1. Get commission details
      const { data: commission } = await supabase
        .from('affiliate_referrals')
        .select('amount, affiliate_id')
        .eq('id', id)
        .single();

      if (!commission) throw new Error('Comisión no encontrada');

      // 2. Update status
      const { error: statusError } = await supabase
        .from('affiliate_referrals')
        .update({ status: 'approved' })
        .eq('id', id);
      
      if (statusError) throw statusError;

      // 3. Update affiliate balance and total earnings
      const { error: affError } = await supabase.rpc('increment_affiliate_balance', {
        aff_id: commission.affiliate_id,
        inc_amount: commission.amount
      });

      // Fallback if RPC doesn't exist (using standard update)
      if (affError) {
        const { data: currentAff } = await supabase
          .from('affiliates')
          .select('balance, earnings_total')
          .eq('id', commission.affiliate_id)
          .single();
        
        if (currentAff) {
          await supabase
            .from('affiliates')
            .update({
              balance: (currentAff.balance || 0) + commission.amount,
              earnings_total: (currentAff.earnings_total || 0) + commission.amount
            })
            .eq('id', commission.affiliate_id);
        }
      }
      
      fetchData();
    } catch (err) {
      console.error('Error approving commission:', err);
      alert('Error al aprobar comisión');
    }
  };

  const markAsPaid = async (id: string) => {
    try {
      // 1. Get commission details
      const { data: commission } = await supabase
        .from('affiliate_referrals')
        .select('amount, affiliate_id')
        .eq('id', id)
        .single();

      if (!commission) throw new Error('Comisión no encontrada');

      // 2. Update status
      const { error: statusError } = await supabase
        .from('affiliate_referrals')
        .update({ status: 'paid' })
        .eq('id', id);
      
      if (statusError) throw statusError;

      // 3. Deduct from balance
      const { data: currentAff } = await supabase
        .from('affiliates')
        .select('balance')
        .eq('id', commission.affiliate_id)
        .single();
      
      if (currentAff) {
        await supabase
          .from('affiliates')
          .update({
            balance: Math.max(0, (currentAff.balance || 0) - commission.amount)
          })
          .eq('id', commission.affiliate_id);
      }

      fetchData();
    } catch (err) {
      console.error('Error marking as paid:', err);
      alert('Error al marcar como pagada');
    }
  };

  const renderApplications = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Candidata</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Redes Sociales</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mensaje</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {applications.map((app) => (
            <tr key={app.id}>
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900">{app.full_name}</div>
                <div className="text-sm text-gray-500">{app.email}</div>
              </td>
              <td className="px-6 py-4">
                <a href={app.social_media} target="_blank" className="text-pink-600 hover:underline flex items-center">
                  <Instagram className="w-4 h-4 mr-1" /> {app.social_media}
                </a>
              </td>
              <td className="px-6 py-4">
                <p className="text-sm text-gray-600 max-w-xs truncate">{app.message}</p>
              </td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 text-xs font-bold rounded-full uppercase ${
                  app.status === 'approved' ? 'bg-green-100 text-green-800' :
                  app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {app.status === 'approved' ? 'Aprobada' : app.status === 'rejected' ? 'Rechazada' : 'Pendiente'}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                {app.status === 'pending' && (
                  <div className="flex justify-end space-x-2">
                    <button onClick={() => updateApplicationStatus(app.id, app.email, app.user_id, app.full_name, 'approved')} className="p-1 text-green-600 hover:bg-green-50 rounded-full">
                      <Check className="w-5 h-5" />
                    </button>
                    <button onClick={() => updateApplicationStatus(app.id, app.email, app.user_id, app.full_name, 'rejected')} className="p-1 text-red-600 hover:bg-red-50 rounded-full">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderAffiliates = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Afiliado</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Comisión</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ganado</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Saldo</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {affiliates.map((aff) => (
            <tr key={aff.id}>
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900">{aff.profiles?.full_name || 'Manual'}</div>
                <div className="text-sm text-gray-500">{aff.profiles?.email || '-'}</div>
              </td>
              <td className="px-6 py-4 font-mono font-bold text-vandora-emerald">{aff.referral_code}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{aff.commission_rate}%</td>
              <td className="px-6 py-4 text-sm font-medium text-emerald-600">{formatPrice(aff.earnings_total)}</td>
              <td className="px-6 py-4 text-sm font-bold text-gray-900">{formatPrice(aff.balance)}</td>
              <td className="px-6 py-4 text-right">
                <button className="text-blue-600 hover:text-blue-800 text-xs font-medium">Ver Historial</button>
              </td>
            </tr>
          ))}
          {affiliates.length === 0 && <tr className="text-center"><td colSpan={6} className="py-10 text-gray-400">No hay afiliados registrados.</td></tr>}
        </tbody>
      </table>
    </div>
  );

  const renderCommissions = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Afiliado</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pedido / Cliente</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Comisión</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {commissions.map((comm) => (
            <tr key={comm.id}>
              <td className="px-6 py-4 text-xs text-gray-500">{new Date(comm.created_at).toLocaleDateString()}</td>
              <td className="px-6 py-4 font-medium text-vandora-emerald">{comm.affiliates?.referral_code}</td>
              <td className="px-6 py-4 text-sm text-gray-600">
                #{comm.order_id.substring(0,8)}<br/>
                <span className="text-xs text-gray-400">{comm.orders?.customer_name}</span>
              </td>
              <td className="px-6 py-4 text-sm font-bold text-emerald-600">{formatPrice(comm.amount)}</td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase ${
                  comm.status === 'paid' ? 'bg-blue-100 text-blue-800' :
                  comm.status === 'approved' ? 'bg-green-100 text-green-800' :
                  comm.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {comm.status === 'paid' ? 'Pagada' : comm.status === 'approved' ? 'Aprobada' : comm.status === 'cancelled' ? 'Anulada' : 'Pendiente'}
                </span>
              </td>
              <td className="px-6 py-4 text-right space-x-2">
                {comm.status === 'pending' && (
                  <button onClick={() => approveCommission(comm.id)} className="text-emerald-600 hover:bg-emerald-50 px-2 py-1 rounded text-xs font-medium border border-emerald-200">
                    Aprobar
                  </button>
                )}
                {comm.status === 'approved' && (
                  <button onClick={() => markAsPaid(comm.id)} className="text-blue-600 hover:bg-blue-50 px-2 py-1 rounded text-xs font-medium border border-blue-200">
                    Marcar Pagada
                  </button>
                )}
              </td>
            </tr>
          ))}
          {commissions.length === 0 && <tr className="text-center"><td colSpan={6} className="py-10 text-gray-400">No hay comisiones registradas.</td></tr>}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Total Afiliados</p>
            <p className="text-2xl font-bold text-gray-900">{affiliates.length}</p>
          </div>
          <div className="bg-emerald-50 p-3 rounded-full text-vandora-emerald">
            <Users className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Comisiones Pendientes</p>
            <p className="text-2xl font-bold text-yellow-600">
              {commissions.filter(c => c.status === 'pending').length}
            </p>
          </div>
          <div className="bg-yellow-50 p-3 rounded-full text-yellow-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Pagos Realizados</p>
            <p className="text-2xl font-bold text-blue-600">
              {formatPrice(commissions.filter(c => c.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0))}
            </p>
          </div>
          <div className="bg-blue-50 p-3 rounded-full text-blue-600">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="border-b border-gray-100 flex">
          {[
            { id: 'applications', label: 'Solicitudes', icon: User },
            { id: 'affiliates', label: 'Lista Afiliados', icon: Users },
            { id: 'commissions', label: 'Comisiones', icon: TrendingUp },
            { id: 'payouts', label: 'Pagos', icon: CreditCard }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center px-6 py-4 text-sm font-medium transition-all ${
                activeTab === tab.id ? 'text-vandora-emerald border-b-2 border-vandora-emerald bg-emerald-50/30' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-0">
          {loading ? (
            <div className="p-20 text-center text-gray-400">Cargando...</div>
          ) : (
            <>
              {activeTab === 'applications' && renderApplications()}
              {activeTab === 'affiliates' && renderAffiliates()}
              {activeTab === 'commissions' && renderCommissions()}
              {activeTab === 'payouts' && (
                <div className="p-10 text-center text-gray-400">
                  El historial de pagos se genera automáticamente al marcar comisiones como pagadas.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AffiliateManagement;
