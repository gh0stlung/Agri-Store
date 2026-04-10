import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigation } from '../context/NavigationContext';
import {
  Truck, MapPin, CheckCircle, LogOut, Package,
  Navigation, RefreshCw, Clock, Phone, User,
  Loader2, ChevronDown, ChevronUp, Wifi, WifiOff,
  IndianRupee, Smartphone, AlertTriangle, X, Check
} from 'lucide-react';

interface DeliveryStaff {
  id: string;
  name: string;
  phone: string;
}

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface AssignedOrder {
  id: string;
  customer_name: string;
  phone: string;
  address: string;
  items: OrderItem[];
  total: number;
  status: string;
  created_at: string;
  delivery_lat?: number;
  delivery_lng?: number;
  delivery_updated_at?: string;
  payment_status?: string;
  payment_method?: string;
}

const PAYMENT_OPTIONS = [
  {
    id: 'cod',
    label: 'Cash Received',
    sub: 'Customer paid in cash',
    icon: IndianRupee,
    color: 'green',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    text: 'text-green-400',
    activeBg: 'bg-green-500',
  },
  {
    id: 'online',
    label: 'Online Payment',
    sub: 'UPI / Bank transfer done',
    icon: Smartphone,
    color: 'blue',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    activeBg: 'bg-blue-500',
  },
  {
    id: 'delayed',
    label: 'Payment Delayed',
    sub: 'Customer will pay later',
    icon: AlertTriangle,
    color: 'orange',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    text: 'text-orange-400',
    activeBg: 'bg-orange-500',
  },
];

