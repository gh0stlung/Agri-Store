import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartContextType, CartItem, Product, Variant } from '../types';
import { useToast } from './ToastContext';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.warn('Failed to parse cart from local storage', e);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
    } catch (e) {
      console.warn('Failed to save cart to local storage', e);
    }
  }, [cart]);

  const addToCart = (product: Product, variant?: Variant) => {
    const cartItemId = variant ? `${product.id}-${variant.id}` : product.id;
    const existing = cart.find(item => item.cartItemId === cartItemId);
    
    if (existing) {
      showToast(`Added another ${variant ? variant.label : product.name} to cart`);
    } else {
      showToast(`${variant ? variant.label : product.name} added to cart`);
    }

    setCart(prev => {
      const existingInPrev = prev.find(item => item.cartItemId === cartItemId);
      if (existingInPrev) {
        return prev.map(item => 
          item.cartItemId === cartItemId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { 
        ...product, 
        cartItemId,
        quantity: 1,
        variant_id: variant?.id,
        variant_label: variant?.label,
        price: variant ? variant.price : product.price,
        image_url: variant?.image_url || product.image_url
      }];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(cartItemId);
      return;
    }
    setCart(prev => prev.map(item => 
      item.cartItemId === cartItemId ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      cartTotal, 
      cartCount
    }}>
      {children}
    </CartContext.Provider>
  );
};