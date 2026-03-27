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
    <AppLayout activePage="cart" pageTitle="My Cart">
      <div className="max-w-md mx-auto px-4 pb-24">
        {/* Page Header */}
        <div className="pt-4 pb-2 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-[var(--text-primary)] font-serif tracking-tight">My Cart</h1>
          </div>
          <Link 
            href="/my-orders" 
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-full border border-emerald-500/20 hover:opacity-80 transition-colors active:scale-95"
          >
            <Package size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">History</span>
          </Link>
        </div>

        <div className="animate-fade-in">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4 shadow-inner transition-colors duration-200">
                <ShoppingBag size={32} className="text-emerald-500/20 dark:text-emerald-500/40" />
              </div>
              <h2 className="text-lg font-black text-[var(--text-primary)] font-serif mb-1 transition-colors duration-200">Your cart is empty</h2>
              <p className="text-gray-500 dark:text-gray-400 text-xs mb-6 max-w-[200px] transition-colors duration-200">Looks like you haven't added any products yet.</p>
              
              <div className="flex flex-col w-full gap-2">
                <Link 
                  href="/catalog" 
                  className="bg-[var(--primary-btn)] text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:opacity-90 active:scale-95 transition-all text-center"
                >
                  Start Shopping
                </Link>
              </div>
            </div>
          ) : (
          <div className="space-y-2">
            {cart.map((item) => (
              <div key={item.id} className="bg-[var(--card-bg)] p-3 rounded-xl shadow-sm border border-[var(--border-color)] flex gap-3 items-center transition-colors duration-200">
                <div className="w-16 h-16 bg-[var(--input-bg)] rounded-lg overflow-hidden flex-shrink-0 border border-[var(--border-color)] transition-colors duration-200">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600">
                      <ShoppingBag size={20} />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[var(--text-body)] text-sm truncate">{item.name}</h3>
                  <p className="text-[var(--text-primary)] font-black text-sm">₹{item.price}</p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-[var(--input-bg)] rounded-lg p-0.5 border border-[var(--border-color)] transition-colors duration-200">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-6 h-6 flex items-center justify-center bg-[var(--card-bg)] rounded-md shadow-sm text-gray-600 dark:text-gray-300 hover:text-[var(--text-primary)] active:scale-95 transition-all"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="font-bold text-xs w-4 text-center text-[var(--text-body)]">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-6 h-6 flex items-center justify-center bg-[var(--card-bg)] rounded-md shadow-sm text-gray-600 dark:text-gray-300 hover:text-[var(--text-primary)] active:scale-95 transition-all"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="w-8 h-8 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-500/10 rounded-lg transition-colors"
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
        <div className="fixed bottom-[88px] left-0 right-0 z-40 px-4 pointer-events-none">
          <div className="max-w-md mx-auto bg-[var(--card-bg)] rounded-2xl shadow-[var(--shadow-premium)] border border-[var(--border-color)] p-4 pointer-events-auto transition-colors duration-200">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-500 dark:text-gray-400 font-medium text-sm">Total Amount</span>
              <span className="text-xl font-black text-[var(--text-primary)]">₹{cartTotal.toFixed(2)}</span>
            </div>
            <button 
              onClick={() => push('/order')}
              className="w-full bg-[var(--primary-btn)] text-white py-3.5 rounded-xl font-bold shadow-lg hover:opacity-90 active:scale-95 transition-all flex justify-center items-center gap-2"
            >
              Place Order
            </button>
          </div>
        </div>
      )}
    </AppLayout>
  );
};
