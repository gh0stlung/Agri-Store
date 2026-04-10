import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigation } from '../context/NavigationContext';
import {
  Truck, MapPin, CheckCircle, LogOut, Package,
  Navigation, RefreshCw, Clock, Phone, User,
  AlertTriangle, Loader2, ChevronDown, ChevronUp,
  Wifi, WifiOff
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
}

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
  const locationInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auth check
  useEffect(() => {
    const stored = sessionStorage.getItem('delivery_staff');
    if (!stored) {
      push('/delivery-login');
      return;
    }
    setStaff(JSON.parse(stored));
  }, []);

  // Online status
  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
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

  useEffect(() => {
    if (staff) fetchOrders();
  }, [staff, fetchOrders]);

  // GPS location tracking
  const updateLocation = useCallback(async (staffId: string) => {
    if (!supabase || !navigator.geolocation) return;

    return new Promise<void>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude: lat, longitude: lng } = pos.coords;
          setLastLocation({ lat, lng });

          // Update all active assigned orders with new location
          try {
            const activeOrderIds = orders.map(o => o.id);
            if (activeOrderIds.length > 0) {
              await supabase
                .from('orders')
                .update({
                  delivery_lat: lat,
                  delivery_lng: lng,
                  delivery_updated_at: new Date().toISOString()
                })
                .in('id', activeOrderIds);
            }

            // Upsert into delivery_locations for each active order
            for (const orderId of activeOrderIds) {
              await supabase
                .from('delivery_locations')
                .upsert({
                  staff_id: staffId,
                  order_id: orderId,
                  lat,
                  lng,
                  updated_at: new Date().toISOString()
                }, { onConflict: 'staff_id,order_id' });
            }
          } catch (err) {
            console.error('Location update error:', err);
          }
          resolve();
        },
        (err) => {
          console.error('GPS error:', err);
          setLocationStatus('error');
          resolve();
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
      );
    });
  }, [orders]);

  const startTracking = useCallback(() => {
    if (!staff) return;
    setLocationStatus('tracking');
    updateLocation(staff.id);
    locationInterval.current = setInterval(() => {
      updateLocation(staff.id);
    }, 30000); // every 30 seconds
  }, [staff, updateLocation]);

  const stopTracking = useCallback(() => {
    if (locationInterval.current) {
      clearInterval(locationInterval.current);
      locationInterval.current = null;
    }
    setLocationStatus('idle');
  }, []);

  useEffect(() => {
    return () => {
      if (locationInterval.current) clearInterval(locationInterval.current);
    };
  }, []);

  const handleMarkDelivered = async (orderId: string) => {
    if (!supabase) return;
    setUpdatingStatus(orderId);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'delivered' })
        .eq('id', orderId);

      if (error) throw error;
      setOrders(prev => prev.filter(o => o.id !== orderId));
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleLogout = () => {
    stopTracking();
    sessionStorage.removeItem('delivery_staff');
    push('/delivery-login');
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
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-0 w-48 h-48 bg-orange-600/5 rounded-full blur-2xl" />
      </div>

      {/* Header */}
      <div className="relative z-20 bg-black/40 backdrop-blur-xl border-b border-white/5 px-4 py-4">
        <div className="flex items-center justify-between">
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
            {/* Online indicator */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold ${isOnline ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
              {isOnline ? <Wifi size={10} /> : <WifiOff size={10} />}
              {isOnline ? 'Online' : 'Offline'}
            </div>
            <button
              onClick={handleLogout}
              className="p-2 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/20 rounded-xl text-gray-400 hover:text-red-400 transition-all"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* GPS Tracking Toggle */}
        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={locationStatus === 'tracking' ? stopTracking : startTracking}
            disabled={orders.length === 0}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all border ${
              locationStatus === 'tracking'
                ? 'bg-green-500/10 border-green-500/30 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.15)]'
                : locationStatus === 'error'
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : 'bg-orange-500/10 border-orange-500/20 text-orange-400 hover:bg-orange-500/20'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <Navigation
              size={16}
              className={locationStatus === 'tracking' ? 'animate-pulse' : ''}
            />
            {locationStatus === 'tracking'
              ? 'Tracking Live'
              : locationStatus === 'error'
              ? 'GPS Error'
              : 'Start GPS Tracking'}
          </button>

          <button
            onClick={fetchOrders}
            className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-all active:scale-95"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Last location */}
        {lastLocation && locationStatus === 'tracking' && (
          <p className="text-[10px] text-green-400/60 font-bold mt-2 flex items-center gap-1">
            <MapPin size={9} />
            Last: {lastLocation.lat.toFixed(5)}, {lastLocation.lng.toFixed(5)}
          </p>
        )}
      </div>

      {/* Orders */}
      <div className="relative z-10 flex-1 p-4 space-y-3 pb-24">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-black text-orange-300/60 uppercase tracking-widest">
            Assigned Orders ({orders.length})
          </h2>
        </div>

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
          orders.map((order) => (
            <div
              key={order.id}
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden hover:border-orange-500/20 transition-all"
            >
              {/* Order Header */}
              <div
                className="p-4 cursor-pointer"
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-[10px] font-bold text-orange-300/50 uppercase tracking-widest mb-0.5">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-orange-400" />
                      <span className="font-black text-white text-sm">{order.customer_name || 'Customer'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    {expandedOrder === order.id ? <ChevronUp size={16} className="text-orange-300/40" /> : <ChevronDown size={16} className="text-orange-300/40" />}
                  </div>
                </div>

                <div className="flex items-start gap-2 mt-1">
                  <MapPin size={13} className="text-orange-400/60 mt-0.5 shrink-0" />
                  <p className="text-xs text-orange-100/50 font-medium leading-tight line-clamp-2">{order.address || 'No address'}</p>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <a
                    href={`tel:${order.phone}`}
                    onClick={e => e.stopPropagation()}
                    className="flex items-center gap-1.5 text-[10px] font-bold text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/20 active:scale-95 transition-all"
                  >
                    <Phone size={10} /> {order.phone || 'N/A'}
                  </a>
                  <span className="font-black text-green-400 text-base">₹{order.total}</span>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedOrder === order.id && (
                <div className="border-t border-white/5 p-4 space-y-4 animate-fade-in">
                  {/* Items */}
                  <div>
                    <p className="text-[10px] font-bold text-orange-300/40 uppercase tracking-widest mb-2">Items</p>
                    <div className="space-y-1.5">
                      {order.items?.map((item, i) => (
                        <div key={i} className="flex justify-between items-center">
                          <span className="text-xs text-white/60 font-medium">
                            <span className="text-orange-400 font-bold">{item.quantity}x</span> {item.name}
                          </span>
                          <span className="text-xs font-bold text-white/40">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-2 text-[11px] text-white/30 font-medium">
                    <Clock size={12} />
                    {new Date(order.created_at).toLocaleString()}
                  </div>

                  {/* Maps Link */}
                  {order.address && (
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(order.address)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-xs font-bold text-orange-400 bg-orange-500/10 px-4 py-2.5 rounded-xl border border-orange-500/20 hover:bg-orange-500/15 transition-all active:scale-95"
                    >
                      <Navigation size={14} /> Open in Google Maps
                    </a>
                  )}

                  {/* Mark Delivered */}
                  <button
                    onClick={() => handleMarkDelivered(order.id)}
                    disabled={updatingStatus === order.id}
                    className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-black font-black py-3 rounded-xl transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(34,197,94,0.3)] disabled:opacity-50 text-sm"
                  >
                    {updatingStatus === order.id
                      ? <Loader2 size={18} className="animate-spin" />
                      : <CheckCircle size={18} />
                    }
                    {updatingStatus === order.id ? 'Updating...' : 'Mark as Delivered'}
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Bottom Safety Area */}
      <div className="h-8 bg-transparent" />
    </div>
  );
};
