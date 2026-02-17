import React from 'react';
import { Plus } from 'lucide-react';
import { Product } from '../types.ts';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAdd }) => {
  const { name, category, price, image_url } = product;

  return (
    <div 
      className="card-premium card-interactive group relative flex flex-col h-full cursor-pointer"
      onClick={() => onAdd(product)}
    >
      <div className="h-40 relative overflow-hidden bg-gray-50 p-1">
        <img 
            src={image_url || 'https://via.placeholder.com/300?text=No+Image'} 
            alt={name} 
            className="w-full h-full object-cover rounded-[12px] transition-transform duration-500 ease-out group-hover:scale-105 will-change-transform" 
            loading="lazy"
        />
        
        {/* Clean Category Badge */}
        <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-none text-[var(--text-secondary)] text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm border border-[#E7E5E4]">
            {category}
        </span>
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
          <h3 className="font-bold text-[var(--text-primary)] text-base mb-1 leading-tight font-serif line-clamp-2">{name}</h3>
          <div className="flex justify-between items-end mt-auto pt-3">
              <div className="flex flex-col">
                  <span className="text-[10px] text-[#A8A29E] font-bold uppercase tracking-wider mb-0.5">Price</span>
                  <span className="text-lg font-black text-[var(--text-secondary)] font-sans">₹{price}</span>
              </div>
              <button 
                className="w-10 h-10 rounded-full bg-[#ECFDF5] text-[var(--text-primary)] active:scale-90 transition-transform duration-150 flex items-center justify-center shadow-sm border border-[#D1FAE5]"
                onClick={(e) => {
                  e.stopPropagation();
                  onAdd(product);
                }}
              >
                  <Plus size={18} strokeWidth={2.5} />
              </button>
          </div>
      </div>
    </div>
  );
};