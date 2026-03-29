import React, { useState } from 'react';
import { AppLayout } from '../components/AppLayout';
import { supabase } from '@/lib/supabase';
import { Search, AlertCircle, Package, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { Order } from '../types';

export const TrackOrder: React.FC = () => {
  const [query, setQuery] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    setOrders([]);

    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      // Search by phone OR order id
      // We try to match the full ID or the phone number
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .or(`phone.eq.${query},id.eq.${query}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error("Tracking error:", err);
    } finally {
      setLoading(false);
    }
  };

  const statusSteps = ['pending', 'confirmed', 'shipped', 'delivered'];
  
  const getStatusIndex = (status: string = 'pending') => {
    const idx = statusSteps.indexOf(status.toLowerCase());
    return idx === -1 ? 0 : idx;
  };

  return (
    <AppLayout activePage="home" pageTitle="Track Order">
      <div className="mt-4 px-4 pb-20">
        {/* Search Section */}
        <div className="bg-[var(--card-bg)] rounded-[28px] shadow-[var(--shadow-soft)] border border-[var(--border-color)] p-6 mb-6">
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4 font-serif">Track Your Order</h2>
          <form onSubmit={handleTrack} className="relative">
            <input 
              type="text" 
              placeholder="Enter Order ID or Mobile" 
              className="w-full pl-4 pr-12 py-4 rounded-[16px] border border-[var(--border-color)] bg-[var(--input-bg)] focus:ring-2 focus:ring-[var(--primary-btn)] outline-none font-bold text-lg tracking-wide text-[var(--text-body)]"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button 
              type="submit"
              disabled={loading}
              className="absolute right-2 top-2 bottom-2 bg-[var(--primary-btn)] text-white rounded-[12px] w-12 flex items-center justify-center hover:opacity-90 transition-colors shadow-md active:scale-95"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
            </button>
          </form>
          <p className="mt-3 text-[10px] text-gray-400 font-bold uppercase tracking-wider text-center">
            Search using your registered mobile number
          </p>
        </div>

        {/* Results Section */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="animate-spin text-[var(--text-primary)] mb-4" size={32} />
            <p className="text-sm font-bold text-gray-500">Searching for your order...</p>
          </div>
        )}

        {searched && !loading && orders.length === 0 && (
          <div className="bg-[var(--card-bg)] rounded-[24px] border border-dashed border-[var(--border-color)] p-12 text-center animate-fade-in">
            <div className="w-16 h-16 bg-[var(--input-bg)] rounded-full flex items-center justify-center mx-auto mb-4">
              <Package size={32} className="text-gray-400" />
            </div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">No order found</h3>
            <p className="text-xs text-gray-500 mt-1">Please check the details and try again.</p>
          </div>
        )}

        <div className="space-y-6">
          {orders.map((order) => {
            const currentIdx = getStatusIndex(order.status);
            
            return (
              <div key={order.id} className="bg-[var(--card-bg)] rounded-[24px] shadow-[var(--shadow-premium)] border border-[var(--border-color)] overflow-hidden animate-fade-in">
                {/* Order Header */}
                <div className="p-5 border-b border-[var(--border-color)] flex justify-between items-center bg-emerald-500/5">
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Order ID</p>
                    <p className="font-mono text-base font-black text-[var(--text-primary)]">{order.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-600' :
                      order.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600' :
                      order.status === 'cancelled' ? 'bg-red-500/10 text-red-600' :
                      'bg-blue-500/10 text-blue-600'
                    }`}>
                      {order.status}
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-2">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Status Steps */}
                <div className="p-6 bg-[var(--card-bg)]">
                  <div className="flex justify-between items-center relative mb-8">
                    {/* Progress Line */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-[var(--input-bg)] z-0"></div>
                    <div 
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-emerald-500 transition-all duration-1000 z-0"
                      style={{ width: `${(currentIdx / (statusSteps.length - 1)) * 100}%` }}
                    ></div>

                    {statusSteps.map((step, idx) => {
                      const isActive = idx <= currentIdx;
                      const isCurrent = idx === currentIdx;
                      
                      return (
                        <div key={step} className="relative z-10 flex flex-col items-center">
                          <div className={`w-4 h-4 rounded-full border-2 transition-all duration-500 ${
                            isActive ? 'bg-emerald-500 border-emerald-500' : 'bg-[var(--card-bg)] border-[var(--border-color)]'
                          } ${isCurrent ? 'ring-4 ring-emerald-500/20 scale-125' : ''}`}></div>
                          <span className={`absolute top-6 text-[9px] font-black uppercase tracking-tighter whitespace-nowrap ${
                            isActive ? 'text-emerald-500' : 'text-gray-400'
                          }`}>
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Current Status Message */}
                  <div className="mt-10 bg-emerald-500/10 rounded-xl p-4 flex items-center gap-3 border border-emerald-500/20">
                    <div className="w-8 h-8 bg-[var(--card-bg)] rounded-full flex items-center justify-center shadow-sm text-emerald-500 border border-[var(--border-color)]">
                      {currentIdx === 3 ? <CheckCircle size={16} /> : <Clock size={16} className="animate-pulse" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                        Current Status: {order.status || 'Pending'}
                      </p>
                      <p className="text-[10px] text-[var(--text-body)] opacity-70 font-medium">
                        {currentIdx === 0 && "We have received your order."}
                        {currentIdx === 1 && "Your order has been confirmed."}
                        {currentIdx === 2 && "Your order is on the way."}
                        {currentIdx === 3 && "Order delivered successfully."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Product List */}
                <div className="p-5 bg-[var(--input-bg)] border-t border-[var(--border-color)]">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Items Ordered</h4>
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 bg-[var(--card-bg)] border border-[var(--border-color)] rounded flex items-center justify-center font-bold text-[var(--text-primary)] text-[10px]">{item.quantity}</span>
                          <span className="font-bold text-[var(--text-body)] opacity-80">{item.name}</span>
                        </div>
                        <span className="font-black text-[var(--text-primary)]">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-sm pt-2 mt-2 border-t border-[var(--border-color)]">
                      <span className="font-bold text-[var(--text-primary)]">Total Amount</span>
                      <span className="font-black text-lg text-[#064E3B] dark:text-emerald-400">₹{order.total}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Support Footer */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-full shadow-sm">
            <AlertCircle size={14} className="text-emerald-500" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Need help? Call 9368340997</span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
