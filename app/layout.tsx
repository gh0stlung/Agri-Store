import React from 'react';
import { Providers } from './providers';
import { CartDrawer } from '../components/CartDrawer';
import { ScrollToTop } from '../components/ScrollToTop';

export const metadata = {
  title: 'New Nikhil Khad Bhandar',
  description: 'Premium agriculture store',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
        <style dangerouslySetInnerHTML={{ __html: `
            @layer theme {
                :root {
                    --bg-main: #F5F5F0; /* Warm earthy grey */
                    --text-primary: #064E3B;
                    --text-secondary: #78350F;
                    --text-body: #27272a;
                    --primary-btn: #064E3B;
                    --card-bg: #FFFFFF;
                    --shadow-premium: 0 8px 30px rgba(0,0,0,0.08);
                }
            }
            @layer base {
                html { scroll-behavior: smooth; }
                body {
                    @apply bg-[var(--bg-main)] text-[var(--text-body)] font-['Plus_Jakarta_Sans'] antialiased pb-28 selection:bg-[var(--primary-btn)] selection:text-white;
                    -webkit-tap-highlight-color: transparent;
                }
                h1, h2, h3, h4, h5, h6 { @apply font-['Merriweather'] text-[var(--text-primary)]; }
                button, a { @apply cursor-pointer touch-manipulation; }
            }
            @layer components {
               .nav-item { @apply flex flex-col items-center justify-center text-xs font-semibold text-[#A8A29E] p-2 w-full transition-all duration-200 cursor-pointer active:scale-90; }
               .nav-item.active { @apply text-[var(--text-secondary)] font-bold scale-105; }
               .scrollbar-hide::-webkit-scrollbar { display: none; }
               .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            }
            @layer utilities {
                .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
                .animate-fade-in { animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; will-change: opacity, transform; }
                .animate-fade-in-up { animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; will-change: opacity, transform; }
                .animate-ken-burns { animation: kenBurns 20s ease-out infinite alternate; will-change: transform; }
                .animate-slide-up { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; will-change: transform, opacity; }
                .animate-slide-in { animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; will-change: transform; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
                @keyframes kenBurns { 0% { transform: scale(1); } 100% { transform: scale(1.15); } }
            }
        `}} />
        <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Providers>
            <>
                <ScrollToTop />
                <div className="max-w-md mx-auto relative min-h-screen shadow-2xl overflow-hidden flex flex-col bg-[#F5F5F0]">
                    {/* Global Background Texture */}
                    <div className="absolute inset-0 z-0 pointer-events-none">
                        <img 
                            src="https://www.transparenttextures.com/patterns/ag-square.png" 
                            className="w-full h-full object-repeat opacity-[0.4]"
                            alt="texture"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-[#F5F5F0]/80 to-[#E6E6DC]/90 mix-blend-multiply"></div>
                    </div>

                    {/* Content Wrapper */}
                    <div className="relative z-10 flex flex-col flex-grow">
                        {children}
                    </div>
                    
                    <CartDrawer />
                </div>
            </>
        </Providers>
      </body>
    </html>
  );
}