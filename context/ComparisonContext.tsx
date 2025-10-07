'use client';

import { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface Bike {
  id: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  brand?: {
    name: string;
    slug: string;
  };
}

interface ComparisonContextType {
  comparisonList: Bike[];
  addToComparison: (bike: Bike) => void;
  removeFromComparison: (bikeId: string) => void;
  clearComparison: () => void;
  isInComparison: (bikeId: string) => boolean;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export const ComparisonProvider = ({ children }: { children: ReactNode }) => {
  const [comparisonList, setComparisonList] = useState<Bike[]>([]);
  
  // Load comparison list from localStorage on component mount
  useEffect(() => {
    const savedComparison = localStorage.getItem('comparisonList');
    if (savedComparison) {
      try {
        setComparisonList(JSON.parse(savedComparison));
      } catch (error) {
        console.error('Failed to parse comparison list from localStorage', error);
        localStorage.removeItem('comparisonList');
      }
    }
  }, []);
  
  // Save comparison list to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('comparisonList', JSON.stringify(comparisonList));
  }, [comparisonList]);
  
  const addToComparison = (bike: Bike) => {
    if (comparisonList.length < 4 && !isInComparison(bike.id)) {
      setComparisonList([...comparisonList, bike]);
    } else if (comparisonList.length >= 4) {
      // Show toast or alert that max 4 bikes can be compared
      alert('You can compare up to 4 bikes at a time');
    }
  };
  
  const removeFromComparison = (bikeId: string) => {
    setComparisonList(comparisonList.filter(bike => bike.id !== bikeId));
  };
  
  const clearComparison = () => {
    setComparisonList([]);
  };
  
  const isInComparison = (bikeId: string) => {
    return comparisonList.some(bike => bike.id === bikeId);
  };
  
  return (
    <ComparisonContext.Provider
      value={{
        comparisonList,
        addToComparison,
        removeFromComparison,
        clearComparison,
        isInComparison,
      }}
    >
      {children}
    </ComparisonContext.Provider>
  );
};

export const useComparison = () => {
  const context = useContext(ComparisonContext);
  if (context === undefined) {
    throw new Error('useComparison must be used within a ComparisonProvider');
  }
  return context;
};