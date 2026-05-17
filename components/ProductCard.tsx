import React, { useState } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import { Product, Variant } from '../types';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product, variant?: Variant) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAdd }) => {
  const { name, category, price, image_url, stock, variants } = product;
  const isOutOfStock = stock <= 0;

  const hasVariants = variants && variants.length > 0;
  const [selectedVariant, setSelectedVariant] = useState<Variant | undefined>(hasVariants ? variants[0] : undefined);

  const currentPrice = selectedVariant ? selectedVariant.price : price;
  const currentImage = selectedVariant?.image_url || image_url;

  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = () => {
    if (isAdding) return;
    setIsAdding(true);
    onAdd(product, selectedVariant);
    setTimeout(() => setIsAdding(false), 300);
  };

  return (
    <div 
      className={`w-full bg-[var(--card-bg)] rounded-xl shadow-[var(--shadow-soft)] border border-[var(--border-color)] group relative flex flex-col h-full overflow-hidden transition-all duration-300 ${isOutOfStock ? 'opacity-70 grayscale-[0.8]' : 'hover:-translate-y-1 hover:shadow-xl hover:border-emerald-100 dark:hover:border-emerald-900/50 active:scale-[0.98]'}`}
    >
      {/* Image Container */}
      <div className="h-[180px] relative overflow-hidden rounded-t-xl">
        <img 
            src={currentImage || 'https://via.placeholder.com/300?text=No+Image'} 
            alt={name} 
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" 
            loading="lazy"
        />
        
        {/* Category Badge */}
        <span className="absolute top-1.5 left-1.5 bg-[var(--card-bg)]/95 backdrop-blur-md text-[var(--text-secondary)] text-[9px] font-bold px-1.5 py-0.5 rounded-[4px] shadow-sm border border-[var(--border-color)] tracking-wide">
            {category}
        </span>

        {/* Stock Badge */}
        {isOutOfStock ? (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                <span className="bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-lg border border-white/20 transform -rotate-3">
                    Out of Stock
                </span>
            </div>
        ) : stock < 10 && (
            <span className="absolute bottom-1.5 right-1.5 bg-orange-500 text-white text-[8px] font-bold px-1 py-0.5 rounded-[4px] shadow-sm flex items-center gap-1 border border-white/20">
                <AlertCircle size={9} /> Few Left
            </span>
        )}
      </div>
      
      {/* Content */}
      <div className="p-[6px] flex flex-col flex-grow">
          <div className="flex-grow">
              <h3 className="font-bold text-[var(--text-primary)] text-[12px] mb-0.5 leading-snug font-serif line-clamp-2">{name}</h3>
              
              {hasVariants && (
                <div className="flex flex-wrap gap-1 mt-1 mb-1">
                  {variants.map(v => (
                    <button
                      key={v.id}
                      onClick={(e) => { e.stopPropagation(); setSelectedVariant(v); }}
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-[4px] border ${selectedVariant?.id === v.id ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700' : 'bg-[var(--input-bg)] text-gray-500 border-[var(--border-color)]'}`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              )}
          </div>
          
          <div className="flex justify-between items-center mt-1 pt-1 border-t border-dashed border-[var(--border-color)]">
              <div className="flex flex-col">
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider leading-none mb-0.5">Price</span>
                  <span className="text-[12px] font-black text-[var(--text-secondary)] font-sans tracking-tight leading-none">₹{currentPrice}</span>
              </div>
              <button 
                className={`flex items-center gap-1 px-2 h-6 rounded-[6px] shadow-md transition-all duration-300 ${
                    isOutOfStock 
                    ? 'bg-[var(--input-bg)] text-gray-400' 
                    : 'bg-[var(--primary-btn)] text-white hover:opacity-90 shadow-emerald-900/20'
                }`}
                disabled={isOutOfStock || isAdding}
                onClick={(e) => {
                  e.stopPropagation();
                  !isOutOfStock && handleAdd();
                }}
              >
                  <Plus size={10} strokeWidth={3} />
                  <span className="text-[10px] font-bold">Add</span>
              </button>
          </div>
      </div>
    </div>
  );
};