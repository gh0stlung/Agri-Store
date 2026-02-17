'use client';
import React from 'react';
import { Sprout, ShieldCheck } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';

interface HeaderProps {
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  const { push } = useNavigation();

  return (
    <header className="px-6 py-4 sticky top-0 z-50 bg-[#FFFCF0]/90 backdrop-blur-md border-b border-[#064E3B]/5 transition-all duration-300">
        <div className="flex items-center justify-between">
            {/* Left: Brand Identity */}
            <div className="flex items-center gap-3" onClick={() => push('/')}>
                <div className="w-10 h-10 bg-[#064E3B] rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/20 active:scale-95 transition-transform cursor-pointer">
                    <Sprout size={20} className="text-white fill-emerald-400" />
                </div>
                <div className="flex flex-col cursor-pointer">
                    <h1 className="text-lg font-black text-[#064E3B] leading-none tracking-tight font-serif">
                        New Nikhil
                    </h1>
                    <span className="text-xs font-bold text-[#78350F] tracking-wide mt-0.5">
                        Khad Bhandar 🌾
                    </span>
                </div>
            </div>

            {/* Right: Admin Badge */}
            <div 
               onClick={() => push('/admin')}
               className="flex items-center gap-1.5 bg-white pl-2 pr-3 py-1.5 rounded-full shadow-sm border border-[#E7E5E4] cursor-pointer select-none hover:bg-gray-50 active:scale-95 transition-all group"
               title="Store Manager"
            >
               <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                    <ShieldCheck size={12} className="text-orange-700" />
               </div>
               <span className="text-[10px] font-bold text-gray-500 group-hover:text-gray-700">Admin</span>
            </div>
        </div>
        
        {/* Optional Page Title (Dynamic) */}
        {title && (
            <div className="mt-4 animate-fade-in">
                <h2 className="text-2xl font-black text-[#064E3B] tracking-tight">{title}</h2>
                <div className="w-12 h-1 bg-[#064E3B] rounded-full mt-1.5 opacity-20"></div>
            </div>
        )}
    </header>
  );
};