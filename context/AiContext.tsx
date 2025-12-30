
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AiContextType {
  isAiOpen: boolean;
  openAiChef: (initialQuery?: string) => void;
  closeAiChef: () => void;
  initialQuery: string;
}

const AiContext = createContext<AiContextType | undefined>(undefined);

export const AiProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [initialQuery, setInitialQuery] = useState('');

  const openAiChef = (query: string = '') => {
    setInitialQuery(query);
    setIsAiOpen(true);
  };

  const closeAiChef = () => {
    setIsAiOpen(false);
    setInitialQuery('');
  };

  return (
    <AiContext.Provider value={{ isAiOpen, openAiChef, closeAiChef, initialQuery }}>
      {children}
    </AiContext.Provider>
  );
};

export const useAi = () => {
  const context = useContext(AiContext);
  if (!context) {
    throw new Error('useAi must be used within a AiProvider');
  }
  return context;
};
