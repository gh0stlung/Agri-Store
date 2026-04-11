import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigation } from '../context/NavigationContext';
import {
  Truck, MapPin, CheckCircle, LogOut, Package,
  Navigation, RefreshCw, Clock, Phone,
  Loader2, ChevronDown, ChevronUp, Wifi, WifiOff,
  IndianRupee, Smartphone, AlertTriangle, X, Check
} from 'lucide-react';

interface DeliveryStaff { id: string; name: string; phone: string; }
interface OrderItem { name: string; quantity: number; price: number; }
interface AssignedOrder {
  id: string; customer_name: string; phone: string; address: string;
  items: OrderItem[]; total: number; status: string; created_at: string;
  delivery_lat?: number; delivery_lng?: number; delivery_updated_at?: string;
  payment_status?: string; payment_method?: string;
}

const PAYMENT_OPTIONS = [
  { id: 'cod', label: 'Cash Received', sub: 'Customer paid cash', icon: IndianRupee, active: 'bg-green-500 text-black', inactive: 'bg-green-500/10 border border-green-500/30 text-white' },
  { id: 'online', label: 'Online Payment', sub: 'UPI / Bank transfer', icon: Smartphone, active: 'bg-blue-500 text-black', inactive: 'bg-blue-500/10 border border-blue-500/30 text-white' },
  { id: 'delayed', label: 'Payment Delayed', sub: 'Customer pays later', icon: AlertTriangle, active: 'bg-orange-500 text-black', inactive: 'bg-orange-500/10 border border-orange-500/30 text-white' },
];

