import React, { createContext, useContext, useState } from 'react';

interface AIContextType {
  isAIOpen: boolean;
  setIsAIOpen: (isOpen: boolean) => void;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) throw new Error('useAI must be used within an AIProvider');
  return context;
};

export const AIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAIOpen, setIsAIOpen] = useState(false);

  return (
    <AIContext.Provider value={{ isAIOpen, setIsAIOpen }}>
      {children}
    </AIContext.Provider>
  );
};