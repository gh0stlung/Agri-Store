import React, { createContext, useContext } from 'react';

export interface NavigationContextType {
  push: (path: string) => void;
  replace: (path: string) => void;
  back: () => void;
  pathname: string;
  isNext: boolean;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

export const NavigationProvider: React.FC<{ children: React.ReactNode, value: NavigationContextType }> = ({ children, value }) => {
  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
};