import React from 'react';
import { User } from 'lucide-react';

interface HeaderProps {
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header className="px-5 py-6 sticky top-0 z-50 bg-[var(--bg-main)]/95 backdrop-blur-none border-b border-[#E7E5E4]/50">
        <div className="flex items-center justify-between mb-2">
            <div>
                <h1 className="text-2xl font-black text-[var(--text-primary)] leading-none tracking-tight">New Nikhil<br/><span className="text-[var(--text-secondary)] font-medium text-lg">Khad Bhandar</span></h1>
            </div>
            {/* User Badge - Static Display */}
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-[#E7E5E4] cursor-default select-none">
               <div className="w-8 h-8 rounded-full bg-[#FFEDD5] flex items-center justify-center">
                    <User size={14} className="text-[#78350F]" />
               </div>
               <span className="text-xs font-bold text-[var(--text-secondary)]">Abhay</span>
            </div>
        </div>
        {title && (
            <div className="mt-4 animate-fade-in">
                <h2 className="text-3xl font-black text-[var(--text-primary)]">{title}</h2>
            </div>
        )}
    </header>
  );
};