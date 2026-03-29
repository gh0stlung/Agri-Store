'use client';
import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, ShieldCheck, Code } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
}

export const Header: React.FC<HeaderProps> = () => {
  const { push } = useNavigation();
  const { user, signOut } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isAdmin = user?.email?.toLowerCase() === 'admin69@gmail.com';

  const handleAdminClick = () => {
    push('/admin');
    setShowDropdown(false);
  };

  const handleDevClick = () => {
    push('/developer');
    setShowDropdown(false);
  };

  const handleLogout = async () => {
    await signOut();
    setShowDropdown(false);
    push('/');
  };

  const handleLoginClick = () => {
    if (user) {
      push('/');
    } else {
      push('/login?mode=signup');
    }
  };

  return (
    <header className="px-4 sticky top-0 z-50 bg-[var(--card-bg)]/80 backdrop-blur-md border-b border-black/5 dark:border-white/5 pt-safe flex flex-col justify-center transition-colors duration-200">
        <div className="flex items-center justify-between w-full h-[56px]">
            {/* Left: Brand Logo + Name */}
            <div className="flex items-center gap-3.5 group cursor-pointer select-none" onClick={() => push('/')}>
                <div className="relative w-10 h-10 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105">
                    {/* Square Container with Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-emerald-500 rounded-xl shadow-sm border border-white/10" />
                    
                    {/* Minimal Leaf Icon - Centered properly */}
                    <div className="relative z-10 w-5 h-5 bg-white rounded-tl-full rounded-br-full rotate-45 flex items-center justify-center overflow-hidden shadow-sm">
                        <div className="w-full h-[0.5px] bg-emerald-600/20 -rotate-45" />
                    </div>
                </div>
                
                <div className="flex flex-col justify-center">
                    <span className="text-[17px] font-black text-[var(--text-primary)] leading-none tracking-tight">
                        Nikhil Khad
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.25em] mt-1.5 leading-none">
                        Bhandar
                    </span>
                </div>
            </div>

            {/* Right: Profile Dropdown */}
            <div className="relative flex justify-end min-w-[40px]" ref={dropdownRef}>
                {user ? (
                    <>
                        <button 
                           onClick={() => setShowDropdown(!showDropdown)}
                           className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${showDropdown ? 'bg-black/10 dark:bg-white/10 text-[var(--text-primary)]' : 'text-[var(--text-body)] hover:bg-black/5 dark:hover:bg-white/5'}`}
                           aria-label="User menu"
                        >
                           <User size={20} strokeWidth={2.5} />
                        </button>

                        {showDropdown && (
                            <div className="absolute right-0 top-full mt-2 w-56 bg-[var(--card-bg)] rounded-2xl shadow-2xl border border-black/5 dark:border-white/10 py-2 z-[100] animate-in fade-in zoom-in duration-200 origin-top-right">
                                <div className="px-4 py-3 border-b border-gray-50 dark:border-gray-800 mb-1">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Account</p>
                                    <p className="text-xs font-bold text-[var(--text-body)] truncate">{user.email}</p>
                                </div>
                                
                                {isAdmin && (
                                    <>
                                        <button 
                                            onClick={handleAdminClick}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100 transition-colors"
                                        >
                                            <ShieldCheck size={18} />
                                            Admin Dashboard
                                        </button>
                                        <button 
                                            onClick={handleDevClick}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-blue-700 bg-blue-50/50 hover:bg-blue-100 transition-colors"
                                        >
                                            <Code size={18} />
                                            Developer Dashboard
                                        </button>
                                    </>
                                )}

                                <button 
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors mt-1 border-t border-gray-50 pt-3"
                                >
                                    <LogOut size={18} />
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <button 
                       onClick={handleLoginClick}
                       className="text-xs font-black text-emerald-700 uppercase tracking-widest hover:text-emerald-800 transition-colors"
                    >
                       Login
                    </button>
                )}
            </div>
        </div>
    </header>
  );
};
