'use client';
import React from 'react';
import { ShoppingBag, X, Minus, Plus, ArrowRight, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigation } from '../context/NavigationContext';

export const CartDrawer: React.FC = () => {
  const { cart, cartTotal, updateQuantity, removeFromCart, isCartOpen, setIsCartOpen } = useCart();
  const { push } = useNavigation();

  const handleCheckout = () => {
    setIsCartOpen(false);
    push('/order');
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={() => setIsCartOpen(false)}
      />
      
      {/* Drawer */}
      <div className="relative w-full max-w-md bg-[var(--bg-main)] h-full shadow-2xl flex flex-col animate-slide-in">
        {/* Header */}
        <div className="p-5 border-b border-[#E7E5E4] flex justify-between items-center bg-white shadow-sm z-10">
          <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2 font-serif">
            <ShoppingBag className="text-[#064E3B] fill-emerald-50" />
            Your Cart <span className="text-sm font-sans font-normal text-gray-500">({cart.length} items)</span>
          </h2>
          <button onClick={() => setIsCartOpen(false)} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors active:scale-90">
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                 <ShoppingBag size={32} className="opacity-40" />
              </div>
              <div className="text-center">
                  <p className="text-lg font-bold text-gray-600">Your cart is empty</p>
                  <p className="text-sm">Add some seeds or fertilizers to get started.</p>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="px-6 py-3 bg-[#064E3B] text-white rounded-[16px] font-bold shadow-lg hover:scale-105 transition-transform"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex gap-4 bg-white border border-[#E7E5E4] rounded-[20px] p-3 shadow-sm relative overflow-hidden group">
                <img 
                  src={item.image_url || 'https://via.placeholder.com/80'} 
                  alt={item.name} 
                  className="w-24 h-24 object-cover rounded-[16px] bg-gray-100"
                />
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <h4 className="font-bold text-gray-800 line-clamp-1 text-base">{item.name}</h4>
                    <p className="text-xs text-gray-500 font-medium">{item.unit || 'Unit'}</p>
                  </div>
                  
                  <div className="flex justify-between items-end">
                      <p className="text-lg font-black text-[#064E3B]">₹{item.price * item.quantity}</p>
                      
                      <div className="flex items-center gap-3 bg-gray-50 rounded-[12px] p-1 border border-gray-100 shadow-inner">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center bg-white rounded-[8px] shadow-sm text-gray-700 hover:text-red-500 active:scale-90 transition-all border border-gray-100"
                        >
                          {item.quantity === 1 ? <Trash2 size={14} /> : <Minus size={14} />}
                        </button>
                        <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center bg-[#064E3B] rounded-[8px] shadow-sm text-white hover:bg-[#053d2e] active:scale-90 transition-all"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-[#E7E5E4] bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-10">
            <div className="flex justify-between items-center mb-4">
              <div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Total Amount</span>
                  <span className="text-2xl font-black text-[#064E3B]">₹{cartTotal}</span>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-[#064E3B] hover:bg-[#053d2e] text-white font-bold py-4 px-6 rounded-[16px] flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <span>Proceed to Checkout</span>
              <div className="bg-white/20 p-1 rounded-full">
                <ArrowRight size={16} strokeWidth={3} />
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};