export const DeliveryDashboard: React.FC = () => {
  const { push } = useNavigation();
  const [staff, setStaff] = useState<DeliveryStaff | null>(null);
  const [orders, setOrders] = useState<AssignedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationStatus, setLocationStatus] = useState<'idle'|'tracking'|'error'>('idle');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [lastLocation, setLastLocation] = useState<{lat:number;lng:number} | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [deliveryModal, setDeliveryModal] = useState<AssignedOrder | null>(null);
  const [selectedPayment, setSelectedPayment] = useState('');
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
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  const fetchOrders = useCallback(async () => {
    if (!staff || !supabase) return;
    try {
      const { data, error } = await supabase
        .from('orders').select('*')
        .eq('assigned_to', staff.id)
        .not('status', 'eq', 'delivered')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setOrders(data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [staff]);

  useEffect(() => { if (staff) fetchOrders(); }, [staff, fetchOrders]);

  const watchIdRef = useRef<number | null>(null);

  const saveLocationToSupabase = useCallback(async (lat: number, lng: number, staffId: string) => {
    if (!supabase) return;
    try {
      const activeOrders = ordersRef.current;
      setLastLocation({ lat, lng });

      if (activeOrders.length > 0) {
        const orderIds = activeOrders.map(o => o.id);
        await supabase.from('orders').update({
          delivery_lat: lat,
          delivery_lng: lng,
          delivery_updated_at: new Date().toISOString()
        }).in('id', orderIds);

        for (const order of activeOrders) {
          await supabase.from('delivery_locations').upsert({
            staff_id: staffId,
            order_id: order.id,
            lat,
            lng,
            updated_at: new Date().toISOString()
          }, { onConflict: 'staff_id,order_id' });
        }
      }
    } catch (err) { console.error('Save location error:', err); }
  }, []);

  const startTracking = useCallback(() => {
    if (!staff || !navigator.geolocation) {
      setLocationStatus('error');
      return;
    }
    setLocationStatus('tracking');

    // Use watchPosition for accurate continuous tracking — works in PWA
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        saveLocationToSupabase(lat, lng, staff.id);
      },
      (err) => {
        console.error('GPS watch error:', err);
        setLocationStatus('error');
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0  // Always get fresh position
      }
    );
  }, [staff, saveLocationToSupabase]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (locationInterval.current) {
      clearInterval(locationInterval.current);
      locationInterval.current = null;
    }
    setLocationStatus('idle');
  }, []);

  // Cleanup on unmount
  useEffect(() => () => {
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    if (locationInterval.current) clearInterval(locationInterval.current);
  }, []);

  const handleMarkDelivered = async () => {
    if (!supabase || !deliveryModal || !selectedPayment) return;
    setUpdatingStatus(deliveryModal.id);
    try {
      await supabase.from('orders').update({
        status: 'delivered',
        payment_status: selectedPayment === 'cod' ? 'paid_cash' : selectedPayment === 'online' ? 'paid_online' : 'delayed',
        payment_method: selectedPayment,
        payment_note: paymentNote || null,
        delivered_at: new Date().toISOString()
      }).eq('id', deliveryModal.id);
      setOrders(prev => prev.filter(o => o.id !== deliveryModal.id));
      setDeliveryModal(null);
      setSelectedPayment('');
      setPaymentNote('');
    } catch (err) { console.error(err); }
    finally { setUpdatingStatus(null); }
  };

  if (!staff) return null;

  return (
    <div className="fixed inset-0 bg-[#080e1a] text-white flex flex-col overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-orange-600/5 rounded-full blur-2xl" />
      </div>

      {/* HEADER - fixed height */}
      <div className="relative z-20 bg-black/60 backdrop-blur-xl border-b border-white/5 px-4 pt-12 pb-3 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-orange-500/10 rounded-xl flex items-center justify-center border border-orange-500/20 shrink-0">
              <Truck size={18} className="text-orange-400" />
            </div>
            <div>
              <p className="font-black text-white text-sm leading-none">{staff.name}</p>
              <p className="text-[9px] text-orange-300/40 font-bold uppercase tracking-widest">Delivery Agent</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-bold border ${isOnline ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
              {isOnline ? <Wifi size={9} /> : <WifiOff size={9} />}
              {isOnline ? 'Online' : 'Offline'}
            </div>
            <button onClick={() => { stopTracking(); sessionStorage.removeItem('delivery_staff'); push('/delivery-login'); }}
              className="p-2 bg-white/5 hover:bg-red-500/10 border border-white/10 rounded-xl text-gray-400 hover:text-red-400 transition-all">
              <LogOut size={15} />
            </button>
          </div>
        </div>

        {/* GPS Row */}
        <div className="flex gap-2">
          <button onClick={locationStatus === 'tracking' ? stopTracking : startTracking}
            disabled={orders.length === 0}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-xs transition-all border ${
              locationStatus === 'tracking' ? 'bg-green-500/10 border-green-500/30 text-green-400'
              : locationStatus === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400'
              : 'bg-orange-500/10 border-orange-500/20 text-orange-400'
            } disabled:opacity-40`}>
            <Navigation size={13} className={locationStatus === 'tracking' ? 'animate-pulse' : ''} />
            {locationStatus === 'tracking' ? '🟢 Tracking Live' : locationStatus === 'error' ? 'GPS Error — Retry' : 'Start GPS Tracking'}
          </button>
          <button onClick={fetchOrders} className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-400 active:scale-95">
            <RefreshCw size={14} />
          </button>
        </div>
        {lastLocation && locationStatus === 'tracking' && (
          <p className="text-[9px] text-green-400/40 font-bold mt-1.5 flex items-center gap-1">
            <MapPin size={8} />{lastLocation.lat.toFixed(5)}, {lastLocation.lng.toFixed(5)} • every 30s
          </p>
        )}
      </div>

      {/* SCROLLABLE ORDERS */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 py-3 space-y-3">
        <p className="text-[9px] font-black text-orange-300/30 uppercase tracking-widest">
          Orders ({orders.length})
        </p>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 size={28} className="animate-spin text-orange-400 mb-3" />
            <p className="text-orange-300/30 text-xs font-bold">Loading...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-orange-500/5 rounded-2xl flex items-center justify-center mb-3 border border-orange-500/10">
              <Package size={28} className="text-orange-400/20" />
            </div>
            <p className="text-white/20 font-black text-base">No Orders</p>
            <p className="text-orange-200/15 text-xs mt-1">Check back soon</p>
          </div>
        ) : (
          orders.map(order => (
            <div key={order.id} className="bg-white/5 border border-white/8 rounded-2xl overflow-hidden">
              {/* Order Header - always visible */}
              <div className="p-3.5 cursor-pointer" onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-[9px] font-bold text-orange-300/40 uppercase tracking-widest">#{order.id.slice(0,8).toUpperCase()}</p>
                    <p className="font-black text-white text-sm">{order.customer_name}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-green-400 text-sm">₹{order.total}</span>
                    {expandedOrder === order.id ? <ChevronUp size={14} className="text-white/20" /> : <ChevronDown size={14} className="text-white/20" />}
                  </div>
                </div>
                <div className="flex items-start gap-1.5">
                  <MapPin size={11} className="text-orange-400/50 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-white/40 leading-tight line-clamp-1">{order.address}</p>
                </div>
                <div className="flex items-center justify-between mt-2.5">
                  <a href={`tel:${order.phone}`} onClick={e => e.stopPropagation()}
                    className="flex items-center gap-1 text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1.5 rounded-full border border-blue-500/15 active:scale-95">
                    <Phone size={9} />{order.phone}
                  </a>
                  <span className="text-[9px] font-bold text-orange-400/50 uppercase border border-orange-500/15 px-2 py-0.5 rounded-full">{order.status}</span>
                </div>
              </div>

              {/* Expanded */}
              {expandedOrder === order.id && (
                <div className="border-t border-white/5 p-3.5 space-y-3">
                  {order.items?.map((item, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="text-xs text-white/50"><span className="text-orange-400 font-bold">{item.quantity}×</span> {item.name}</span>
                      <span className="text-xs text-white/30 font-bold">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-1.5 text-[10px] text-white/20">
                    <Clock size={10} />{new Date(order.created_at).toLocaleString()}
                  </div>
                  <a href={`https://maps.google.com/?q=${encodeURIComponent(order.address)}`} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 text-xs font-bold text-orange-400 bg-orange-500/8 px-3 py-2.5 rounded-xl border border-orange-500/15 active:scale-95">
                    <Navigation size={13} /> Open in Google Maps
                  </a>
                  <button onClick={() => { setDeliveryModal(order); setSelectedPayment(''); setPaymentNote(''); }}
                    className="w-full flex items-center justify-center gap-2 bg-green-500 text-black font-black py-3 rounded-xl active:scale-[0.98] shadow-[0_0_15px_rgba(34,197,94,0.25)] text-sm">
                    <CheckCircle size={16} /> Mark as Delivered
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* DELIVERY + PAYMENT MODAL */}
      {deliveryModal && (
        <div className="fixed inset-0 z-[100] flex items-end">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setDeliveryModal(null)} />
          <div className="relative w-full bg-[#0f1729] rounded-t-[28px] border-t border-white/10 px-5 pt-5 pb-10 z-10 max-h-[85vh] overflow-y-auto">
            <div className="w-8 h-1 bg-white/15 rounded-full mx-auto mb-4" />
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-black text-white text-base">Confirm Delivery</h3>
                <p className="text-orange-300/40 text-xs mt-0.5">{deliveryModal.customer_name} • ₹{deliveryModal.total}</p>
              </div>
              <button onClick={() => setDeliveryModal(null)} className="p-2 bg-white/5 rounded-xl border border-white/10 text-gray-400">
                <X size={16} />
              </button>
            </div>

            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Payment Method</p>
            <div className="space-y-2 mb-3">
              {PAYMENT_OPTIONS.map(opt => (
                <button key={opt.id} onClick={() => setSelectedPayment(opt.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all active:scale-[0.98] ${selectedPayment === opt.id ? opt.active : opt.inactive}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${selectedPayment === opt.id ? 'bg-black/20' : 'bg-white/10'}`}>
                    <opt.icon size={16} />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-black text-sm">{opt.label}</p>
                    <p className={`text-[10px] ${selectedPayment === opt.id ? 'opacity-60' : 'opacity-40'}`}>{opt.sub}</p>
                  </div>
                  {selectedPayment === opt.id && <Check size={16} className="shrink-0" />}
                </button>
              ))}
            </div>

            <textarea value={paymentNote} onChange={e => setPaymentNote(e.target.value)}
              placeholder="Note (optional)..."
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-white/20 resize-none h-14 outline-none mb-3" />

            <button onClick={handleMarkDelivered} disabled={!selectedPayment || !!updatingStatus}
              className="w-full bg-green-500 disabled:opacity-40 text-black font-black py-3.5 rounded-xl active:scale-[0.98] flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(34,197,94,0.25)]">
              {updatingStatus ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
              {updatingStatus ? 'Confirming...' : 'Confirm Delivery'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
