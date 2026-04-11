import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Truck, MapPin, CheckCircle, Package,
  Navigation, RefreshCw, Clock, Phone,
  Loader2, ChevronDown, ChevronUp, Wifi, WifiOff,
  IndianRupee, Smartphone, AlertTriangle, X, Check,
  Lock, Delete, ShoppingBag
} from 'lucide-react';

import { useNavigation } from '../context/NavigationContext';

const DELIVERY_KEY = 'nnkb_delivery_locked';

interface DeliveryStaff { id: string; name: string; phone: string; pin: string; }
interface OrderItem { name: string; quantity: number; price: number; }
interface AssignedOrder {
  id: string; customer_name: string; phone: string; address: string;
  items: OrderItem[]; total: number; status: string; created_at: string;
  delivery_lat?: number; delivery_lng?: number; delivery_updated_at?: string;
  payment_status?: string;
}

const PAYMENT_OPTIONS = [
  { id: 'cod', label: 'Cash Received', sub: 'Customer paid cash', icon: IndianRupee, active: 'bg-green-500 text-black', inactive: 'bg-green-500/10 border border-green-500/30 text-white' },
  { id: 'online', label: 'Online Payment', sub: 'UPI / Bank transfer', icon: Smartphone, active: 'bg-blue-500 text-black', inactive: 'bg-blue-500/10 border border-blue-500/30 text-white' },
  { id: 'delayed', label: 'Payment Delayed', sub: 'Customer pays later', icon: AlertTriangle, active: 'bg-orange-500 text-black', inactive: 'bg-orange-500/10 border border-orange-500/30 text-white' },
];

