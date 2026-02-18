'use client';
import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { CartProvider } from '../context/CartContext';
import { NavigationProvider } from '../context/NavigationContext';

export const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();

  const navValue = {
    push: (path: string) => router.push(path),
    replace: (path: string) => router.replace(path),
    back: () => router.back(),
    pathname: pathname || '/',
    isNext: true
  };

  return (
    <NavigationProvider value={navValue}>
      <CartProvider>
        {children}
      </CartProvider>
    </NavigationProvider>
  );
};