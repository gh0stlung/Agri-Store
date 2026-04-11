import React from 'react';
import { AppLayout } from '../components/AppLayout';
import { useCart } from '../context/CartContext';
import { Minus, Plus, Trash2, ShoppingBag, Package, ArrowRight, Tag, AlertCircle } from 'lucide-react';
import { Link } from '../components/Link';
import { useNavigation } from '../context/NavigationContext';

export const Cart: React.FC = () => {
  const { cart, cartTotal, updateQuantity, removeFromCart } = useCart();
  const { push } = useNavigation();

  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <AppLayout activePage="cart">
      <div className="max-w-md mx-auto pb-40">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-black text-[var(--text-primary)] font-serif tracking-tight">My Cart</h1>
            {cart.length > 0 && (
              <p className="text-xs text-gray-500 font-medium mt-0.5">{itemCount} item{itemCount !== 1 ? 's' : ''} in your cart</p>
            )}
          </div>
          <Link href="/my-orders"
            className="flex items-center gap-1.5 px-3 py-2 bg-[var(--card-bg)] text-[var(--text-primary)] rounded-xl border border-[var(--border-color)] hover:opacity-80 transition-all active:scale-95 shadow-sm">
            <Package size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">History</span>
          </Link>
        </div>

        {cart.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 bg-[var(--card-bg)] rounded-3xl flex items-center justify-center mb-5 shadow-[var(--shadow-soft)] border border-[var(--border-color)]">
              <ShoppingBag size={36} className="text-gray-300 dark:text-gray-600" />
            </div>
            <h2 className="text-lg font-black text-[var(--text-primary)] mb-1 font-serif">Cart is Empty</h2>
            <p className="text-gray-500 text-sm mb-6 max-w-[200px] font-medium">Add some products to get started</p>
            <Link href="/catalog"
              className="flex items-center gap-2 bg-[var(--primary-btn)] text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:opacity-90 active:scale-95 transition-all text-sm">
              Browse Products <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Cart Items */}
            {cart.map((item) => (
              <div key={item.cartItemId || item.id}
                className="bg-[var(--card-bg)] rounded-[20px] border border-[var(--border-color)] shadow-[var(--shadow-soft)] overflow-hidden transition-all hover:shadow-md">
                <div className="flex gap-3 p-3">
                  {/* Product Image */}
                  <div className="w-20 h-20 bg-[var(--input-bg)] rounded-[14px] overflow-hidden flex-shrink-0 border border-[var(--border-color)]">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag size={20} className="text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h3 className="font-black text-[var(--text-primary)] text-sm leading-tight line-clamp-2 font-serif">
                        {item.name}
                      </h3>
                      {item.variant_label && (
                        <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <Tag size={8} /> {item.variant_label}
                        </span>
                      )}
                      {/* Price per unit */}
                      <p className="text-[11px] text-gray-400 font-medium mt-1">
                        ₹{item.price} per {item.unit || 'unit'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Subtotal */}
                      <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Subtotal</p>
                        <p className="font-black text-[var(--text-secondary)] text-base leading-none">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-2">
                        {/* Qty control */}
                        <div className="flex items-center bg-[var(--input-bg)] rounded-xl border border-[var(--border-color)] overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.cartItemId || item.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center text-[var(--text-primary)] hover:bg-[var(--border-color)] transition-colors active:scale-90">
                            <Minus size={12} strokeWidth={3} />
                          </button>
                          <span className="font-black text-sm w-7 text-center text-[var(--text-primary)]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.cartItemId || item.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center text-[var(--text-primary)] hover:bg-[var(--border-color)] transition-colors active:scale-90">
                            <Plus size={12} strokeWidth={3} />
                          </button>
                        </div>

                        {/* Delete */}
                        <button
                          onClick={() => removeFromCart(item.cartItemId || item.id)}
                          className="w-8 h-8 flex items-center justify-center bg-red-500/10 text-red-500 rounded-xl border border-red-500/20 hover:bg-red-500/20 transition-all active:scale-90">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Low stock warning */}
                {item.stock > 0 && item.stock < 10 && (
                  <div className="flex items-center gap-1.5 px-3 py-2 bg-orange-500/5 border-t border-orange-500/10">
                    <AlertCircle size={11} className="text-orange-500 shrink-0" />
                    <p className="text-[10px] font-bold text-orange-600 dark:text-orange-400">
                      Only {item.stock} left in stock — order soon!
                    </p>
                  </div>
                )}
              </div>
            ))}

            {/* Order Summary Card */}
            <div className="bg-[var(--card-bg)] rounded-[20px] border border-[var(--border-color)] shadow-[var(--shadow-soft)] p-4 mt-2">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">Subtotal ({itemCount} items)</span>
                  <span className="font-bold text-[var(--text-body)]">₹{cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">Delivery</span>
                  <span className="font-bold text-green-600 dark:text-green-400">Free</span>
                </div>
                <div className="h-px bg-[var(--border-color)] my-1" />
                <div className="flex justify-between items-center">
                  <span className="font-black text-[var(--text-primary)] text-sm">Total Payable</span>
                  <span className="font-black text-xl text-[var(--text-primary)]">₹{cartTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Info note */}
            <div className="flex items-start gap-2 px-1">
              <AlertCircle size={12} className="text-gray-400 mt-0.5 shrink-0" />
              <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
                Payment is collected at delivery. You can pay cash to the delivery agent or online after receiving.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-[65px] left-0 right-0 z-40 px-4 pb-3 pt-2 bg-[var(--bg-main)] border-t border-[var(--border-color)]">
          <div className="max-w-md mx-auto">
            <button
              onClick={() => push('/order')}
              className="w-full bg-[var(--primary-btn)] text-white py-4 rounded-[18px] font-black shadow-xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-between px-6 text-sm">
              <span>Place Order</span>
              <div className="flex items-center gap-2">
                <span className="font-black text-base">₹{cartTotal.toFixed(2)}</span>
                <ArrowRight size={18} strokeWidth={3} />
              </div>
            </button>
          </div>
        </div>
      )}
    </AppLayout>
  );
};