export const DeliveryDashboard: React.FC = () => {
  const { replace } = useNavigation();
  const [staff, setStaff] = useState<DeliveryStaff | null>(null);
  const staffRef = useRef<DeliveryStaff | null>(null); // FIX: use ref to avoid stale closure
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

  const [exitPinModal, setExitPinModal] = useState(false);
  const [exitPin, setExitPin] = useState('');
  const [exitError, setExitError] = useState('');
  const [exitShake, setExitShake] = useState(false);

  const watchIdRef = useRef<number | null>(null);
  const ordersRef = useRef<AssignedOrder[]>([]);
  ordersRef.current = orders;

  // ── STEP 1: Load staff ──
  useEffect(() => {
    const stored = localStorage.getItem(DELIVERY_KEY);
    if (!stored) { replace('/delivery-login'); return; }
    try {
      const data = JSON.parse(stored);
      if (!data?.id) { replace('/delivery-login'); return; }
      setStaff(data);
      staffRef.current = data; // FIX: keep ref in sync
    } catch(e) { replace('/delivery-login'); }
  }, [replace]);

  // ── STEP 2: Lock navigation ──
  useEffect(() => {
    window.history.pushState({ delivery: true }, '', '/delivery');
    window.history.pushState({ delivery: true }, '', '/delivery');
    const handlePopState = () => {
      window.history.pushState({ delivery: true }, '', '/delivery');
      setExitPinModal(true);
    };
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault(); e.returnValue = ''; return '';
    };
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // ── STEP 3: Online/offline ──
  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  // ── STEP 4: Fetch orders ──
  const fetchOrders = useCallback(async () => {
    const currentStaff = staffRef.current;
    if (!currentStaff || !supabase) return;
    try {
      const { data, error } = await supabase
        .from('orders').select('*')
        .eq('assigned_to', currentStaff.id)
        .not('status', 'eq', 'delivered')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setOrders(data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { if (staff) fetchOrders(); }, [staff, fetchOrders]);

  // ── STEP 5: GPS ──
  const saveLocation = useCallback(async (lat: number, lng: number) => {
    const currentStaff = staffRef.current;
    if (!supabase || !currentStaff) return;
    try {
      setLastLocation({ lat, lng });
      const activeOrders = ordersRef.current;
      if (activeOrders.length === 0) return;
      const ids = activeOrders.map(o => o.id);
      await supabase.from('orders').update({
        delivery_lat: lat, delivery_lng: lng,
        delivery_updated_at: new Date().toISOString()
      }).in('id', ids);
      for (const order of activeOrders) {
        await supabase.from('delivery_locations').upsert({
          staff_id: currentStaff.id, order_id: order.id,
          lat, lng, updated_at: new Date().toISOString()
        }, { onConflict: 'staff_id,order_id' });
      }
    } catch(err) { console.error('GPS save error:', err); }
  }, []);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) { setLocationStatus('error'); return; }
    setLocationStatus('tracking');
    watchIdRef.current = navigator.geolocation.watchPosition(
      pos => saveLocation(pos.coords.latitude, pos.coords.longitude),
      err => { console.error(err); setLocationStatus('error'); },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
  }, [saveLocation]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setLocationStatus('idle');
  }, []);

  useEffect(() => () => {
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
  }, []);

  // ── STEP 6: Mark delivered ──
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
    } catch(err) { console.error(err); }
    finally { setUpdatingStatus(null); }
  };

  // ── STEP 7: Exit PIN — FIX: use staffRef to avoid stale closure ──
  const handleExitDigit = (d: string) => {
    if (exitPin.length < 6) setExitPin(prev => prev + d);
  };
  const handleExitDelete = () => setExitPin(prev => prev.slice(0, -1));

  const verifyExitPin = useCallback((pinToCheck: string) => {
    const currentStaff = staffRef.current; // FIX: read from ref, not state
    if (!currentStaff) return;
    if (pinToCheck === currentStaff.pin) {
      localStorage.removeItem(DELIVERY_KEY);
      sessionStorage.removeItem('delivery_staff');
      replace('/');
    } else {
      setExitError('Wrong PIN — try again');
      setExitShake(true);
      setTimeout(() => { setExitShake(false); setExitError(''); }, 1000);
      setExitPin('');
    }
  }, [replace]);

  // FIX: auto-verify when PIN length matches staff pin length (works for 4, 5, OR 6 digit PINs)
  useEffect(() => {
    const currentStaff = staffRef.current;
    if (!currentStaff) return;
    if (exitPin.length > 0 && exitPin.length === currentStaff.pin.length) {
      verifyExitPin(exitPin);
    }
    // Also always check at 6 digits as fallback
    if (exitPin.length === 6) verifyExitPin(exitPin);
  }, [exitPin, verifyExitPin]);

  if (!staff) return (
    <div className="fixed inset-0 bg-[#080e1a] flex items-center justify-center">
      <Loader2 size={28} className="animate-spin text-orange-400" />
    </div>
  );

  const exitDigits = ['1','2','3','4','5','6','7','8','9','','0','del'];

  return (
    <div className="fixed inset-0 bg-[#080e1a] text-white flex flex-col overflow-hidden select-none">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-600/4 rounded-full blur-2xl" />
      </div>

      {/* ── HEADER ── */}
      <div className="relative z-20 bg-black/60 backdrop-blur-xl border-b border-white/5 px-4 pt-12 pb-3 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center border border-orange-500/20 shrink-0">
              <Truck size={20} className="text-orange-400" />
            </div>
            <div>
              <p className="font-black text-white text-sm leading-none">{staff.name}</p>
              <p className="text-[9px] text-orange-300/40 font-bold uppercase tracking-widest mt-0.5">Delivery Agent • {staff.phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-bold border ${isOnline ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
              {isOnline ? <Wifi size={9} /> : <WifiOff size={9} />}
              {isOnline ? 'Online' : 'Offline'}
            </div>
            <button
              onClick={() => { setExitPinModal(true); setExitPin(''); setExitError(''); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[10px] font-black active:scale-95 transition-all">
              <Lock size={12} /> Exit
            </button>
          </div>
        </div>

        {/* GPS + Refresh Row */}
        <div className="flex gap-2">
          <button
            onClick={locationStatus === 'tracking' ? stopTracking : startTracking}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-xs transition-all border ${
              locationStatus === 'tracking' ? 'bg-green-500/10 border-green-500/30 text-green-400'
              : locationStatus === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400'
              : 'bg-orange-500/10 border-orange-500/20 text-orange-400'
            }`}>
            <Navigation size={13} className={locationStatus === 'tracking' ? 'animate-pulse' : ''} />
            {locationStatus === 'tracking' ? '🟢 GPS Live' : locationStatus === 'error' ? '⚠️ GPS Error — Retry' : '📍 Start GPS'}
          </button>
          <button onClick={fetchOrders} className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-400 active:scale-95">
            <RefreshCw size={14} />
          </button>
        </div>

        {lastLocation && locationStatus === 'tracking' && (
          <p className="text-[9px] text-green-400/40 font-bold mt-1.5 flex items-center gap-1">
            <MapPin size={8} />{lastLocation.lat.toFixed(5)}, {lastLocation.lng.toFixed(5)} • sending live
          </p>
        )}
      </div>

      {/* ── ORDERS LIST ── */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 py-3 space-y-3 pb-8">
        {/* Stats row */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white/5 border border-white/8 rounded-xl p-3 flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center">
              <Package size={14} className="text-orange-400" />
            </div>
            <div>
              <p className="font-black text-white text-base leading-none">{orders.length}</p>
              <p className="text-[9px] text-white/30 font-bold uppercase tracking-wider">Pending</p>
            </div>
          </div>
          <div className="bg-white/5 border border-white/8 rounded-xl p-3 flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
              <CheckCircle size={14} className="text-green-400" />
            </div>
            <div>
              <p className="font-black text-white text-base leading-none">
                ₹{orders.reduce((s, o) => s + o.total, 0).toLocaleString()}
              </p>
              <p className="text-[9px] text-white/30 font-bold uppercase tracking-wider">Value</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 size={28} className="animate-spin text-orange-400 mb-3" />
            <p className="text-orange-300/30 text-xs font-bold">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 bg-orange-500/5 rounded-3xl flex items-center justify-center mb-4 border border-orange-500/10">
              <ShoppingBag size={32} className="text-orange-400/20" />
            </div>
            <p className="text-white/20 font-black text-base">No Orders Assigned</p>
            <p className="text-orange-200/15 text-xs mt-1 font-medium">Contact admin to assign orders</p>
          </div>
        ) : (
          orders.map(order => (
            <div key={order.id} className="bg-white/5 border border-white/8 rounded-2xl overflow-hidden">
              {/* Order Header */}
              <div className="p-4 cursor-pointer" onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-bold text-orange-300/40 uppercase tracking-widest mb-0.5">
                      #{order.id.slice(0,8).toUpperCase()}
                    </p>
                    <p className="font-black text-white text-base leading-tight">{order.customer_name}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="font-black text-green-400 text-lg">₹{order.total}</span>
                    {expandedOrder === order.id
                      ? <ChevronUp size={16} className="text-white/20" />
                      : <ChevronDown size={16} className="text-white/20" />}
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-2 mb-3 bg-white/3 rounded-xl p-2.5 border border-white/5">
                  <MapPin size={13} className="text-orange-400/60 mt-0.5 shrink-0" />
                  <p className="text-xs text-white/50 leading-relaxed">{order.address}</p>
                </div>

                {/* Phone + Status */}
                <div className="flex items-center justify-between">
                  <a href={`tel:${order.phone}`} onClick={e => e.stopPropagation()}
                    className="flex items-center gap-1.5 text-[11px] font-bold text-blue-400 bg-blue-500/10 px-3 py-2 rounded-xl border border-blue-500/15 active:scale-95">
                    <Phone size={11} /> {order.phone}
                  </a>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wide ${
                    order.status === 'shipped' ? 'text-orange-400 bg-orange-500/10 border-orange-500/20'
                    : order.status === 'confirmed' ? 'text-blue-400 bg-blue-500/10 border-blue-500/20'
                    : 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
                  }`}>{order.status}</span>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedOrder === order.id && (
                <div className="border-t border-white/5 p-4 space-y-3">
                  {/* Items list */}
                  <div className="bg-white/3 rounded-xl p-3 border border-white/5">
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-2">Items Ordered</p>
                    <div className="space-y-1.5">
                      {order.items?.map((item, i) => (
                        <div key={i} className="flex justify-between items-center">
                          <span className="text-xs text-white/60">
                            <span className="text-orange-400 font-bold">{item.quantity}×</span> {item.name}
                          </span>
                          <span className="text-xs font-black text-white/40">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                      <div className="border-t border-white/5 pt-1.5 mt-1.5 flex justify-between">
                        <span className="text-xs font-black text-white/40">Total</span>
                        <span className="text-sm font-black text-green-400">₹{order.total}</span>
                      </div>
                    </div>
                  </div>

                  {/* Time */}
                  <div className="flex items-center gap-1.5 text-[10px] text-white/20">
                    <Clock size={10} />
                    Ordered: {new Date(order.created_at).toLocaleString()}
                  </div>

                  {/* Google Maps */}
                  <a href={`https://maps.google.com/?q=${encodeURIComponent(order.address)}`}
                    target="_blank" rel="noreferrer"
                    className="flex items-center justify-center gap-2 text-sm font-black text-orange-400 bg-orange-500/8 px-4 py-3 rounded-xl border border-orange-500/15 active:scale-95 w-full">
                    <Navigation size={15} /> Open in Google Maps
                  </a>

                  {/* Mark Delivered */}
                  <button
                    onClick={() => { setDeliveryModal(order); setSelectedPayment(''); setPaymentNote(''); }}
                    className="w-full flex items-center justify-center gap-2 bg-green-500 text-black font-black py-3.5 rounded-xl active:scale-[0.98] shadow-[0_0_20px_rgba(34,197,94,0.2)] text-sm">
                    <CheckCircle size={18} /> Mark as Delivered
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* ── PAYMENT MODAL ── */}
      {deliveryModal && (
        <div className="fixed inset-0 z-[100] flex items-end">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setDeliveryModal(null)} />
          <div className="relative w-full bg-[#0f1729] rounded-t-[32px] border-t border-white/10 px-5 pt-5 pb-10 z-10 max-h-[90vh] overflow-y-auto">
            <div className="w-10 h-1 bg-white/15 rounded-full mx-auto mb-5" />

            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-black text-white text-lg">Confirm Delivery</h3>
                <p className="text-white/30 text-sm font-bold mt-0.5">
                  {deliveryModal.customer_name} • <span className="text-green-400">₹{deliveryModal.total}</span>
                </p>
              </div>
              <button onClick={() => setDeliveryModal(null)}
                className="p-2 bg-white/5 rounded-xl border border-white/10 text-gray-400 active:scale-95">
                <X size={18} />
              </button>
            </div>

            {/* Order summary in modal */}
            <div className="bg-white/5 rounded-xl p-3 border border-white/8 mb-4">
              <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-2">Order Summary</p>
              {deliveryModal.items?.slice(0, 3).map((item, i) => (
                <p key={i} className="text-xs text-white/50 leading-relaxed">
                  <span className="text-orange-400 font-bold">{item.quantity}×</span> {item.name}
                </p>
              ))}
              {(deliveryModal.items?.length || 0) > 3 && (
                <p className="text-[10px] text-white/30 mt-1">+{(deliveryModal.items?.length || 0) - 3} more items</p>
              )}
            </div>

            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-3">Payment Received?</p>

            <div className="space-y-2 mb-4">
              {PAYMENT_OPTIONS.map(opt => (
                <button key={opt.id} onClick={() => setSelectedPayment(opt.id)}
                  className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all active:scale-[0.98] ${selectedPayment === opt.id ? opt.active : opt.inactive}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${selectedPayment === opt.id ? 'bg-black/20' : 'bg-white/10'}`}>
                    <opt.icon size={18} />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-black text-base">{opt.label}</p>
                    <p className={`text-xs ${selectedPayment === opt.id ? 'opacity-60' : 'opacity-40'}`}>{opt.sub}</p>
                  </div>
                  {selectedPayment === opt.id && (
                    <div className="w-6 h-6 rounded-full bg-black/20 flex items-center justify-center shrink-0">
                      <Check size={14} />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <textarea value={paymentNote} onChange={e => setPaymentNote(e.target.value)}
              placeholder="Add a note (optional)..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder-white/20 resize-none h-16 outline-none focus:border-orange-500/30 mb-4" />

            <button onClick={handleMarkDelivered}
              disabled={!selectedPayment || !!updatingStatus}
              className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-40 text-black font-black py-4 rounded-2xl active:scale-[0.98] flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(34,197,94,0.3)] text-base">
              {updatingStatus ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={20} />}
              {updatingStatus ? 'Confirming...' : 'Confirm Delivery & Payment'}
            </button>
          </div>
        </div>
      )}

      {/* ── EXIT PIN MODAL ── */}
      {exitPinModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-lg">
          <div className="w-full max-w-[300px] px-5 flex flex-col items-center gap-5">

            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.15)]">
              <Lock size={28} className="text-red-400" />
            </div>

            <div className="text-center">
              <h3 className="font-black text-white text-xl">Exit Dashboard</h3>
              <p className="text-white/30 text-xs font-medium mt-1">Enter your PIN to unlock & exit</p>
            </div>

            {/* PIN dots */}
            <div className={`flex gap-3 ${exitShake ? 'animate-[shake_0.4s_ease]' : ''}`}>
              {Array.from({ length: staffRef.current?.pin?.length || 6 }).map((_, i) => (
                <div key={i} className={`w-11 h-11 rounded-xl border-2 flex items-center justify-center transition-all duration-150 ${
                  i < exitPin.length
                    ? 'bg-red-500 border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.5)]'
                    : 'bg-white/5 border-white/10'
                }`}>
                  {i < exitPin.length && <div className="w-3 h-3 bg-white rounded-full" />}
                </div>
              ))}
            </div>

            {exitError && (
              <p className="text-red-400 text-xs font-bold bg-red-500/10 px-5 py-2.5 rounded-full border border-red-500/20">
                {exitError}
              </p>
            )}

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-3 w-full">
              {exitDigits.map((d, i) => {
                if (d === '') return <div key={i} />;
                if (d === 'del') return (
                  <button key={i} onClick={handleExitDelete}
                    className="h-14 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center text-red-300 active:scale-95 transition-all">
                    <Delete size={18} />
                  </button>
                );
                return (
                  <button key={i} onClick={() => handleExitDigit(d)}
                    className="h-14 rounded-2xl bg-white/5 border border-white/8 text-white font-black text-xl hover:bg-red-500/10 hover:border-red-500/20 active:scale-95 transition-all">
                    {d}
                  </button>
                );
              })}
            </div>

            {/* Manual confirm for shorter PINs */}
            {exitPin.length >= 4 && exitPin.length < 6 && exitPin.length !== (staffRef.current?.pin?.length || 6) && (
              <button onClick={() => verifyExitPin(exitPin)}
                className="w-full bg-red-500/20 border border-red-500/30 text-red-300 font-black py-3 rounded-2xl active:scale-[0.98] text-sm">
                Confirm Exit
              </button>
            )}

            <button onClick={() => { setExitPinModal(false); setExitPin(''); setExitError(''); }}
              className="text-white/20 text-xs font-bold hover:text-white/40 transition-colors py-1">
              Cancel — Stay on Dashboard
            </button>
          </div>

          <style>{`
            @keyframes shake {
              0%,100%{transform:translateX(0)}
              25%{transform:translateX(-10px)}
              75%{transform:translateX(10px)}
            }
          `}</style>
        </div>
      )}
    </div>
  );
};
