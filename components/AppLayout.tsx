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
    <div className="max-w-[420px] mx-auto w-full bg-[#f7f5ef] min-h-screen relative flex flex-col shadow-2xl">
        <Header title={pageTitle} />
        {/* Added extra bottom padding (pb-[80px]) to ensure content clears the floating bottom nav */}
        <main key={activePage} className="p-[10px] space-y-[12px] pb-[80px] flex-grow relative z-10 animate-fade-in">
            {children}
        </main>
        <BottomNav activePage={activePage} />
    </div>
  );
};