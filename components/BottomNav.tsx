import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ShoppingBag, MapPin } from 'lucide-react';

interface BottomNavProps {
  activePage: string;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activePage }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe pointer-events-none flex justify-center">
        <div className="bg-white border border-[#E7E5E4] rounded-t-[24px] shadow-[0_-4px_20px_rgba(0,0,0,0.05)] p-2 mx-0 w-full max-w-md flex justify-around items-center pointer-events-auto h-[80px]">
            <Link to="/" className={`nav-item ${activePage === 'home' ? 'active' : ''}`}>
                <Home 
                  size={24} 
                  strokeWidth={activePage === 'home' ? 2.5 : 2}
                  className={`mb-1 transition-transform duration-200 ${activePage === 'home' ? 'scale-110' : ''}`} 
                />
                <span className="text-[10px] tracking-wide">Home</span>
            </Link>
            <Link to="/catalog" className={`nav-item ${activePage === 'catalog' ? 'active' : ''}`}>
                <ShoppingBag 
                  size={24} 
                  strokeWidth={activePage === 'catalog' ? 2.5 : 2}
                  className={`mb-1 transition-transform duration-200 ${activePage === 'catalog' ? 'scale-110' : ''}`} 
                />
                <span className="text-[10px] tracking-wide">Catalog</span>
            </Link>
            <Link to="/contact" className={`nav-item ${activePage === 'contact' ? 'active' : ''}`}>
                <MapPin 
                  size={24} 
                  strokeWidth={activePage === 'contact' ? 2.5 : 2}
                  className={`mb-1 transition-transform duration-200 ${activePage === 'contact' ? 'scale-110' : ''}`} 
                />
                <span className="text-[10px] tracking-wide">Contact</span>
            </Link>
        </div>
    </nav>
  );
};