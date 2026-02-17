import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { ProductCard } from '../components/ProductCard';
import { AppLayout } from '../components/AppLayout';
import { useCart } from '../context/CartContext';
import { Product } from '../types';
import { Search, Filter, RefreshCw, X, Sprout, Droplets, Bug, Wrench, Gift, Package, AlertCircle } from 'lucide-react';

export const Catalog: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const { addToCart } = useCart();

  // Updated Category Images
  const CATEGORIES = [
    { 
        name: 'All', 
        label: 'All Items', 
        image: 'https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?auto=format&fit=crop&w=600&q=80', 
        icon: Package 
    },
    { 
        name: 'Seeds', 
        label: 'Seeds', 
        image: 'https://images.unsplash.com/photo-1593105544559-ecb03bf71f60?auto=format&fit=crop&w=600&q=80', 
        icon: Sprout 
    },
    { 
        name: 'Fertilizer', 
        label: 'Fertilizers', 
        image: 'https://images.unsplash.com/photo-1632125944720-630e6103635d?auto=format&fit=crop&w=600&q=80', 
        icon: Droplets 
    },
    { 
        name: 'Pesticides', 
        label: 'Pesticides', 
        image: 'https://images.unsplash.com/photo-1587334204557-22f3ce63905a?auto=format&fit=crop&w=600&q=80', 
        icon: Bug 
    },
    { 
        name: 'Tools', 
        label: 'Tools', 
        image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=600&q=80', 
        icon: Wrench 
    },
    { 
        name: 'Offers', 
        label: 'Offers', 
        image: 'https://images.unsplash.com/photo-1556740714-a8395b3bf30f?auto=format&fit=crop&w=600&q=80', 
        icon: Gift 
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
        .eq('is_active', true) // Only fetch active products
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
    const onFocus = () => fetchProducts();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [fetchProducts]);

  // Robust Filter Logic
  const filteredProducts = products.filter(p => {
    // Safety check for null values
    const pCat = p.category ? p.category.toLowerCase().trim() : '';
    const fCat = filter.toLowerCase().trim();
    
    const pName = p.name ? p.name.toLowerCase() : '';
    const sTerm = searchTerm.toLowerCase();
    
    const matchesSearch = pName.includes(sTerm);
    
    if (filter === 'All') return matchesSearch;
    
    // Check if category includes the filter word
    const matchesCategory = pCat.includes(fCat) || fCat.includes(pCat);
    return matchesCategory && matchesSearch;
  });

  return (
    <AppLayout activePage="catalog">
        
        {/* STICKY SEARCH BAR */}
        <div className="sticky top-0 z-40 bg-[#FFFCF0]/95 backdrop-blur-xl pt-2 pb-4 -mx-4 px-4 transition-all border-b border-[#064E3B]/5 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#064E3B] transition-colors" size={22} />
                <input 
                    type="text" 
                    placeholder="Search beej, urea, dawai..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-[#E7E5E4] rounded-full py-4 pl-14 pr-12 focus:outline-none focus:ring-2 focus:ring-[#064E3B] focus:border-transparent shadow-md text-base font-bold text-gray-800 placeholder-gray-400 transition-all"
                />
                {searchTerm && (
                    <button 
                        onClick={() => setSearchTerm('')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>
        </div>

        {/* CATEGORY GRID */}
        {!searchTerm && (
            <div className="mb-8 animate-fade-in-up">
                <div className="flex justify-between items-center mb-4 px-1">
                    <h3 className="text-lg font-black text-[#064E3B] font-serif">Categories</h3>
                    {filter !== 'All' && (
                        <button onClick={() => setFilter('All')} className="text-xs font-bold text-gray-500 hover:text-[#064E3B] flex items-center gap-1">
                            Reset <RefreshCw size={10} />
                        </button>
                    )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    {CATEGORIES.map((cat, idx) => {
                        const isActive = filter === cat.name;
                        return (
                            <button
                                key={cat.name}
                                onClick={() => setFilter(isActive ? 'All' : cat.name)}
                                className={`relative h-24 rounded-[20px] overflow-hidden transition-all duration-300 group shadow-sm ${isActive ? 'ring-4 ring-[#064E3B] ring-offset-2 scale-[0.98] brightness-90' : 'hover:scale-[1.02] hover:shadow-lg'}`}
                                style={{ animationDelay: `${idx * 50}ms` }}
                            >
                                {/* Background Image */}
                                <div className="absolute inset-0 bg-gray-200">
                                    <img 
                                        src={cat.image} 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                        alt={cat.label}
                                        loading="lazy" 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                    <div className={`absolute inset-0 bg-[#064E3B]/40 transition-opacity duration-300 ${isActive ? 'opacity-60' : 'opacity-0'}`}></div>
                                </div>
                                
                                {/* Label & Icon */}
                                <div className="relative z-10 h-full flex flex-col items-center justify-center p-2 text-white">
                                    <cat.icon size={20} className="mb-1 opacity-90 drop-shadow-md" />
                                    <span className="font-bold text-sm text-center leading-tight drop-shadow-md tracking-wide">
                                        {cat.label}
                                    </span>
                                </div>
                                
                                {/* Active Indicator */}
                                {isActive && (
                                    <div className="absolute top-2 right-2 w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-sm"></div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        )}

        {/* FILTER STATUS */}
        {filter !== 'All' && (
            <div className="flex items-center gap-2 mb-4 animate-fade-in">
                <span className="text-sm font-bold text-gray-400">Showing:</span>
                <span className="px-3 py-1 bg-[#064E3B] text-white text-xs font-bold rounded-full shadow-sm flex items-center gap-1">
                    {filter}
                    <button onClick={() => setFilter('All')}><X size={12} /></button>
                </span>
            </div>
        )}

        {/* PRODUCTS GRID */}
        {loading ? (
           <div className="grid grid-cols-2 gap-4 pb-32">
             {[1,2,3,4,5,6].map(i => (
               <div key={i} className="h-64 rounded-2xl bg-white border border-gray-100 animate-pulse shadow-sm"></div>
             ))}
           </div>
        ) : !supabase ? (
           <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-5 border border-red-100">
                    <AlertCircle className="text-red-400" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Connection Error</h3>
                <p className="text-sm text-gray-500 mt-2 max-w-[220px] font-medium">
                    Store is currently offline or misconfigured. Please contact support.
                </p>
           </div>
        ) : (
            <div className="grid grid-cols-2 gap-4 pb-32 min-h-[300px] content-start">
                {filteredProducts.map((product, index) => (
                    <div key={product.id} style={{ animationDelay: `${index * 50}ms` }} className="animate-fade-in-up">
                        <ProductCard product={product} onAdd={addToCart} />
                    </div>
                ))}
                
                {filteredProducts.length === 0 && (
                    <div className="col-span-2 flex flex-col items-center justify-center py-20 text-center animate-fade-in">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-5 border border-gray-200">
                            <Filter className="text-gray-300" size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">No products found</h3>
                        <p className="text-sm text-gray-500 mt-2 max-w-[220px] font-medium">
                            We couldn't find any items in <span className="text-[#064E3B]">{filter}</span>.
                        </p>
                        <button 
                            onClick={() => {setFilter('All'); setSearchTerm('');}} 
                            className="mt-6 px-6 py-3 bg-[#064E3B] text-white rounded-xl font-bold text-sm shadow-lg hover:bg-[#065E4B] active:scale-95 transition-all"
                        >
                            View All Products
                        </button>
                    </div>
                )}
            </div>
        )}
    </AppLayout>
  );
};