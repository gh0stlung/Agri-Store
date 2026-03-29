import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Admin } from './pages/Admin';
import { AdminLogin } from './pages/AdminLogin';
import { Catalog } from './pages/Catalog';
import { Order } from './pages/Order';
import { TrackOrder } from './pages/TrackOrder';
import { Contact } from './pages/Contact';
import { MyOrders } from './pages/MyOrders';
import { Cart } from './pages/Cart';
import Profile from './pages/Profile';
import { Developer } from './pages/Developer';
import { AIChatDrawer } from './components/AIChatDrawer';
import { ScrollToTop } from './components/ScrollToTop';
import { CartProvider } from './context/CartContext';
import { AIProvider } from './context/AIContext';
import { AuthProvider } from './context/AuthContext';
import { NavigationProvider } from './context/NavigationContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminProtectedRoute } from './components/AdminProtectedRoute';

const AppContent: React.FC = () => {
  return (
    <div className="max-w-md mx-auto relative min-h-screen-safe bg-[var(--bg-main)] shadow-2xl flex flex-col overflow-x-hidden">
      <ScrollToTop />
      
      <Routes>
        {/* Login Routes - Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/track" element={<TrackOrder />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/cart" element={<Cart />} />
        
        {/* Protected Routes */}
        <Route path="/order" element={
          <ProtectedRoute>
            <Order />
          </ProtectedRoute>
        } />
        <Route path="/my-orders" element={
          <ProtectedRoute>
            <MyOrders />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <AdminProtectedRoute>
            <Admin />
          </AdminProtectedRoute>
        } />
        <Route path="/developer" element={
          <AdminProtectedRoute>
            <Developer />
          </AdminProtectedRoute>
        } />
        
        {/* Catch-all route */}
        <Route path="*" element={<Home />} />
      </Routes>
      
      <AIChatDrawer />
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
        <ThemeProvider>
            <ToastProvider>
                <NavigationProvider value={navValue}>
                     <AIProvider>
                        <AuthProvider>
                            <CartProvider>
                                <AppContent />
                            </CartProvider>
                        </AuthProvider>
                     </AIProvider>
                </NavigationProvider>
            </ToastProvider>
        </ThemeProvider>
    );
};

export default function App() {
  return (
    <BrowserRouter>
        <AppProviderWrapper />
    </BrowserRouter>
  );
}