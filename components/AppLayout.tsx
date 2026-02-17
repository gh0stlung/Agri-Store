import React from 'react';
import { Header } from './Header';
import { BottomNav } from './BottomNav';

interface AppLayoutProps {
  children: React.ReactNode;
  activePage: string;
  pageTitle?: string;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, activePage, pageTitle }) => {
  return (
    <div className="min-h-screen bg-[var(--bg-main)] max-w-md mx-auto relative overflow-hidden flex flex-col shadow-2xl">
        <Header title={pageTitle} />
        {/* Added extra bottom padding (pb-36) to ensure content clears the floating bottom nav */}
        <main key={activePage} className="p-4 space-y-5 pb-36 flex-grow relative z-10 animate-fade-in">
            {children}
        </main>
        <BottomNav activePage={activePage} />
    </div>
  );
};