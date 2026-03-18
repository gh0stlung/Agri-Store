'use client';
import React, { useEffect, useState } from 'react';
import { Sprout, LogIn, User } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { supabase } from '@/lib/supabase';

interface HeaderProps {
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  const { push } = useNavigation();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (!supabase) return;

    // Check initial session
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <header className="px-[10px] py-[8px] sticky top-0 z-50 bg-[#FFFCF0]/90 backdrop-blur-md border-b border-[#064E3B]/5 transition-all duration-300">
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

            {/* Right: Profile/Login Button */}
            <div 
               style={{ position: 'absolute', top: '10px', right: '10px' }}
            >
                {user ? (
                    <div 
                       onClick={() => push('/profile')}
                       className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center shadow-sm border border-emerald-200 cursor-pointer active:scale-95 transition-transform"
                       title="Profile"
                    >
                       <User size={16} className="text-emerald-800" />
                    </div>
                ) : (
                    <div 
                       onClick={() => push('/login')}
                       className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full shadow-sm border border-[#E7E5E4] cursor-pointer select-none hover:bg-gray-50 active:scale-95 transition-all"
                       title="Login"
                    >
                       <LogIn size={14} className="text-emerald-700" />
                       <span className="text-xs font-bold text-gray-700">Login</span>
                    </div>
                )}
            </div>
        </div>
        
        {/* Optional Page Title (Dynamic) */}
        {title && (
            <div className="mt-[8px] animate-fade-in">
                <h2 className="text-[20px] font-black text-[#064E3B] tracking-tight leading-none">{title}</h2>
                <div className="w-10 h-1 bg-[#064E3B] rounded-full mt-[4px] opacity-20"></div>
            </div>
        )}
    </header>
  );
};
