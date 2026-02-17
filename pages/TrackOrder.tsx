import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { AppLayout } from '../components/AppLayout';
import { Search, Package, Clock, CheckCircle, Truck, XCircle, AlertCircle } from 'lucide-react';
import { Order } from '../types';

export const TrackOrder: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    
    setLoading(true);
    setSearched(true);
    
    // Demo mode fallback
    if (!supabase) {
        setTimeout(() => {
            setOrders([]);
            setLoading(false);
        }, 800);
        return;
    }

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('phone', phone)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error(err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string = 'pending') => {
    switch(status.toLowerCase()) {
        case 'confirmed': return {
            color: 'bg-blue-100 text-blue-700 border-blue-200',
            icon: CheckCircle,
            text: 'Order confirm ho gaya ✅'
        };
        case 'shipped': return {
            color: 'bg-orange-100 text-orange-700 border-orange-200',
            icon: Truck,
            text: 'Order delivery ke liye nikal gaya 🚚'
        };
        case 'delivered': return {
            color: 'bg-green-100 text-green-700 border-green-200',
            icon: CheckCircle,
            text: 'Order deliver ho gaya 🎉'
        };
        case 'cancelled': return {
            color: 'bg-red-100 text-red-700 border-red-200',
            icon: XCircle,
            text: 'Order cancel ho gaya ❌'
        };
        default: return {
            color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            icon: Clock,
            text: 'Order mila hai, confirm hone wala hai ⏳'
        };
    }
  };

  return (
    <AppLayout activePage="home" pageTitle="Track Order">
        <div className="mt-4">
            <div className="bg-white rounded-[24px] shadow-sm border border-[#E7E5E4] p-6 mb-6">
                <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4 font-serif">Enter Mobile Number</h2>
                <form onSubmit={handleSearch} className="relative">
                    <input 
                        type="tel" 
                        placeholder="e.g. 9876543210" 
                        className="w-full pl-4 pr-12 py-4 rounded-[16px] border border-[#E7E5E4] bg-[#FFFCF0] focus:ring-2 focus:ring-[#064E3B] outline-none font-bold text-lg tracking-wide"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />
                    <button 
                        type="submit"
                        disabled={loading}
                        className="absolute right-2 top-2 bottom-2 bg-[#064E3B] text-white rounded-[12px] w-12 flex items-center justify-center hover:bg-[#065E4B] transition-colors"
                    >
                        {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <Search size={20} />}
                    </button>
                </form>
            </div>

            {searched && !loading && orders.length === 0 && (
                <div className="text-center py-12 opacity-60">
                    <Package size={48} className="mx-auto mb-3 text-gray-400" />
                    <p className="font-bold text-gray-600">No orders found for this number.</p>
                </div>
            )}

            <div className="space-y-4 pb-12">
                {orders.map(order => {
                    const statusInfo = getStatusInfo(order.status);
                    const StatusIcon = statusInfo.icon;

                    return (
                        <div key={order.id} className="bg-white rounded-[20px] shadow-sm border border-[#E7E5E4] overflow-hidden animate-fade-in">
                            <div className="p-5 border-b border-gray-100 flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Order #{order.id.slice(0, 8)}</p>
                                    <p className="font-black text-xl text-[var(--text-primary)]">₹{order.total_price}</p>
                                </div>
                                <div className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide border ${statusInfo.color}`}>
                                    <StatusIcon size={12} />
                                    {order.status || 'Pending'}
                                </div>
                            </div>
                            
                            <div className="p-5 bg-gray-50">
                                <p className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                    <AlertCircle size={16} className="text-[#064E3B]" />
                                    {statusInfo.text}
                                </p>
                                
                                <div className="space-y-2">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-xs text-gray-600">
                                            <span>{item.quantity} x {item.name}</span>
                                            <span className="font-bold">₹{item.price * item.quantity}</span>
                                        </div>
                                    ))}
                                </div>
                                
                                <p className="text-[10px] text-gray-400 font-bold mt-4 text-right">
                                    {new Date(order.created_at).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    </AppLayout>
  );
};