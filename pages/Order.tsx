import React, { useState } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { useCart } from '../context/CartContext';
import { supabase } from '../services/supabase';
import { ArrowLeft, CheckCircle, Loader2, MessageCircle, MapPin, User, Phone, Package, ShoppingBag } from 'lucide-react';
import { Link } from '../components/Link';

export const Order: React.FC = () => {
  const { push, back } = useNavigation();
  const { cart, cartTotal, clearCart } = useCart();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState('');

  // Redirect if cart is empty and not completed
  React.useEffect(() => {
    if (cart.length === 0 && !orderComplete) {
      push('/catalog');
    }
  }, [cart, orderComplete, push]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const orderData = {
      customer_name: formData.name,
      phone: formData.phone,
      address: formData.address,
      items: cart,
      total_price: cartTotal,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    try {
      let orderId = 'ORD-' + Math.floor(1000 + Math.random() * 9000);

      if (supabase) {
        const { data, error } = await supabase
            .from('orders')
            .insert([orderData])
            .select()
            .single();
        if (error) throw error;
        if (data) orderId = data.id.slice(0, 8);
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      setConfirmedOrderId(orderId);

      const itemList = cart.map((item, i) => 
        `${i + 1}. ${item.name} (${item.quantity} ${item.unit || 'unit'})`
      ).join('\n');

      const message = `*New Order: ${orderId}*\n------------------\n*Customer:* ${formData.name}\n*Mobile:* ${formData.phone}\n*Address:* ${formData.address}\n\n*Items Ordered:*\n${itemList}\n\n*Total Amount:* ₹${cartTotal}\n------------------\nPlease confirm delivery.`;

      const whatsappUrl = `https://wa.me/919368340997?text=${encodeURIComponent(message)}`;
      
      // We open WhatsApp in a new tab/window so the user stays on the success screen
      window.open(whatsappUrl, '_blank');

      setOrderComplete(true);
      clearCart();

    } catch (err) {
      console.error("Order submission failed:", err);
      alert("Order failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] flex flex-col items-center justify-center p-6 text-center animate-fade-in relative overflow-hidden">
        {/* Confetti / Decoration Background */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <div className="absolute top-10 left-10 text-emerald-200 opacity-20"><ShoppingBag size={64} /></div>
            <div className="absolute bottom-20 right-10 text-emerald-200 opacity-20"><Package size={80} /></div>
        </div>

        <div className="bg-white p-8 rounded-[32px] shadow-2xl border border-emerald-100 max-w-sm w-full relative z-10">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6 mx-auto shadow-inner">
            <CheckCircle size={48} strokeWidth={3} />
            </div>
            <h2 className="text-2xl font-black text-[var(--text-primary)] font-serif mb-2">Order Placed!</h2>
            <p className="text-[#78350F] mb-6 font-medium text-sm">Thank you, {formData.name}.<br/>WhatsApp has been opened with your order.</p>
            
            <div className="bg-emerald-50 rounded-xl p-4 mb-6 border border-emerald-100">
                <p className="text-xs font-bold text-emerald-800 uppercase tracking-wide mb-1">Track Your Order</p>
                <p className="text-[10px] text-emerald-600 leading-relaxed">
                    You can track your order status anytime using your mobile number <strong>{formData.phone}</strong>.
                </p>
                <Link href="/track" className="mt-3 block bg-white text-emerald-700 text-xs font-bold py-2 rounded-lg shadow-sm border border-emerald-100 hover:bg-emerald-50 transition-colors">
                    Track Order Now
                </Link>
            </div>
            
            <button 
                onClick={() => push('/')}
                className="bg-[#064E3B] text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:bg-[#065E4B] hover:shadow-xl active:scale-95 transition-all w-full"
            >
                Back to Home
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)]">
      {/* Header */}
      <div className="p-4 flex items-center gap-3 border-b border-[#E7E5E4] bg-white sticky top-0 z-40 shadow-sm">
        <button onClick={() => back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:scale-90 transition-transform">
          <ArrowLeft size={20} className="text-[#064E3B]" />
        </button>
        <div className="flex-1">
            <h1 className="text-lg font-bold text-[var(--text-primary)] font-serif leading-none">Checkout</h1>
            <p className="text-[10px] text-gray-500 font-bold">Step 1 of 1</p>
        </div>
      </div>

      <div className="max-w-md mx-auto p-5 pb-32">
        {/* Order Summary Card */}
        <div className="bg-white rounded-[24px] shadow-sm border border-[#E7E5E4] p-5 mb-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#064E3B]"></div>
          <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-[#064E3B] flex items-center gap-2">
                  <ShoppingBag size={16} /> Order Summary
              </h3>
              <span className="text-xs font-bold text-gray-400">{cart.length} items</span>
          </div>
          
          <div className="space-y-3 mb-5 max-h-40 overflow-y-auto pr-1 scrollbar-hide">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-sm py-1 border-b border-dashed border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                    <span className="font-bold text-[#064E3B] bg-emerald-50 w-6 h-6 flex items-center justify-center rounded-[6px] text-xs shadow-sm">{item.quantity}</span>
                    <div className="flex flex-col">
                        <span className="text-gray-800 font-bold line-clamp-1">{item.name}</span>
                        <span className="text-[10px] text-gray-400">{item.unit || 'unit'}</span>
                    </div>
                </div>
                <span className="font-bold text-gray-900">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
          
          <div className="bg-gray-50 rounded-[16px] p-3 flex justify-between items-center border border-gray-100">
            <span className="font-bold text-gray-600 text-sm">Total Payable</span>
            <span className="text-xl font-black text-[#064E3B]">₹{cartTotal}</span>
          </div>
        </div>

        {/* Details Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-sm font-bold text-[#78350F] uppercase tracking-wider mb-2 ml-1">Delivery Details</h3>
            
            <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#064E3B] transition-colors" size={20} />
                <input 
                    type="text" 
                    required 
                    className="w-full pl-12 pr-4 py-4 rounded-[16px] border border-[#E7E5E4] focus:ring-2 focus:ring-[#064E3B] outline-none bg-white font-bold text-gray-800 shadow-sm transition-all"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                />
            </div>
            
            <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#064E3B] transition-colors" size={20} />
                <input 
                    type="tel" 
                    required 
                    className="w-full pl-12 pr-4 py-4 rounded-[16px] border border-[#E7E5E4] focus:ring-2 focus:ring-[#064E3B] outline-none bg-white font-bold text-gray-800 shadow-sm transition-all"
                    placeholder="Mobile Number"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                />
            </div>
            
            <div className="relative group">
                <MapPin className="absolute left-4 top-4 text-gray-400 group-focus-within:text-[#064E3B] transition-colors" size={20} />
                <textarea 
                    required 
                    rows={3}
                    className="w-full pl-12 pr-4 py-4 rounded-[16px] border border-[#E7E5E4] focus:ring-2 focus:ring-[#064E3B] outline-none bg-white font-bold text-gray-800 shadow-sm transition-all resize-none"
                    placeholder="Full Address (Village, Landmark...)"
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                />
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#25D366] hover:bg-[#1ebd52] text-white font-bold py-4 rounded-[16px] shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-6 border-b-4 border-[#128C7E]"
            >
                {loading ? <Loader2 className="animate-spin" /> : <MessageCircle size={24} fill="white" />}
                {loading ? 'Processing...' : 'Confirm & WhatsApp'}
            </button>
            <p className="text-center text-[10px] text-gray-400 mt-3 font-medium flex items-center justify-center gap-1">
                <CheckCircle size={10} /> Secure checkout via WhatsApp
            </p>
        </form>
      </div>
    </div>
  );
};