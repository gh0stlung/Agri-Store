import React from 'react';
import { AppLayout } from '../components/AppLayout';
import { useCart } from '../context/CartContext';
import { Minus, Plus, Trash2, ShoppingBag, Package } from 'lucide-react';
import { Link } from '../components/Link';
import { useNavigation } from '../context/NavigationContext';

export const Cart: React.FC = () => {
  const { cart, cartTotal, updateQuantity, removeFromCart } = useCart();
  const { push } = useNavigation();

  return (
    <AppLayout activePage="cart">
      <div className="max-w-md mx-auto pb-32">
        {/* Page Header */}
        <div className="pt-2 pb-3 px-4 flex items-center justify-between">
          <h1 className="text-xl font-black text-[var(--text-primary)] font-serif tracking-tight">My Cart</h1>
          <Link 
            href="/my-orders" 
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-[var(--text-primary)] rounded-full border border-[var(--border-color)] hover:opacity-80 transition-colors active:scale-95"
          >
            <Package size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest">History</span>
          </Link>
        </div>

        <div className="animate-fade-in">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 transition-colors duration-200">
                <ShoppingBag size={24} className="text-gray-400 dark:text-gray-500" />
              </div>
              <h2 className="text-base font-bold text-[var(--text-primary)] mb-1 transition-colors duration-200">Your cart is empty</h2>
              <p className="text-gray-500 dark:text-gray-400 text-xs mb-6 max-w-[200px] transition-colors duration-200">Looks like you haven't added any products yet.</p>
              
              <Link 
                href="/catalog" 
                className="bg-[var(--text-primary)] text-[var(--bg-main)] px-6 py-3 rounded-xl font-bold shadow-sm hover:opacity-90 active:scale-95 transition-all text-center text-sm"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="flex flex-col border-t border-[var(--border-color)]">
              {cart.map((item) => (
                <div key={item.cartItemId || item.id} className="bg-[var(--bg-main)] px-3 py-3 border-b border-[var(--border-color)] flex gap-3 items-start transition-colors duration-200">
                  <div className="w-[65px] h-[65px] bg-[var(--input-bg)] rounded-md overflow-hidden flex-shrink-0 border border-[var(--border-color)] transition-colors duration-200">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600">
                        <ShoppingBag size={16} />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0 flex flex-col">
                    <h3 className="font-bold text-[var(--text-primary)] text-[13px] line-clamp-2 leading-tight">
                      {item.name}
                    </h3>
                    {item.variant_label && (
                      <span className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{item.variant_label}</span>
                    )}
                    
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-emerald-600 dark:text-emerald-400 font-bold text-[14px]">₹{item.price.toFixed(2)}</p>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-[var(--input-bg)] rounded border border-[var(--border-color)] h-7">
                          <button 
                            onClick={() => updateQuantity(item.cartItemId || item.id, item.quantity - 1)}
                            className="w-7 h-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-[var(--text-primary)] active:bg-gray-200 dark:active:bg-gray-700 transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="font-bold text-[12px] w-5 text-center text-[var(--text-body)]">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.cartItemId || item.id, item.quantity + 1)}
                            className="w-7 h-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-[var(--text-primary)] active:bg-gray-200 dark:active:bg-gray-700 transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        
                        <button 
                          onClick={() => removeFromCart(item.cartItemId || item.id)}
                          className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cart Summary Fixed Bottom */}
      {cart.length > 0 && (
        <div className="fixed bottom-[65px] left-0 right-0 z-40 bg-[var(--bg-main)] border-t border-[var(--border-color)] shadow-sm">
          <div className="max-w-md mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-gray-500 dark:text-gray-400 font-medium text-[10px] uppercase tracking-wider">Total</span>
              <span className="text-lg font-black text-[var(--text-primary)] leading-none">₹{cartTotal.toFixed(2)}</span>
            </div>
            <button 
              onClick={() => push('/order')}
              className="flex-1 bg-[var(--text-primary)] text-[var(--bg-main)] py-2.5 rounded-lg font-bold shadow-sm hover:opacity-90 active:scale-95 transition-all flex justify-center items-center gap-2 text-sm"
            >
              Place Order
            </button>
          </div>
        </div>
      )}
    </AppLayout>
  );
};
