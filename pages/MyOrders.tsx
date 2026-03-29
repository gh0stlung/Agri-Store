import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Loader2, Package, Calendar, ShoppingBag } from 'lucide-react';
import { Link } from '../components/Link';

import { AppLayout } from '../components/AppLayout';

export const MyOrders: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user || !supabase) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setOrders(data);
      }
      setLoading(false);
    };

    fetchOrders();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[var(--bg-main)] flex items-center justify-center">
        <Loader2 className="animate-spin text-[var(--text-primary)]" size={32} />
      </div>
    );
  }

  return (
    <AppLayout activePage="profile">
      <div className="max-w-md mx-auto space-y-4 pt-4">
        {orders.length === 0 ? (
          <div className="bg-[var(--card-bg)] rounded-[24px] p-8 text-center border border-[var(--border-color)] shadow-sm mt-10">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="text-emerald-500" size={32} />
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2 font-serif">No orders yet</h3>
            <p className="text-sm text-gray-500 mb-6">Looks like you haven't placed any orders.</p>
            <Link href="/catalog" className="inline-flex items-center justify-center bg-[var(--primary-btn)] text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-colors">
              Start Shopping
            </Link>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="bg-[var(--card-bg)] rounded-[20px] border border-[var(--border-color)] shadow-[var(--shadow-soft)] overflow-hidden">
              <div className="p-4 border-b border-[var(--border-color)] bg-[var(--input-bg)] flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Order ID</p>
                  <p className="font-mono text-sm font-bold text-[var(--text-primary)]">{order.id.slice(0, 8).toUpperCase()}</p>
                </div>
                <div className="text-right">
                  <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-600' :
                    order.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600' :
                    order.status === 'cancelled' ? 'bg-red-500/10 text-red-600' :
                    'bg-blue-500/10 text-blue-600'
                  }`}>
                    {order.status}
                  </div>
                </div>
              </div>
              
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm text-[var(--text-body)] opacity-80">
                  <Calendar size={16} className="text-gray-400" />
                  <span>{new Date(order.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                
                <div className="border-t border-dashed border-[var(--border-color)] pt-3 mt-3">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <ShoppingBag size={14} /> Items
                  </p>
                  <div className="space-y-2">
                    {order.items?.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-[var(--text-body)]"><span className="text-gray-400 mr-2">{item.quantity}x</span>{item.name}</span>
                        <span className="font-medium text-[var(--text-body)] opacity-80">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-[var(--input-bg)] border-t border-[var(--border-color)] flex justify-between items-center">
                <span className="text-sm font-bold text-gray-500">Total Amount</span>
                <span className="text-lg font-black text-[var(--text-primary)] flex items-center">
                  ₹{order.total}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </AppLayout>
  );
};
