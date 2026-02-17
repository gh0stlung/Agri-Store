import React, { useState } from 'react';
import { ShoppingBag, X, Minus, Plus, MessageCircle, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { supabase } from '../services/supabase.ts';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { cart, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = async () => {
    if (cart.length === 0 || isProcessing) return;
    setIsProcessing(true);

    // 1. Construct WhatsApp Message (Prepare first)
    const itemsList = cart
      .map((item) => `- ${item.name} (${item.quantity} x ₹${item.price})`)
      .join('\n');
    
    const message = `Hi, I want to place an order:\n\n${itemsList}\n\n*Total: ₹${cartTotal}*\n\nPlease confirm my order.`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/919368340997?text=${encodedMessage}`;

    try {
      // 2. Try to Save Order to Supabase
      // Sanitize data
      const cleanItems = cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        category: item.category
      }));

      // NOTE: This might fail if RLS (Row Level Security) is on and Anon key doesn't have INSERT permission.
      // We catch error so user can still checkout via WhatsApp.
      const { error } = await supabase.from('orders').insert([
        {
          items: cleanItems,
          total_price: cartTotal,
          created_at: new Date().toISOString(),
        }
      ]);

      if (error) {
        console.warn('Order save failed (Continuing to WhatsApp):', error.message);
      } else {
        console.log('Order saved to database');
      }

    } catch (err) {
      console.error('Checkout unexpected error:', err);
    } finally {
      // 3. Always open WhatsApp, even if database save fails
      window.open(whatsappUrl, '_blank');
      
      // 4. Cleanup
      clearCart();
      setIsProcessing(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-fade-in">
        <div className="p-4 border-b flex justify-between items-center bg-emerald-50">
          <h2 className="text-lg font-bold text-emerald-900 flex items-center gap-2">
            <ShoppingBag className="text-emerald-600" />
            Your Cart
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-emerald-100 rounded-full transition-colors">
            <X size={20} className="text-emerald-700" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <ShoppingBag size={48} className="mb-2 opacity-20" />
              <p>Your cart is empty</p>
              <button 
                onClick={onClose}
                className="mt-4 text-emerald-600 font-medium hover:underline"
              >
                Browse Catalog
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex gap-3 bg-white border border-gray-100 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow">
                <img 
                  src={item.image_url || 'https://via.placeholder.com/80'} 
                  alt={item.name} 
                  className="w-20 h-20 object-cover rounded-lg bg-gray-100"
                />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-800 line-clamp-1">{item.name}</h4>
                    <p className="text-emerald-600 font-bold">₹{item.price * item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-3 bg-gray-50 self-start rounded-lg p-1">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-gray-600 active:scale-95 transition-transform"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-gray-600 active:scale-95 transition-transform"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="text-gray-300 hover:text-red-500 self-start p-1 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-4 border-t bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">Total Amount</span>
              <span className="text-2xl font-black text-gray-900">₹{cartTotal}</span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={isProcessing}
              className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <MessageCircle size={20} fill="white" />
                  Order via WhatsApp
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};