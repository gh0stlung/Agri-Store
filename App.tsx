import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home.tsx';
import { Catalog } from './pages/Catalog.tsx';
import { Contact } from './pages/Contact.tsx';
import { Admin } from './pages/Admin.tsx';
import { Login } from './pages/Login.tsx';
import { ProtectedRoute } from './components/ProtectedRoute.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { ShoppingBag } from 'lucide-react';
import { CartProvider, useCart } from './context/CartContext.tsx';

const AppContent: React.FC = () => {
  const { cartCount, isCartOpen, setIsCartOpen } = useCart();

  return (
    <div className="max-w-md mx-auto relative">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/contact" element={<Contact />} />
        
        {/* Protected Admin Route */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          } 
        />
        
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      
      {/* Floating Cart Button */}
      {!isCartOpen && cartCount > 0 && (
        <button 
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-28 left-6 bg-[#064E3B] text-white p-4 rounded-full shadow-lg z-40 animate-bounce"
        >
          <div className="relative">
            <ShoppingBag size={24} />
            <span className="absolute -top-2 -right-2 bg-[#78350F] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#064E3B]">
              {cartCount}
            </span>
          </div>
        </button>
      )}

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <CartProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </CartProvider>
  );
}