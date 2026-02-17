'use client';
import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { CartProvider } from '../context/CartContext';
import { AIProvider } from '../context/AIContext';
import { NavigationProvider } from '../context/NavigationContext';

export function Providers({ children }: { children: React.ReactNode }) {
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
        <AIProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AIProvider>
    </NavigationProvider>
  );
}