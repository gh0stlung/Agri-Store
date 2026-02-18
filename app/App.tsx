import React from 'react';
import { HashRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Admin } from './pages/Admin';
import { Catalog } from './pages/Catalog';
import { Order } from './pages/Order';
import { TrackOrder } from './pages/TrackOrder';
import { Contact } from './pages/Contact';
import { CartDrawer } from './components/CartDrawer';
import { ScrollToTop } from './components/ScrollToTop';
import { ShoppingBag } from 'lucide-react';
import { CartProvider, useCart } from './context/CartContext';
import { NavigationProvider } from './context/NavigationContext';
import { ProtectedRoute } from './components/ProtectedRoute';

const AppContent: React.FC = () => {
  const { cartCount, isCartOpen, setIsCartOpen } = useCart();

  return (
    <div className="max-w-md mx-auto relative min-h-screen bg-[var(--bg-main)] shadow-2xl overflow-hidden flex flex-col">
      <ScrollToTop />
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/login" element={<Login />} />
        <Route path="/order" element={<Order />} />
        <Route path="/track" element={<TrackOrder />} />
        <Route path="/contact" element={<Contact />} />
        
        {/* Protected Admin Route */}
        <Route path="/admin" element={
            <ProtectedRoute>
                <Admin />
            </ProtectedRoute>
        } />
      </Routes>
      
      {/* Floating Cart Button */}
      {!isCartOpen && cartCount > 0 && (
        <button 
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-[#064E3B] text-white px-6 py-3 rounded-full shadow-xl z-40 animate-bounce cursor-pointer hover:bg-[#065E4B] active:scale-95 transition-all duration-300 flex items-center gap-2 border border-emerald-400/20"
          aria-label="View Cart"
        >
          <ShoppingBag size={20} />
          <span className="font-bold text-sm">View Cart ({cartCount})</span>
        </button>
      )}

      <CartDrawer />
    </div>
  );
};

// Wrapper to provide Navigation Context for React-Router environment
const AppProviderWrapper = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const navValue = {
        push: (path: string) => navigate(path),
        replace: (path: string) => navigate(path, { replace: true }),
        back: () => navigate(-1),
        pathname: location.pathname,
        isNext: false
    };

    return (
        <NavigationProvider value={navValue}>
            <CartProvider>
                <AppContent />
            </CartProvider>
        </NavigationProvider>
    );
};

export default function App() {
  return (
    <HashRouter>
        <AppProviderWrapper />
    </HashRouter>
  );
}