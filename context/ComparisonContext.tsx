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
  maxComparisons: number;
  addToComparison: (bike: Bike) => void;
  removeFromComparison: (bikeId: string) => void;
  clearComparison: () => void;
  isInComparison: (bikeId: string) => boolean;
  canAddMore: () => boolean;
  setMaxComparisons: (max: number) => void;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export const ComparisonProvider = ({ children }: { children: ReactNode }) => {
  const [comparisonList, setComparisonList] = useState<Bike[]>([]);
  const [maxComparisons, setMaxComparisonsState] = useState<number>(4); // Default to 4, but can be changed
  
  // Load comparison list from localStorage on component mount
  useEffect(() => {
    const savedComparison = localStorage.getItem('comparisonList');
    const savedMaxComparisons = localStorage.getItem('maxComparisons');
    
    if (savedComparison) {
      try {
        setComparisonList(JSON.parse(savedComparison));
      } catch (error) {
        console.error('Failed to parse comparison list from localStorage', error);
        localStorage.removeItem('comparisonList');
      }
    }
    
    if (savedMaxComparisons) {
      try {
        setMaxComparisonsState(parseInt(savedMaxComparisons));
      } catch (error) {
        console.error('Failed to parse max comparisons from localStorage', error);
        localStorage.removeItem('maxComparisons');
      }
    }
  }, []);
  
  // Save comparison list to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('comparisonList', JSON.stringify(comparisonList));
  }, [comparisonList]);

  // Save max comparisons to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('maxComparisons', maxComparisons.toString());
  }, [maxComparisons]);
  
  const addToComparison = (bike: Bike) => {
    if (comparisonList.length < maxComparisons && !isInComparison(bike.id)) {
      setComparisonList([...comparisonList, bike]);
    } else if (comparisonList.length >= maxComparisons) {
      // Show toast or alert that max bikes can be compared
      alert(`You can compare up to ${maxComparisons} bikes at a time`);
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

  const canAddMore = () => {
    return comparisonList.length < maxComparisons;
  };

  const setMaxComparisons = (max: number) => {
    if (max < 2) max = 2; // Minimum 2 comparisons
    if (max > 6) max = 6; // Maximum 6 comparisons for UI reasons
    
    setMaxComparisonsState(max);
    
    // If current list exceeds new max, trim it
    if (comparisonList.length > max) {
      setComparisonList(comparisonList.slice(0, max));
    }
  };
  
  return (
    <ComparisonContext.Provider
      value={{
        comparisonList,
        maxComparisons,
        addToComparison,
        removeFromComparison,
        clearComparison,
        isInComparison,
        canAddMore,
        setMaxComparisons
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