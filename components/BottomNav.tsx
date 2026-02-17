import React from 'react';
import { Link } from './Link';
import { Home, ShoppingBag, MapPin } from 'lucide-react';

interface BottomNavProps {
  activePage: string;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activePage }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe pointer-events-none flex justify-center">
        <div className="bg-[#1a1a1a]/90 backdrop-blur-xl border-t border-white/10 rounded-t-[24px] shadow-[0_-10px_40px_rgba(0,0,0,0.3)] p-2 mx-0 w-full max-w-md flex justify-around items-center pointer-events-auto h-[80px]">
            <Link href="/" className={`nav-item flex flex-col items-center justify-center p-2 w-full transition-all duration-300 ${activePage === 'home' ? 'text-emerald-400' : 'text-gray-500 hover:text-gray-300'}`}>
                <div className={`p-1.5 rounded-full transition-all ${activePage === 'home' ? 'bg-emerald-400/10 translate-y-[-4px]' : ''}`}>
                   <Home 
                    size={24} 
                    strokeWidth={activePage === 'home' ? 2.5 : 2}
                    className={`transition-transform duration-300 ${activePage === 'home' ? 'scale-110' : ''}`} 
                  />
                </div>
                <span className={`text-[10px] tracking-wide font-medium mt-1 ${activePage === 'home' ? 'opacity-100 font-bold' : 'opacity-70'}`}>Home</span>
            </Link>
            
            <Link href="/catalog" className={`nav-item flex flex-col items-center justify-center p-2 w-full transition-all duration-300 ${activePage === 'catalog' ? 'text-emerald-400' : 'text-gray-500 hover:text-gray-300'}`}>
                <div className={`p-1.5 rounded-full transition-all ${activePage === 'catalog' ? 'bg-emerald-400/10 translate-y-[-4px]' : ''}`}>
                   <ShoppingBag 
                    size={24} 
                    strokeWidth={activePage === 'catalog' ? 2.5 : 2}
                    className={`transition-transform duration-300 ${activePage === 'catalog' ? 'scale-110' : ''}`} 
                  />
                </div>
                <span className={`text-[10px] tracking-wide font-medium mt-1 ${activePage === 'catalog' ? 'opacity-100 font-bold' : 'opacity-70'}`}>Catalog</span>
            </Link>
            
            <Link href="/contact" className={`nav-item flex flex-col items-center justify-center p-2 w-full transition-all duration-300 ${activePage === 'contact' ? 'text-emerald-400' : 'text-gray-500 hover:text-gray-300'}`}>
                <div className={`p-1.5 rounded-full transition-all ${activePage === 'contact' ? 'bg-emerald-400/10 translate-y-[-4px]' : ''}`}>
                   <MapPin 
                    size={24} 
                    strokeWidth={activePage === 'contact' ? 2.5 : 2}
                    className={`transition-transform duration-300 ${activePage === 'contact' ? 'scale-110' : ''}`} 
                  />
                </div>
                <span className={`text-[10px] tracking-wide font-medium mt-1 ${activePage === 'contact' ? 'opacity-100 font-bold' : 'opacity-70'}`}>Contact</span>
            </Link>
        </div>
    </nav>
  );
};