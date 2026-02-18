import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { ProductCard } from '../components/ProductCard';
import { AppLayout } from '../components/AppLayout';
import { useCart } from '../context/CartContext';
import { Product } from '../types';
import { Search, Filter, RefreshCw, X, ShoppingBag, AlertCircle } from 'lucide-react';

export const Catalog: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const { addToCart } = useCart();

  // Updated Category Images - High Quality & Relevant
  const CATEGORIES = [
    { 
        name: 'All', 
        label: 'View All', 
        image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=400&q=80',
        color: 'from-gray-900/90 via-gray-900/40 to-transparent'
    },
    { 
        name: 'Seeds', 
        label: 'Seeds', 
        // Updated to a better seeds image (hands holding seeds)
        image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=400&q=80', 
        color: 'from-emerald-900/90 via-emerald-900/40 to-transparent'
    },
    { 
        name: 'Fertilizer', 
        label: 'Fertilizers', 
        image: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&w=400&q=80', 
        color: 'from-amber-900/90 via-amber-900/40 to-transparent'
    },
    { 
        name: 'Pesticides', 
        label: 'Pesticides', 
        // Updated to a better pesticides image
        image: 'https://plus.unsplash.com/premium_photo-1661962692059-55d5a4319814?auto=format&fit=crop&w=400&q=80', 
        color: 'from-rose-900/90 via-rose-900/40 to-transparent'
    },
    { 
        name: 'Tools', 
        label: 'Farming Tools', 
        image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=400&q=80', 
        color: 'from-slate-900/90 via-slate-900/40 to-transparent'
    },
    { 
        name: 'Offers', 
        label: 'Super Offers', 
        image: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=400&q=80', 
        color: 'from-indigo-900/90 via-indigo-900/40 to-transparent'
    },
  ];

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    
    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = products.filter(p => {
    const pCat = p.category ? p.category.toLowerCase().trim() : '';
    const fCat = filter.toLowerCase().trim();
    const pName = p.name ? p.name.toLowerCase() : '';
    const sTerm = searchTerm.toLowerCase();
    
    const matchesSearch = pName.includes(sTerm);
    
    if (filter === 'All') return matchesSearch;
    const matchesCategory = pCat.includes(fCat) || fCat.includes(pCat);
    return matchesCategory && matchesSearch;
  });

  return (
    <AppLayout activePage="catalog" pageTitle="Store Catalog">
        
        {/* STICKY SEARCH BAR */}
        <div className="sticky top-0 z-40 bg-[#F5F5F0]/95 backdrop-blur-xl pt-2 pb-2 -mx-4 px-4 transition-all border-b border-[#064E3B]/10">
            <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#064E3B] transition-colors" size={20} />
                <input 
                    type="text" 
                    placeholder="Search seeds, fertilizer..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-[#E7E5E4] rounded-2xl py-3.5 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-[#064E3B] focus:border-transparent shadow-sm text-sm font-bold text-gray-800 placeholder-gray-400 transition-all"
                />
                {searchTerm && (
                    <button 
                        onClick={() => setSearchTerm('')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>
        </div>

        {/* CATEGORY SLIDER (Horizontal Scroll) */}
        {!searchTerm && (
            <div className="mb-8 animate-fade-in-up">
                <div className="flex justify-between items-end mb-4 px-1">
                    <h3 className="text-lg font-black text-[#064E3B] font-serif tracking-tight">Browse Categories</h3>
                    {filter !== 'All' && (
                        <button onClick={() => setFilter('All')} className="text-[10px] font-bold text-gray-500 hover:text-[#064E3B] flex items-center gap-1 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm transition-all active:scale-95">
                            View All <RefreshCw size={10} />
                        </button>
                    )}
                </div>
                
                <div className="flex overflow-x-auto gap-4 pb-6 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory">
                    {CATEGORIES.map((cat, idx) => {
                        const isActive = filter === cat.name;
                        return (
                            <button
                                key={cat.name}
                                onClick={() => setFilter(isActive ? 'All' : cat.name)}
                                className={`relative flex-shrink-0 w-32 h-40 rounded-[24px] overflow-hidden transition-all duration-300 group snap-start shadow-md active:scale-90 ${
                                    isActive 
                                    ? 'ring-4 ring-[#064E3B] scale-[0.95]' 
                                    : 'hover:scale-[1.02] hover:shadow-xl'
                                }`}
                                style={{ animationDelay: `${idx * 50}ms` }}
                            >
                                {/* Image */}
                                <img 
                                    src={cat.image} 
                                    className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} 
                                    alt={cat.label}
                                    loading="lazy" 
                                />
                                
                                {/* Gradient Overlay */}
                                <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'}`}></div>
                                
                                {/* Content */}
                                <div className="absolute inset-x-0 bottom-0 p-4 text-white z-10 flex flex-col items-center justify-end h-full">
                                    <span className={`text-sm font-bold text-center leading-tight drop-shadow-lg tracking-wide ${isActive ? 'text-white' : 'text-white/90'}`}>
                                        {cat.label}
                                    </span>
                                    
                                    {isActive && (
                                        <div className="w-8 h-1 bg-white/50 rounded-full mt-2 backdrop-blur-sm animate-pulse"></div>
                                    )}
                                </div>
                                
                                {/* Active Badge (Optional, subtle) */}
                                {isActive && (
                                    <div className="absolute top-3 right-3 w-2 h-2 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)] animate-pulse"></div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        )}

        {/* FILTER STATUS */}
        {filter !== 'All' && (
            <div className="flex items-center gap-2 mb-4 animate-fade-in px-1">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Showing:</span>
                <span className="px-3 py-1 bg-[#064E3B] text-white text-xs font-bold rounded-full shadow-md flex items-center gap-1.5 transition-all hover:bg-[#053d2e] active:scale-95 cursor-pointer" onClick={() => setFilter('All')}>
                    {filter}
                    <X size={12} className="opacity-80" />
                </span>
            </div>
        )}

        {/* PRODUCTS GRID */}
        {loading ? (
           <div className="grid grid-cols-2 gap-4 pb-32 px-1">
             {[1,2,3,4,5,6].map(i => (
               <div key={i} className="h-64 rounded-[24px] bg-white border border-gray-100 animate-pulse shadow-sm"></div>
             ))}
           </div>
        ) : !supabase ? (
           <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in bg-white rounded-[24px] border border-red-100 p-8 shadow-sm mx-1">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle className="text-red-400" size={28} />
                </div>
                <h3 className="text-lg font-bold text-gray-800">Connection Error</h3>
                <p className="text-xs text-gray-500 mt-2 max-w-[200px] font-medium mx-auto">
                    Please check your internet connection or database configuration.
                </p>
           </div>
        ) : (
            <div className="grid grid-cols-2 gap-4 pb-32 min-h-[300px] content-start px-1">
                {filteredProducts.map((product, index) => (
                    <div key={product.id} style={{ animationDelay: `${index * 50}ms` }} className="animate-fade-in-up">
                        <ProductCard product={product} onAdd={addToCart} />
                    </div>
                ))}
                
                {filteredProducts.length === 0 && (
                    <div className="col-span-2 flex flex-col items-center justify-center py-16 text-center animate-fade-in">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 shadow-inner">
                            <ShoppingBag className="text-gray-400" size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">No items found</h3>
                        <p className="text-xs text-gray-500 mt-1 max-w-[200px] font-medium mx-auto">
                            Try searching for something else or change the category filter.
                        </p>
                        <button 
                            onClick={() => {setFilter('All'); setSearchTerm('');}} 
                            className="mt-4 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-xs shadow-sm hover:bg-gray-50 active:scale-95 transition-all"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>
        )}
    </AppLayout>
  );
};