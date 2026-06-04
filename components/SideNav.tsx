import React from 'react';
import { Link } from './Link';
import { Home, ShoppingBag, ShoppingCart, User, LogOut, ShieldCheck, Code } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { motion } from 'motion/react';

interface SideNavProps {
  activePage: string;
}

export const SideNav: React.FC<SideNavProps> = ({ activePage }) => {
  const { cart } = useCart();
  const { user, signOut } = useAuth();
  const { push } = useNavigation();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, href: '/' },
    { id: 'catalog', label: 'Shop', icon: ShoppingBag, href: '/catalog' },
    { id: 'cart', label: 'Cart', icon: ShoppingCart, href: '/cart', badge: cart.length },
    { id: 'profile', label: 'Profile', icon: User, href: '/profile' },
  ];

  const isAdmin = user?.email?.toLowerCase() === 'admin69@gmail.com';

  const handleLogout = async () => {
    await signOut();
    push('/');
  };

  return (
    <aside id="desktop-side-nav" className="hidden md:flex flex-col w-56 lg:w-64 shrink-0 bg-[var(--card-bg)] border-r border-black/5 dark:border-white/5 h-screen sticky top-0 py-6 px-4 justify-between z-40 transition-colors duration-200">
      {/* Top Section: Brand Logo + Logo Text */}
      <div className="space-y-8">
        <div className="flex items-center gap-3 group select-none px-2">
          {/* Logo */}
          <div 
              className="relative w-10 h-10 flex items-center justify-center shrink-0 transition-transform duration-300 hover:scale-105 cursor-pointer"
              onClick={() => push('/')}
          >
              <div className="absolute inset-0 bg-emerald-500/20 blur-lg rounded-full" />
              <div className="relative w-full h-full bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-black/5 dark:border-white/10 flex items-center justify-center overflow-hidden p-1">
                  <img 
                      src="/logo.png" 
                      alt="Nikhil Khad Bhandar" 
                      className="w-full h-full object-contain dark:brightness-110 dark:contrast-125 transition-all"
                  />
              </div>
          </div>
          
          {/* Typography */}
          <div 
              className="flex flex-col justify-center cursor-pointer"
              onClick={() => push('/contact')}
          >
              <span className="text-base font-bold text-[var(--text-primary)] leading-tight tracking-tight">
                  Nikhil Khad
              </span>
              <span className="text-[9px] font-light text-[var(--text-secondary)] uppercase tracking-[0.3em] leading-none">
                  Bhandar
              </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-1.5" aria-label="Sidebar navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <Link 
                key={item.id} 
                href={item.href} 
                className={`relative flex items-center gap-3 px-3 py-3 rounded-xl font-bold text-sm transition-all duration-300 group ${isActive ? 'text-[var(--text-primary)]' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
              >
                <div className="relative flex items-center">
                  <Icon 
                    size={20} 
                    strokeWidth={isActive ? 2.5 : 2}
                    className={`transition-all duration-300 ${isActive ? 'scale-110 text-emerald-500' : 'group-hover:scale-110 group-hover:text-emerald-500'}`} 
                  />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-[var(--card-bg)] shadow-sm">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="transition-all">
                  {item.label}
                </span>

                {isActive && (
                  <motion.div 
                    layoutId="side-nav-active"
                    className="absolute inset-0 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl -z-10 border-l-4 border-emerald-500"
                    initial={false}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: User Email & Actions */}
      <div className="border-t border-black/5 dark:border-white/5 pt-4 px-2 space-y-3">
        {user ? (
          <div className="space-y-3">
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Logged In As</span>
              <span className="text-xs font-bold text-[var(--text-body)] truncate" title={user.email}>
                {user.email}
              </span>
            </div>

            {isAdmin && (
              <div className="flex flex-col gap-1">
                <button 
                  onClick={() => push('/admin')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/20 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                >
                  <ShieldCheck size={14} />
                  Admin Menu
                </button>
                <button 
                  onClick={() => push('/developer')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-blue-700 bg-blue-50/50 dark:bg-blue-950/20 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <Code size={14} />
                  Developer Menu
                </button>
              </div>
            )}

            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        ) : (
          <button 
            onClick={() => push('/login?mode=signup')}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg font-black text-xs uppercase tracking-wider transition-colors text-center"
          >
            Login / Signup
          </button>
        )}
      </div>
    </aside>
  );
};

export default SideNav;
