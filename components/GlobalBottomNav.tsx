import React from 'react';
import { Link } from './Link';
import { Home, ShoppingBag, MapPin, ShoppingCart, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { motion } from 'motion/react';

interface GlobalBottomNavProps {
  activePage: string;
}

export const GlobalBottomNav: React.FC<GlobalBottomNavProps> = ({ activePage }) => {
  const { cart } = useCart();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, href: '/' },
    { id: 'catalog', label: 'Shop', icon: ShoppingBag, href: '/catalog' },
    { id: 'cart', label: 'Cart', icon: ShoppingCart, href: '/cart', badge: cart.length },
    { id: 'profile', label: 'Profile', icon: User, href: '/profile' },
    { id: 'contact', label: 'Visit', icon: MapPin, href: '/contact' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-[999] h-[65px] bg-[rgba(20,30,50,0.6)] backdrop-blur-[20px] [-webkit-backdrop-filter:blur(20px)] border-t border-[rgba(255,255,255,0.08)] flex items-center justify-around px-2 shadow-[0_-4px_20px_rgba(0,255,150,0.15)] transition-colors duration-200">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activePage === item.id;

        return (
          <Link 
            key={item.id} 
            href={item.href} 
            className={`relative flex-1 flex flex-col items-center justify-center h-full transition-all duration-300 group ${isActive ? 'text-[var(--text-primary)]' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
          >
            <div className="relative">
              <Icon 
                size={22} 
                strokeWidth={isActive ? 2.5 : 2}
                className={`transition-all duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} 
              />
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-[var(--card-bg)] shadow-sm">
                  {item.badge}
                </span>
              )}
              {isActive && (
                <motion.div 
                  layoutId="nav-active"
                  className="absolute -inset-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl -z-10"
                  initial={false}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </div>
            <span className={`text-[10px] font-bold mt-1 transition-all ${isActive ? 'opacity-100 scale-105' : 'opacity-70 group-hover:opacity-100'}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};
