import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { ProductCard } from '../components/ProductCard';
import { AppLayout } from '../components/AppLayout';
import { useCart } from '../context/CartContext';
import { Product } from '../types';
import { Search, Filter, RefreshCw, X, ShoppingBag, AlertCircle, Check } from 'lucide-react';

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
  index: number;
}

const CategoryItem: React.FC<CategoryItemProps> = ({ cat, isActive, onClick, index }) => {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <button
            onClick={onClick}
            className={`relative flex-shrink-0 w-[80px] h-[100px] sm:w-[100px] sm:h-[120px] rounded-[16px] overflow-hidden transition-all duration-300 group snap-start ${
                isActive 
                ? 'scale-95 ring-[2px] ring-[#064E3B] ring-offset-1 ring-offset-[#F5F5F0] shadow-none' 
                : 'hover:scale-[1.02] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-white/40'
            }`}
            style={{ animationDelay: `${index * 50}ms` }}
        >
             {/* Loading Skeleton */}
             <div className={`absolute inset-0 bg-gray-200 animate-pulse z-20 transition-opacity duration-500 ${isLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} />

            {/* Image */}
            <img 
                src={cat.image} 
                className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} 
                alt={cat.label}
                loading="lazy" 
                onLoad={() => setIsLoaded(true)}
            />
            
            {/* Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} opacity-90 transition-opacity duration-300`} />
            
            {/* Active Indicator Overlay */}
            {isActive && <div className="absolute inset-0 bg-[#064E3B]/10 mix-blend-multiply" />}

            {/* Content */}
            <div className="absolute inset-x-0 bottom-0 p-2 z-30 flex flex-col items-center justify-end h-full">
                {isActive && (
                    <div className="mb-auto mt-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
                        <Check size={12} className="text-[#064E3B] stroke-[3px]" />
                    </div>
                )}
                
                <span className={`text-[10px] sm:text-xs font-bold text-center leading-tight text-white drop-shadow-md tracking-wide ${isActive ? 'translate-y-0' : 'translate-y-1'}`}>
                    {cat.label}
                </span>
            </div>
        </button>
    );
};

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
        <div className="sticky top-0 z-40 bg-[#F5F5F0]/95 backdrop-blur-xl pt-2 pb-2 -mx-4 px-4 transition-all border-b border-[#064E3B]/10 mb-2">
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#064E3B] transition-colors" size={16} />
                <input 
                    type="text" 
                    placeholder="Search seeds, fertilizer..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-[#E7E5E4] rounded-xl py-2.5 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-[#064E3B] focus:border-transparent shadow-sm text-xs font-bold text-gray-800 placeholder-gray-400 transition-all"
                />
                {searchTerm && (
                    <button 
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"
                    >
                        <X size={12} />
                    </button>
                )}
            </div>
        </div>

        {/* CATEGORY SLIDER (Horizontal Scroll) */}
        {!searchTerm && (
            <div className="mb-4 animate-fade-in-up">
                <div className="flex justify-between items-end mb-2 px-1">
                    <h3 className="text-base font-black text-[#064E3B] font-serif tracking-tight">Categories</h3>
                    {filter !== 'All' && (
                        <button onClick={() => setFilter('All')} className="text-[10px] font-bold text-gray-500 hover:text-[#064E3B] flex items-center gap-1 bg-white px-2.5 py-1 rounded-full border border-gray-200 shadow-sm transition-all active:scale-95">
                            View All <RefreshCw size={10} />
                        </button>
                    )}
                </div>
                
                {/* Scroll Container */}
                <div className="flex overflow-x-auto gap-2 pb-4 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory">
                    {CATEGORIES.map((cat, idx) => (
                        <CategoryItem 
                            key={cat.name} 
                            cat={cat} 
                            index={idx} 
                            isActive={filter === cat.name} 
                            onClick={() => setFilter(filter === cat.name ? 'All' : cat.name)} 
                        />
                    ))}
                    {/* Padding spacer at the end */}
                    <div className="w-2 flex-shrink-0"></div>
                </div>
            </div>
        )}

        {/* FILTER STATUS */}
        {filter !== 'All' && (
            <div className="flex items-center gap-2 mb-2 animate-fade-in px-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Showing:</span>
                <span className="px-2.5 py-1 bg-[#064E3B] text-white text-[10px] font-bold rounded-full shadow-md flex items-center gap-1 transition-all hover:bg-[#053d2e] active:scale-95 cursor-pointer" onClick={() => setFilter('All')}>
                    {filter}
                    <X size={10} className="opacity-80" />
                </span>
            </div>
        )}

        {/* PRODUCTS GRID */}
        {loading ? (
           <div className="grid grid-cols-2 gap-2 pb-32 px-1">
             {[1,2,3,4,5,6].map(i => (
               <div key={i} className="h-48 rounded-[16px] bg-white border border-gray-100 animate-pulse shadow-sm"></div>
             ))}
           </div>
        ) : !supabase ? (
           <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in bg-white rounded-[16px] border border-red-100 p-6 shadow-sm mx-1">
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-3">
                    <AlertCircle className="text-red-400" size={20} />
                </div>
                <h3 className="text-base font-bold text-gray-800">Connection Error</h3>
                <p className="text-[10px] text-gray-500 mt-1 max-w-[200px] font-medium mx-auto">
                    Please check your internet connection or database configuration.
                </p>
           </div>
        ) : (
            <div className="grid grid-cols-2 gap-2 pb-32 min-h-[300px] content-start px-1">
                {filteredProducts.map((product, index) => (
                    <div key={product.id} style={{ animationDelay: `${index * 50}ms` }} className="animate-fade-in-up">
                        <ProductCard product={product} onAdd={addToCart} />
                    </div>
                ))}
                
                {filteredProducts.length === 0 && (
                    <div className="col-span-2 flex flex-col items-center justify-center py-12 text-center animate-fade-in">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3 shadow-inner">
                            <ShoppingBag className="text-gray-400" size={24} />
                        </div>
                        <h3 className="text-base font-bold text-gray-800">No items found</h3>
                        <p className="text-[10px] text-gray-500 mt-1 max-w-[200px] font-medium mx-auto">
                            Try searching for something else or change the category filter.
                        </p>
                        <button 
                            onClick={() => {setFilter('All'); setSearchTerm('');}} 
                            className="mt-3 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-xs shadow-sm hover:bg-gray-50 active:scale-95 transition-all"
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
