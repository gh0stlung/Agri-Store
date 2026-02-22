import React from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAdd }) => {
  const { name, category, price, image_url, stock, unit } = product;
  const isOutOfStock = stock <= 0;

  return (
    <div 
      className={`bg-white rounded-[16px] shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-[#E7E5E4] group relative flex flex-col h-full overflow-hidden transition-all duration-300 ${isOutOfStock ? 'opacity-70 grayscale-[0.8]' : 'hover:-translate-y-1 hover:shadow-xl hover:border-emerald-100 cursor-pointer active:scale-[0.98]'}`}
      onClick={() => !isOutOfStock && onAdd(product)}
    >
      {/* Image Container */}
      <div className="h-32 relative overflow-hidden bg-gray-50 m-1 rounded-[12px]">
        <img 
            src={image_url || 'https://via.placeholder.com/300?text=No+Image'} 
            alt={name} 
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" 
            loading="lazy"
        />
        
        {/* Category Badge */}
        <span className="absolute top-2 left-2 bg-white/95 backdrop-blur-md text-[#78350F] text-[9px] font-bold px-2 py-0.5 rounded-[6px] shadow-sm border border-gray-100 tracking-wide">
            {category}
        </span>

        {/* Stock Badge */}
        {isOutOfStock ? (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                <span className="bg-red-500 text-white text-[9px] font-bold px-2.5 py-1 rounded-full shadow-lg border border-white/20 transform -rotate-3">
                    Out of Stock
                </span>
            </div>
        ) : stock < 10 && (
            <span className="absolute bottom-2 right-2 bg-orange-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-[6px] shadow-sm flex items-center gap-1 border border-white/20">
                <AlertCircle size={8} /> Few Left
            </span>
        )}
      </div>
      
      {/* Content */}
      <div className="p-2.5 flex flex-col flex-grow">
          <div className="flex-grow">
              <h3 className="font-bold text-[#064E3B] text-xs mb-1 leading-snug font-serif line-clamp-2">{name}</h3>
              <p className="text-[9px] text-gray-500 font-bold bg-gray-100/50 inline-block px-1.5 py-0.5 rounded-[6px] border border-gray-100">
                  {unit || 'Item'}
              </p>
          </div>
          
          <div className="flex justify-between items-end mt-2 pt-2 border-t border-dashed border-gray-200">
              <div className="flex flex-col">
                  <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Price</span>
                  <span className="text-sm font-black text-[#78350F] font-sans tracking-tight">₹{price}</span>
              </div>
              <button 
                className={`w-8 h-8 rounded-[8px] flex items-center justify-center shadow-md transition-all duration-300 ${
                    isOutOfStock 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-[#064E3B] text-white hover:bg-[#053d2e] shadow-[#064E3B]/20'
                }`}
                disabled={isOutOfStock}
                onClick={(e) => {
                  e.stopPropagation();
                  !isOutOfStock && onAdd(product);
                }}
              >
                  <Plus size={16} strokeWidth={3} />
              </button>
          </div>
      </div>
    </div>
  );
};