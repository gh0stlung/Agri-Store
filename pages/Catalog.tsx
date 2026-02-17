import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase.ts';
import { ProductCard } from '../components/ProductCard.tsx';
import { AppLayout } from '../components/AppLayout.tsx';
import { useCart } from '../context/CartContext.tsx';
import { Product } from '../types.ts';
import { Search } from 'lucide-react';

export const Catalog: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = filter === 'All' 
    ? products 
    : products.filter(p => p.category === filter);

  const categories = ['All', 'Seeds', 'Fertilizer', 'Pesticides', 'Tools'];

  return (
    <AppLayout activePage="catalog" pageTitle="Our Collection">
        {/* Filter Tabs - Premium Pills */}
        <div className="sticky top-[89px] z-40 py-4 -mx-4 px-4 mb-2 bg-[var(--bg-main)]/95">
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {categories.map(cat => (
                    <button 
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`px-6 py-3 rounded-[16px] text-sm font-bold whitespace-nowrap transition-all duration-200 active:scale-95 shadow-sm border ${
                            filter === cat 
                            ? 'bg-[var(--text-primary)] text-white border-[var(--text-primary)] shadow-md' 
                            : 'bg-white text-[var(--text-secondary)] border-[#E7E5E4] hover:bg-gray-50'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </div>

        {loading ? (
           <div className="grid grid-cols-2 gap-4 pb-24">
             {[1,2,3,4].map(i => (
               <div key={i} className="h-64 rounded-[16px] bg-gray-200 animate-pulse"></div>
             ))}
           </div>
        ) : (
            <div className="grid grid-cols-2 gap-4 pb-24">
                {filteredProducts.map((product, index) => (
                    <div key={product.id} style={{ animationDelay: `${index * 50}ms` }} className="animate-fade-in">
                        <ProductCard product={product} onAdd={addToCart} />
                    </div>
                ))}
            </div>
        )}
        
        {!loading && filteredProducts.length === 0 && (
            <div className="text-center py-20 animate-fade-in">
                <div className="w-20 h-20 bg-[#FFEDD5] rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="text-[#78350F] opacity-50" size={32} />
                </div>
                <p className="font-bold text-[var(--text-primary)] text-lg">No items found.</p>
            </div>
        )}
    </AppLayout>
  );
};