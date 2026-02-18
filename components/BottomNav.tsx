import React from 'react';
import { Link } from './Link';
import { Home, ShoppingBag, MapPin } from 'lucide-react';

interface BottomNavProps {
  activePage: string;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activePage }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none flex justify-center pb-6 px-4">
        {/* Floating Island Container - Black Glass Effect */}
        <div className="pointer-events-auto w-full max-w-[340px] bg-black/85 backdrop-blur-xl rounded-full shadow-[0_12px_36px_rgba(0,0,0,0.45)] border border-white/10 p-1.5 flex justify-between items-center relative overflow-hidden ring-1 ring-white/10">
            
            {/* Gloss Effect */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>

            <Link href="/" className={`relative flex-1 flex flex-col items-center justify-center h-14 rounded-full transition-all duration-300 group ${activePage === 'home' ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
                {activePage === 'home' && (
                    <div className="absolute inset-0 bg-white/15 rounded-full animate-fade-in"></div>
                )}
                <Home 
                    size={22} 
                    strokeWidth={activePage === 'home' ? 2.5 : 2}
                    className={`transition-transform duration-300 relative z-10 ${activePage === 'home' ? 'scale-110 drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]' : 'group-hover:scale-110'}`} 
                />
                <span className={`text-[9px] font-bold mt-0.5 tracking-wide transition-all relative z-10 ${activePage === 'home' ? 'opacity-100 translate-y-0 text-white' : 'opacity-0 translate-y-1 h-0 text-gray-500'}`}>
                    Home
                </span>
            </Link>
            
            <Link href="/catalog" className={`relative flex-1 flex flex-col items-center justify-center h-14 rounded-full transition-all duration-300 group ${activePage === 'catalog' ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
                {activePage === 'catalog' && (
                    <div className="absolute inset-0 bg-white/15 rounded-full animate-fade-in"></div>
                )}
                <ShoppingBag 
                    size={22} 
                    strokeWidth={activePage === 'catalog' ? 2.5 : 2}
                    className={`transition-transform duration-300 relative z-10 ${activePage === 'catalog' ? 'scale-110 drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]' : 'group-hover:scale-110'}`} 
                />
                <span className={`text-[9px] font-bold mt-0.5 tracking-wide transition-all relative z-10 ${activePage === 'catalog' ? 'opacity-100 translate-y-0 text-white' : 'opacity-0 translate-y-1 h-0 text-gray-500'}`}>
                    Shop
                </span>
            </Link>
            
            <Link href="/contact" className={`relative flex-1 flex flex-col items-center justify-center h-14 rounded-full transition-all duration-300 group ${activePage === 'contact' ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
                {activePage === 'contact' && (
                    <div className="absolute inset-0 bg-white/15 rounded-full animate-fade-in"></div>
                )}
                <MapPin 
                    size={22} 
                    strokeWidth={activePage === 'contact' ? 2.5 : 2}
                    className={`transition-transform duration-300 relative z-10 ${activePage === 'contact' ? 'scale-110 drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]' : 'group-hover:scale-110'}`} 
                />
                <span className={`text-[9px] font-bold mt-0.5 tracking-wide transition-all relative z-10 ${activePage === 'contact' ? 'opacity-100 translate-y-0 text-white' : 'opacity-0 translate-y-1 h-0 text-gray-500'}`}>
                    Visit
                </span>
            </Link>
        </div>
    </nav>
  );
};