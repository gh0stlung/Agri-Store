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
      <div className="max-w-md mx-auto px-4 pb-32">
        {/* Page Header */}
        <div className="pt-2 pb-4 flex items-center justify-between">
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
            <div className="flex flex-col items-center justify-center py-12 text-center">
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
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="bg-[var(--card-bg)] p-3 rounded-xl shadow-sm border border-[var(--border-color)] flex gap-3 items-center transition-colors duration-200">
                  <div className="w-14 h-14 bg-[var(--input-bg)] rounded-lg overflow-hidden flex-shrink-0 border border-[var(--border-color)] transition-colors duration-200">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600">
                        <ShoppingBag size={16} />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h3 className="font-medium text-[var(--text-body)] text-sm truncate">{item.name}</h3>
                    <p className="text-emerald-600 dark:text-emerald-400 font-bold text-sm mt-0.5">₹{item.price}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 bg-[var(--input-bg)] rounded-lg p-1 border border-[var(--border-color)] transition-colors duration-200">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center bg-[var(--card-bg)] rounded shadow-sm text-gray-600 dark:text-gray-300 hover:text-[var(--text-primary)] active:scale-95 transition-all"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="font-bold text-xs w-3 text-center text-[var(--text-body)]">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center bg-[var(--card-bg)] rounded shadow-sm text-gray-600 dark:text-gray-300 hover:text-[var(--text-primary)] active:scale-95 transition-all"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cart Summary Fixed Bottom */}
      {cart.length > 0 && (
        <div className="fixed bottom-[65px] left-0 right-0 z-40 px-4 pb-4 pt-4 bg-gradient-to-t from-[var(--bg-main)] via-[var(--bg-main)] to-transparent pointer-events-none">
          <div className="max-w-md mx-auto bg-[var(--card-bg)] rounded-2xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)] border border-[var(--border-color)] p-4 pointer-events-auto transition-colors duration-200">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-500 dark:text-gray-400 font-medium text-sm">Total Amount</span>
              <span className="text-xl font-black text-[var(--text-primary)]">₹{cartTotal.toFixed(2)}</span>
            </div>
            <button 
              onClick={() => push('/order')}
              className="w-full bg-[var(--text-primary)] text-[var(--bg-main)] py-3.5 rounded-xl font-bold shadow-lg hover:opacity-90 active:scale-95 transition-all flex justify-center items-center gap-2"
            >
              Place Order
            </button>
          </div>
        </div>
      )}
    </AppLayout>
  );
};
