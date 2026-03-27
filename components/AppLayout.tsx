import { motion, AnimatePresence } from 'motion/react';
import { BottomNav } from './BottomNav';
import { Header } from './Header';
import { useNavigation } from '../context/NavigationContext';

interface AppLayoutProps {
  children: React.ReactNode;
  activePage: string;
  pageTitle?: string;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, activePage, pageTitle }) => {
  const { pathname } = useNavigation();

  return (
    <div className="max-w-[420px] mx-auto w-full bg-[var(--bg-main)] min-h-screen relative flex flex-col shadow-2xl overflow-x-hidden transition-colors duration-300">
        <Header title={pageTitle} />

        <AnimatePresence mode="wait">
          <motion.main 
            key={activePage} 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="p-4 space-y-4 pb-20 flex-grow relative z-10"
          >
              {/* Page Title - Only if provided and not on home */}
              {pageTitle && pathname !== '/' && pathname !== '/home' && (
                <div className="pb-2">
                  <h1 className="text-2xl font-black text-[var(--text-primary)] tracking-tight leading-none">
                    {pageTitle}
                  </h1>
                </div>
              )}
              
              {children}
          </motion.main>
        </AnimatePresence>
        
        <BottomNav activePage={activePage} />
    </div>
  );
};
