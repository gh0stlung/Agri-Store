import React, { useState, useEffect } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  CheckCircle, Loader2, MapPin, User, Phone,
  ShoppingBag, ArrowRight, Tag,
  Edit2, Banknote, Smartphone, ChevronDown, ChevronUp,
  Store, Clock
} from 'lucide-react';
import { Link } from '../components/Link';
import { AppLayout } from '../components/AppLayout';

export const Order: React.FC = () => {
  const { push } = useNavigation();
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();

  const [formData, setFormData] = useState({ name: '', mobile: '', address: '' });
  const [profile, setProfile] = useState<any>(null);
  const [useSavedProfile, setUseSavedProfile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState('');
  const [showItems, setShowItems] = useState(true);
  const [editingDetails, setEditingDetails] = useState(false);

  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);

  useEffect(() => {
    if (cart.length === 0 && !orderComplete) push('/catalog');
  }, [cart, orderComplete, push]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user && supabase) {
        const local = localStorage.getItem(`profile_${user.id}`);
        if (local) {
          try {
            const p = JSON.parse(local);
            if (p.name || p.mobile || p.address) {
              setProfile(p);
              setFormData({ name: p.name || '', mobile: p.mobile || '', address: p.address || '' });
              setUseSavedProfile(true);
            }
          } catch(e) {}
        }
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) {
          setProfile(data);
          setFormData({ name: data.name || '', mobile: data.mobile || '', address: data.address || '' });
          if (data.name || data.mobile || data.address) setUseSavedProfile(true);
          localStorage.setItem(`profile_${user.id}`, JSON.stringify(data));
        }
      }
    };
    fetchProfile();
  }, [user]);

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart || cart.length === 0) return;
    if (!supabase) return;
    setLoading(true);
    try {
      if (!user) { push('/login'); return; }
      const { data: orderData, error } = await supabase.from('orders').insert([{
        user_id: user.id,
        customer_name: formData.name || profile?.name || 'Guest',
        phone: formData.mobile || profile?.mobile || '',
        address: formData.address || profile?.address || '',
        items: cart,
        total: cartTotal,
        status: 'pending'
      }]).select().single();
      if (error) { alert('Order failed: ' + error.message); return; }
      if (orderData) setConfirmedOrderId(orderData.id);
      setOrderComplete(true);
      clearCart();
    } catch (err) {
      alert('Error placing order');
    } finally {
      setLoading(false);
    }
  };

  // ── SUCCESS PAGE ──
  if (orderComplete) {
    return (
      <div className="fixed inset-0 bg-[var(--bg-main)] flex flex-col items-center justify-center p-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 w-full max-w-sm">
          {/* Success animation */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mb-4 border border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
              <CheckCircle size={48} strokeWidth={2} />
            </div>
            <h2 className="text-3xl font-black text-[var(--text-primary)] font-serif text-center mb-1">Order Placed!</h2>
            <p className="text-gray-500 text-sm text-center font-medium">Thank you, {formData.name}! 🎉</p>
          </div>

          {/* Order details card */}
          <div className="bg-[var(--card-bg)] rounded-[24px] border border-[var(--border-color)] shadow-[var(--shadow-premium)] overflow-hidden mb-4">
            <div className="bg-emerald-500/5 px-5 py-4 border-b border-[var(--border-color)]">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Order ID</p>
              <p className="font-mono font-black text-[var(--text-primary)] text-lg">{confirmedOrderId.slice(0,8).toUpperCase()}</p>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <Phone size={14} className="text-blue-500" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Mobile</p>
                  <p className="text-sm font-bold text-[var(--text-primary)]">{formData.mobile}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin size={14} className="text-orange-500" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Delivery To</p>
                  <p className="text-sm font-bold text-[var(--text-primary)] leading-snug">{formData.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                  <Banknote size={14} className="text-emerald-500" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Payment</p>
                  <p className="text-sm font-bold text-[var(--text-primary)]">Pay on Delivery • ₹{cartTotal.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Track + Home buttons */}
          <div className="space-y-2">
            <Link href="/track"
              className="w-full flex items-center justify-center gap-2 bg-[var(--primary-btn)] text-white py-4 rounded-[18px] font-black shadow-lg hover:opacity-90 active:scale-[0.98] transition-all text-sm">
              Track My Order <ArrowRight size={16} />
            </Link>
            <button onClick={() => push('/')}
              className="w-full py-3.5 rounded-[18px] font-bold text-sm text-gray-500 bg-[var(--card-bg)] border border-[var(--border-color)] hover:opacity-80 active:scale-[0.98] transition-all">
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── CHECKOUT PAGE ──
  return (
    <AppLayout activePage="catalog" pageTitle="Checkout">
      <div className="max-w-md mx-auto pb-40 space-y-4">

        {/* STEP 1 — Order Items */}
        <div className="bg-[var(--card-bg)] rounded-[24px] border border-[var(--border-color)] shadow-[var(--shadow-soft)] overflow-hidden">
          {/* Header */}
          <button
            onClick={() => setShowItems(!showItems)}
            className="w-full flex items-center justify-between px-5 py-4 border-b border-[var(--border-color)]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                <ShoppingBag size={14} className="text-emerald-600" />
              </div>
              <div className="text-left">
                <p className="font-black text-[var(--text-primary)] text-sm">Your Items</p>
                <p className="text-[10px] text-gray-400 font-medium">{itemCount} item{itemCount !== 1 ? 's' : ''}</p>
              </div>
            </div>
            {showItems ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
          </button>

          {showItems && (
            <div className="divide-y divide-[var(--border-color)]">
              {cart.map(item => (
                <div key={item.cartItemId || item.id} className="flex gap-3 px-4 py-3">
                  {/* Image */}
                  <div className="w-14 h-14 bg-[var(--input-bg)] rounded-xl overflow-hidden shrink-0 border border-[var(--border-color)]">
                    {item.image_url
                      ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center"><ShoppingBag size={16} className="text-gray-300" /></div>
                    }
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-[var(--text-primary)] text-xs leading-tight line-clamp-2 font-serif">{item.name}</p>
                    {item.variant_label && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded-full mt-0.5">
                        <Tag size={7} />{item.variant_label}
                      </span>
                    )}
                    <div className="flex items-center justify-between mt-1.5">
                      <p className="text-[10px] text-gray-500 font-medium">
                        ₹{item.price} × {item.quantity}
                      </p>
                      <p className="font-black text-[var(--text-secondary)] text-sm">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Total breakdown */}
          <div className="px-5 py-4 bg-[var(--input-bg)] border-t border-[var(--border-color)] space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span className="font-medium">Subtotal</span>
              <span className="font-bold">₹{cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span className="font-medium">Delivery charges</span>
              <span className="font-bold text-green-600 dark:text-green-400">Free</span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-[var(--border-color)]">
              <span className="font-black text-[var(--text-primary)] text-sm">Total</span>
              <span className="font-black text-xl text-[var(--text-primary)]">₹{cartTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* STEP 2 — Delivery Details */}
        <div className="bg-[var(--card-bg)] rounded-[24px] border border-[var(--border-color)] shadow-[var(--shadow-soft)] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-color)]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <MapPin size={14} className="text-blue-500" />
              </div>
              <p className="font-black text-[var(--text-primary)] text-sm">Delivery Details</p>
            </div>
            {useSavedProfile && !editingDetails && (
              <button onClick={() => setEditingDetails(true)}
                className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1.5 rounded-xl border border-emerald-500/20 active:scale-95 transition-all">
                <Edit2 size={10} /> Edit
              </button>
            )}
          </div>

          <div className="p-5">
            {useSavedProfile && !editingDetails ? (
              /* Saved profile display */
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-[var(--input-bg)] rounded-xl border border-[var(--border-color)]">
                  <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center shrink-0">
                    <User size={14} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Name</p>
                    <p className="font-bold text-[var(--text-primary)] text-sm">{formData.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-[var(--input-bg)] rounded-xl border border-[var(--border-color)]">
                  <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center shrink-0">
                    <Phone size={14} className="text-blue-500" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Mobile</p>
                    <p className="font-bold text-[var(--text-primary)] text-sm">{formData.mobile}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-[var(--input-bg)] rounded-xl border border-[var(--border-color)]">
                  <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin size={14} className="text-orange-500" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Address</p>
                    <p className="font-bold text-[var(--text-primary)] text-sm leading-snug">{formData.address}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <CheckCircle size={12} className="text-emerald-500" />
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Using saved profile details</p>
                </div>
              </div>
            ) : (
              /* Input form */
              <form id="order-form" onSubmit={handleOrder} className="space-y-3">
                <div className="relative group">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                    <User size={15} />
                  </div>
                  <input type="text" required value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full pl-10 pr-4 py-3.5 rounded-[14px] border border-[var(--border-color)] focus:ring-2 focus:ring-[var(--primary-btn)] outline-none bg-[var(--input-bg)] font-bold text-[var(--text-body)] text-sm"
                    placeholder="Full Name" />
                </div>
                <div className="relative group">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                    <Phone size={15} />
                  </div>
                  <input type="tel" required value={formData.mobile}
                    onChange={e => setFormData({...formData, mobile: e.target.value})}
                    className="w-full pl-10 pr-4 py-3.5 rounded-[14px] border border-[var(--border-color)] focus:ring-2 focus:ring-[var(--primary-btn)] outline-none bg-[var(--input-bg)] font-bold text-[var(--text-body)] text-sm"
                    placeholder="Mobile Number" />
                </div>
                <div className="relative group">
                  <div className="absolute left-3.5 top-4 text-gray-400">
                    <MapPin size={15} />
                  </div>
                  <textarea required rows={3} value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                    className="w-full pl-10 pr-4 py-3.5 rounded-[14px] border border-[var(--border-color)] focus:ring-2 focus:ring-[var(--primary-btn)] outline-none bg-[var(--input-bg)] font-bold text-[var(--text-body)] text-sm resize-none"
                    placeholder="Full Address (Village, Landmark...)" />
                </div>
                {editingDetails && (
                  <button type="button" onClick={() => setEditingDetails(false)}
                    className="text-xs text-gray-500 font-bold hover:text-[var(--text-primary)] transition-colors">
                    ← Cancel editing
                  </button>
                )}
              </form>
            )}
          </div>
        </div>

        {/* STEP 3 — Payment Info */}
        <div className="bg-[var(--card-bg)] rounded-[24px] border border-[var(--border-color)] shadow-[var(--shadow-soft)] overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-[var(--border-color)]">
            <div className="w-7 h-7 bg-orange-500/10 rounded-lg flex items-center justify-center">
              <Banknote size={14} className="text-orange-500" />
            </div>
            <p className="font-black text-[var(--text-primary)] text-sm">Payment Method</p>
          </div>
          <div className="p-5 space-y-2">
            {/* COD */}
            <div className="flex items-center gap-3 p-3 bg-green-500/5 rounded-xl border border-green-500/15">
              <div className="w-9 h-9 bg-green-500/10 rounded-xl flex items-center justify-center shrink-0">
                <Banknote size={18} className="text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-black text-[var(--text-primary)] text-sm">Cash on Delivery</p>
                <p className="text-[10px] text-gray-400 font-medium">Pay in cash when order arrives</p>
              </div>
              <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle size={10} className="text-white" strokeWidth={3} />
              </div>
            </div>
            {/* Online */}
            <div className="flex items-center gap-3 p-3 bg-blue-500/5 rounded-xl border border-blue-500/15">
              <div className="w-9 h-9 bg-blue-500/10 rounded-xl flex items-center justify-center shrink-0">
                <Smartphone size={18} className="text-blue-500" />
              </div>
              <div className="flex-1">
                <p className="font-black text-[var(--text-primary)] text-sm">Online Transfer</p>
                <p className="text-[10px] text-gray-400 font-medium">UPI / Bank transfer after delivery</p>
              </div>
              <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                <CheckCircle size={10} className="text-white" strokeWidth={3} />
              </div>
            </div>
            <p className="text-[10px] text-gray-400 font-medium pt-1 flex items-start gap-1.5">
              <Clock size={10} className="mt-0.5 shrink-0 text-gray-400" />
              Payment is collected only after your order is successfully delivered.
            </p>
          </div>
        </div>

        {/* Store info */}
        <div className="flex items-center gap-3 p-4 bg-[var(--card-bg)] rounded-[20px] border border-[var(--border-color)] shadow-sm">
          <div className="w-9 h-9 bg-emerald-500/10 rounded-xl flex items-center justify-center shrink-0">
            <Store size={16} className="text-emerald-600" />
          </div>
          <div>
            <p className="font-black text-[var(--text-primary)] text-xs">New Nikhil Khad Bhandar</p>
            <p className="text-[10px] text-gray-400 font-medium">Ganjdundwara • +91 9368340997</p>
          </div>
        </div>

      </div>

      {/* Fixed bottom CTA */}
      <div className="fixed bottom-[65px] left-0 right-0 z-40 px-4 pb-3 pt-2 bg-[var(--bg-main)] border-t border-[var(--border-color)]">
        <div className="max-w-md mx-auto space-y-2">
          <div className="flex justify-between items-center px-1 mb-1">
            <span className="text-xs text-gray-500 font-medium">Total Payable</span>
            <span className="font-black text-[var(--text-primary)] text-lg">₹{cartTotal.toFixed(2)}</span>
          </div>
          <button
            form={useSavedProfile && !editingDetails ? undefined : 'order-form'}
            onClick={useSavedProfile && !editingDetails ? handleOrder : undefined}
            disabled={loading}
            className="w-full bg-[#25D366] hover:bg-[#1ebd52] text-white font-black py-4 rounded-[18px] shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm border-b-4 border-[#128C7E] disabled:opacity-60">
            {loading ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle size={20} fill="white" />}
            {loading ? 'Placing Order...' : 'Confirm Order'}
          </button>
        </div>
      </div>
    </AppLayout>
  );
};
