import { motion, AnimatePresence } from 'motion/react';
import { GlobalBottomNav } from './GlobalBottomNav';
import { Header } from './Header';
import { useNavigation } from '../context/NavigationContext';
import { SideNav } from './SideNav';

interface AppLayoutProps {
  children: React.ReactNode;
  activePage: string;
  pageTitle?: string;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, activePage, pageTitle }) => {
  const { pathname } = useNavigation();

  return (
    <div className="w-full max-w-md md:max-w-none mx-auto bg-[var(--bg-main)] min-h-screen-safe relative flex flex-col md:flex-row shadow-2xl overflow-x-hidden transition-colors duration-300">
        <SideNav activePage={activePage} />

        <div className="flex-grow flex flex-col w-full max-w-md md:max-w-5xl mx-auto relative">
            <Header title={pageTitle} />

            <AnimatePresence mode="wait">
              <motion.main 
                key={activePage} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="p-4 space-y-4 pb-safe flex-grow relative z-10 w-full box-border pb-24 md:pb-6"
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
            
            <GlobalBottomNav activePage={activePage} />
        </div>
    </div>
  );
};