export const DeliveryDashboard: React.FC = () => {
  const { push } = useNavigation();
  const [staff, setStaff] = useState<DeliveryStaff | null>(null);
  const [orders, setOrders] = useState<AssignedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'tracking' | 'error'>('idle');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [lastLocation, setLastLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [deliveryModal, setDeliveryModal] = useState<AssignedOrder | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string>('');
  const [paymentNote, setPaymentNote] = useState('');
  const locationInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const ordersRef = useRef<AssignedOrder[]>([]);
  ordersRef.current = orders;

  useEffect(() => {
    const stored = sessionStorage.getItem('delivery_staff');
    if (!stored) { push('/delivery-login'); return; }
    setStaff(JSON.parse(stored));
  }, []);

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => { window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline); };
  }, []);

  const fetchOrders = useCallback(async () => {
    if (!staff || !supabase) return;
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('assigned_to', staff.id)
        .not('status', 'eq', 'delivered')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }, [staff]);

  useEffect(() => { if (staff) fetchOrders(); }, [staff, fetchOrders]);

  const updateLocation = useCallback(async (staffId: string) => {
    if (!supabase || !navigator.geolocation) return;
    return new Promise<void>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude: lat, longitude: lng, heading, speed } = pos.coords;
          setLastLocation({ lat, lng });
          try {
            if (!supabase) return;
            const activeOrderIds = ordersRef.current.map(o => o.id);
            if (activeOrderIds.length > 0) {
              await supabase.from('orders').update({
                delivery_lat: lat,
                delivery_lng: lng,
                delivery_updated_at: new Date().toISOString()
              }).in('id', activeOrderIds);
            }
            for (const orderId of activeOrderIds) {
              await supabase.from('delivery_locations').upsert({
                staff_id: staffId,
                order_id: orderId,
                lat, lng,
                heading: heading || null,
                speed: speed || null,
                updated_at: new Date().toISOString()
              }, { onConflict: 'staff_id,order_id' });
            }
          } catch (err) { console.error('Location update error:', err); }
          resolve();
        },
        (err) => { console.error('GPS error:', err); setLocationStatus('error'); resolve(); },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
      );
    });
  }, []);

  const startTracking = useCallback(() => {
    if (!staff) return;
    setLocationStatus('tracking');
    updateLocation(staff.id);
    locationInterval.current = setInterval(() => updateLocation(staff.id), 30000);
  }, [staff, updateLocation]);

  const stopTracking = useCallback(() => {
    if (locationInterval.current) { clearInterval(locationInterval.current); locationInterval.current = null; }
    setLocationStatus('idle');
  }, []);

  useEffect(() => () => { if (locationInterval.current) clearInterval(locationInterval.current); }, []);

  const handleMarkDelivered = async () => {
    if (!supabase || !deliveryModal || !selectedPayment) return;
    setUpdatingStatus(deliveryModal.id);
    try {
      const { error } = await supabase.from('orders').update({
        status: 'delivered',
        payment_status: selectedPayment === 'cod' ? 'paid_cash' : selectedPayment === 'online' ? 'paid_online' : 'delayed',
        payment_method: selectedPayment,
        payment_note: paymentNote || null,
        delivered_at: new Date().toISOString()
      }).eq('id', deliveryModal.id);
      if (error) throw error;
      setOrders(prev => prev.filter(o => o.id !== deliveryModal.id));
      setDeliveryModal(null);
      setSelectedPayment('');
      setPaymentNote('');
    } catch (err) { console.error('Error:', err); }
    finally { setUpdatingStatus(null); }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'confirmed': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'shipped': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  if (!staff) return null;

  return (
    <div className="min-h-screen bg-[#080e1a] text-white font-sans flex flex-col max-w-md mx-auto relative overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-0 w-48 h-48 bg-orange-600/5 rounded-full blur-2xl" />
      </div>

      {/* Header */}
      <div className="relative z-20 bg-black/60 backdrop-blur-xl border-b border-white/5 px-4 py-4 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500/10 rounded-2xl flex items-center justify-center border border-orange-500/20">
              <Truck size={20} className="text-orange-400" />
            </div>
            <div>
              <p className="font-black text-white text-sm leading-none">{staff.name}</p>
              <p className="text-[10px] text-orange-300/50 font-bold uppercase tracking-widest mt-0.5">Delivery Agent</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold ${isOnline ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
              {isOnline ? <Wifi size={10} /> : <WifiOff size={10} />}
              {isOnline ? 'Online' : 'Offline'}
            </div>
            <button onClick={() => { stopTracking(); sessionStorage.removeItem('delivery_staff'); push('/delivery-login'); }}
              className="p-2 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/20 rounded-xl text-gray-400 hover:text-red-400 transition-all">
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* GPS Toggle */}
        <div className="flex gap-2">
          <button onClick={locationStatus === 'tracking' ? stopTracking : startTracking}
            disabled={orders.length === 0}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all border ${
              locationStatus === 'tracking' ? 'bg-green-500/10 border-green-500/30 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.15)]'
              : locationStatus === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400'
              : 'bg-orange-500/10 border-orange-500/20 text-orange-400 hover:bg-orange-500/20'
            } disabled:opacity-40 disabled:cursor-not-allowed`}>
            <Navigation size={16} className={locationStatus === 'tracking' ? 'animate-pulse' : ''} />
            {locationStatus === 'tracking' ? '🟢 Tracking Live' : locationStatus === 'error' ? 'GPS Error' : 'Start GPS'}
          </button>
          <button onClick={fetchOrders} className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-all active:scale-95">
            <RefreshCw size={16} />
          </button>
        </div>

        {lastLocation && locationStatus === 'tracking' && (
          <p className="text-[10px] text-green-400/50 font-bold mt-2 flex items-center gap-1">
            <MapPin size={9} /> {lastLocation.lat.toFixed(5)}, {lastLocation.lng.toFixed(5)} • Updates every 30s
          </p>
        )}
      </div>

      {/* Orders List */}
      <div className="relative z-10 flex-1 p-4 space-y-3 pb-24">
        <p className="text-[10px] font-black text-orange-300/40 uppercase tracking-widest">
          Assigned Orders ({orders.length})
        </p>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-orange-400 mb-4" />
            <p className="text-orange-300/40 text-sm font-bold">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-orange-500/5 rounded-3xl flex items-center justify-center mb-4 border border-orange-500/10">
              <Package size={36} className="text-orange-400/30" />
            </div>
            <h3 className="text-lg font-black text-white/30 mb-1">No Orders Assigned</h3>
            <p className="text-orange-200/20 text-sm font-medium">Check back soon or contact admin.</p>
          </div>
        ) : (
          orders.map(order => (
            <div key={order.id} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden hover:border-orange-500/20 transition-all">
              <div className="p-4 cursor-pointer" onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-[10px] font-bold text-orange-300/50 uppercase tracking-widest mb-0.5">#{order.id.slice(0,8).toUpperCase()}</p>
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-orange-400" />
                      <span className="font-black text-white text-sm">{order.customer_name || 'Customer'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${getStatusColor(order.status)}`}>{order.status}</span>
                    {expandedOrder === order.id ? <ChevronUp size={16} className="text-orange-300/40" /> : <ChevronDown size={16} className="text-orange-300/40" />}
                  </div>
                </div>
                <div className="flex items-start gap-2 mt-1">
                  <MapPin size={13} className="text-orange-400/60 mt-0.5 shrink-0" />
                  <p className="text-xs text-orange-100/50 font-medium leading-tight line-clamp-2">{order.address || 'No address'}</p>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <a href={`tel:${order.phone}`} onClick={e => e.stopPropagation()}
                    className="flex items-center gap-1.5 text-[10px] font-bold text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/20 active:scale-95 transition-all">
                    <Phone size={10} /> {order.phone || 'N/A'}
                  </a>
                  <span className="font-black text-green-400 text-base">₹{order.total}</span>
                </div>
              </div>

              {expandedOrder === order.id && (
                <div className="border-t border-white/5 p-4 space-y-3">
                  <div>
                    <p className="text-[10px] font-bold text-orange-300/40 uppercase tracking-widest mb-2">Items</p>
                    {order.items?.map((item, i) => (
                      <div key={i} className="flex justify-between items-center py-1">
                        <span className="text-xs text-white/60"><span className="text-orange-400 font-bold">{item.quantity}x</span> {item.name}</span>
                        <span className="text-xs font-bold text-white/40">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-white/30">
                    <Clock size={12} />{new Date(order.created_at).toLocaleString()}
                  </div>
                  {order.address && (
                    <a href={`https://maps.google.com/?q=${encodeURIComponent(order.address)}`} target="_blank" rel="noreferrer"
                      className="flex items-center gap-2 text-xs font-bold text-orange-400 bg-orange-500/10 px-4 py-2.5 rounded-xl border border-orange-500/20 hover:bg-orange-500/15 transition-all active:scale-95">
                      <Navigation size={14} /> Open in Google Maps
                    </a>
                  )}
                  <button onClick={() => { setDeliveryModal(order); setSelectedPayment(''); setPaymentNote(''); }}
                    className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-black font-black py-3 rounded-xl transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(34,197,94,0.3)] text-sm">
                    <CheckCircle size={18} /> Mark as Delivered
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Delivery + Payment Modal */}
      {deliveryModal && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setDeliveryModal(null)} />
          <div className="relative w-full max-w-md bg-[#0f1729] rounded-t-[32px] border border-white/10 p-6 pb-10 shadow-2xl animate-slide-up z-10">
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-5" />

            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-black text-white text-lg">Confirm Delivery</h3>
                <p className="text-orange-300/50 text-xs font-bold mt-0.5">{deliveryModal.customer_name} • ₹{deliveryModal.total}</p>
              </div>
              <button onClick={() => setDeliveryModal(null)} className="p-2 bg-white/5 rounded-xl border border-white/10 text-gray-400 hover:text-white transition-all">
                <X size={18} />
              </button>
            </div>

            <p className="text-[11px] font-black text-white/40 uppercase tracking-widest mb-3">Payment Status</p>

            <div className="space-y-2 mb-4">
              {PAYMENT_OPTIONS.map(opt => (
                <button key={opt.id} onClick={() => setSelectedPayment(opt.id)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border transition-all active:scale-[0.98] ${
                    selectedPayment === opt.id ? `${opt.activeBg} border-transparent text-black` : `${opt.bg} ${opt.border} text-white hover:opacity-80`
                  }`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${selectedPayment === opt.id ? 'bg-black/20' : opt.bg}`}>
                    <opt.icon size={18} className={selectedPayment === opt.id ? 'text-black' : opt.text} />
                  </div>
                  <div className="text-left flex-1">
                    <p className={`font-black text-sm ${selectedPayment === opt.id ? 'text-black' : 'text-white'}`}>{opt.label}</p>
                    <p className={`text-[10px] font-medium ${selectedPayment === opt.id ? 'text-black/60' : 'text-white/30'}`}>{opt.sub}</p>
                  </div>
                  {selectedPayment === opt.id && <Check size={18} className="text-black shrink-0" />}
                </button>
              ))}
            </div>

            <textarea value={paymentNote} onChange={e => setPaymentNote(e.target.value)}
              placeholder="Add a note (optional)..."
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-white/20 font-medium resize-none h-16 outline-none focus:border-orange-500/40 mb-4" />

            <button onClick={handleMarkDelivered} disabled={!selectedPayment || updatingStatus === deliveryModal.id}
              className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-black py-4 rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(34,197,94,0.3)] text-sm">
              {updatingStatus === deliveryModal.id ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
              {updatingStatus === deliveryModal.id ? 'Confirming...' : 'Confirm Delivery & Payment'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
