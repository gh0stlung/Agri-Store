import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { ProductCard } from '../components/ProductCard';
import { AppLayout } from '../components/AppLayout';
import { useCart } from '../context/CartContext';
import { Product } from '../types';
import { Search, RefreshCw, X, ShoppingBag } from 'lucide-react';

// Sub-component for individual category items to handle image loading state independently
interface CategoryItemProps {
  cat: {
    name: string;
    label: string;
    image: string;
    color: string;
  };
  isActive: boolean;
  onClick: () => void;
}

const CategoryItem: React.FC<CategoryItemProps> = ({ cat, isActive, onClick }) => {
    return (
        <div 
            onClick={onClick}
            className={`w-[110px] aspect-square rounded-xl overflow-hidden relative flex-shrink-0 cursor-pointer transition-all duration-200 ${
                isActive ? 'border-2 border-[#16a34a]' : 'shadow-sm'
            }`}
        >
            <img 
                src={cat.image} 
                className="w-full h-full object-cover" 
                alt={cat.label}
            />
            
            <div className="absolute bottom-0 w-full text-center text-white text-xs bg-black/40 py-1 backdrop-blur-sm">
                {cat.label}
            </div>
        </div>
    );
};

export const Catalog: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
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
    setFetchError(false);
    
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
      setFetchError(true);
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
        <div className="space-y-[12px]">
            {/* STICKY SEARCH BAR */}
            <div className="w-full px-3 mt-2">
                <div className="flex items-center bg-white border border-[#E7E5E4] rounded-xl px-2 shadow-sm">
                    <Search className="text-gray-400" size={14} />
                    <input 
                        type="text" 
                        placeholder="Search seeds, fertilizer..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-[36px] py-0 pl-2 focus:outline-none text-[13px] font-bold text-gray-800 placeholder-gray-400"
                    />
                    {searchTerm && (
                        <button 
                            onClick={() => setSearchTerm('')}
                            className="p-1 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"
                        >
                            <X size={12} />
                        </button>
                    )}
                </div>
            </div>

            {/* CATEGORY SLIDER (Horizontal Scroll) */}
            {!searchTerm && (
                <div className="mb-[12px]">
                    <div className="flex justify-between items-end mb-[8px] px-1">
                        <h3 className="text-sm font-black text-[#064E3B] font-serif tracking-tight">Categories</h3>
                        {filter !== 'All' && (
                            <button onClick={() => setFilter('All')} className="text-[11px] font-bold text-gray-500 hover:text-[#064E3B] flex items-center gap-1 bg-white px-2 py-0.5 rounded-full border border-gray-200 shadow-sm transition-all active:scale-95">
                                View All <RefreshCw size={10} />
                            </button>
                        )}
                    </div>
                    
                    {/* Scroll Container */}
                    <div className="flex gap-3 px-3 mt-3 overflow-x-auto no-scrollbar" style={{ WebkitOverflowScrolling: "touch" }}>
                        {CATEGORIES.map((cat) => (
                            <CategoryItem 
                                key={cat.name} 
                                cat={cat} 
                                isActive={filter === cat.name} 
                                onClick={() => setFilter(filter === cat.name ? 'All' : cat.name)} 
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* FILTER STATUS */}
            {filter !== 'All' && (
                <div className="flex items-center gap-2 mb-2 px-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Showing:</span>
                    <span className="px-2.5 py-1 bg-[#064E3B] text-white text-[10px] font-bold rounded-full shadow-md flex items-center gap-1 transition-all hover:bg-[#053d2e] active:scale-95 cursor-pointer" onClick={() => setFilter('All')}>
                        {filter}
                        <X size={10} className="opacity-80" />
                    </span>
                </div>
            )}

            {/* PRODUCTS GRID */}
            {loading ? (
               <div className="px-3 mt-4 w-full">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#064E3B] mb-6 mx-auto"></div>
                 <div className="grid grid-cols-2 gap-[8px] w-full">
                   {[1,2,3,4,5,6].map(i => (
                     <div key={i} className="h-[110px] rounded-[12px] bg-white border border-gray-100 animate-pulse shadow-sm"></div>
                   ))}
                 </div>
               </div>
            ) : (!supabase || fetchError) ? (
               <div className="px-3 mt-4 w-full">
                 <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-[12px] border border-emerald-100 p-6 shadow-sm">
                    <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mb-3">
                        <RefreshCw className="text-emerald-400 animate-spin-slow" size={20} />
                    </div>
                    <h3 className="text-sm font-bold text-gray-800">Products will load soon</h3>
                    <p className="text-[11px] text-gray-500 mt-1 max-w-[200px] font-medium mx-auto">
                        We're preparing the latest stock for you. Please wait a moment.
                    </p>
                    {fetchError && (
                        <button 
                            onClick={fetchProducts}
                            className="mt-4 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg font-bold text-xs hover:bg-emerald-100 transition-colors"
                        >
                            Refresh
                        </button>
                    )}
                 </div>
               </div>
            ) : (
                <div className="px-3 mt-4 w-full grid grid-cols-2 gap-[8px] min-h-[300px] content-start">
                    {filteredProducts.map((product, index) => (
                        <div key={product.id} style={{ animationDelay: `${index * 50}ms` }}>
                            <ProductCard product={product} onAdd={addToCart} />
                        </div>
                    ))}
                    
                    {filteredProducts.length === 0 && (
                        <div className="col-span-2 flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3 shadow-inner">
                                <ShoppingBag className="text-gray-400" size={20} />
                            </div>
                            <h3 className="text-sm font-bold text-gray-800">No items found</h3>
                            <p className="text-[11px] text-gray-500 mt-1 max-w-[200px] font-medium mx-auto">
                                Try searching for something else or change the category filter.
                            </p>
                            <button 
                                onClick={() => {setFilter('All'); setSearchTerm('');}} 
                                className="mt-3 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-[13px] shadow-sm hover:bg-gray-50 active:scale-95 transition-all"
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    </AppLayout>
  );
};
