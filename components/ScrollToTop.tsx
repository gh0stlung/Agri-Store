'use client';
import { useEffect } from 'react';
import { useNavigation } from '../context/NavigationContext';

export const ScrollToTop = () => {
  const { pathname } = useNavigation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};