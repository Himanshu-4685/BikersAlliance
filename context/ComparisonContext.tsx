'use client';

import { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';

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
  addMultipleToComparison: (bikes: Bike[]) => void; // New method for adding multiple bikes
  removeFromComparison: (bikeId: string) => void;
  clearComparison: () => void;
  isInComparison: (bikeId: string) => boolean;
  canAddMore: () => boolean;
  setMaxComparisons: (max: number) => void;
  syncComparisonList: (bikes: Bike[]) => void; // Method to sync from compare page
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export const ComparisonProvider = ({ children }: { children: ReactNode }) => {
  const [comparisonList, setComparisonList] = useState<Bike[]>([]);
  const [maxComparisons, setMaxComparisonsState] = useState<number>(4); // Fixed to 4 to match database
  
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

  const addMultipleToComparison = (bikes: Bike[]) => {
    // Filter out bikes that are already in comparison and respect max limit
    const uniqueBikes = bikes.filter(bike => !isInComparison(bike.id));
    const bikesToAdd = uniqueBikes.slice(0, maxComparisons - comparisonList.length);
    
    if (bikesToAdd.length > 0) {
      setComparisonList([...comparisonList, ...bikesToAdd]);
    }
  };
  
  const removeFromComparison = (bikeId: string) => {
    setComparisonList(comparisonList.filter(bike => bike.id !== bikeId));
  };
  
  const clearComparison = () => {
    setComparisonList([]);
    // Ensure localStorage is cleared immediately
    localStorage.removeItem('comparisonList');
  };
  
  const isInComparison = (bikeId: string) => {
    return comparisonList.some(bike => bike.id === bikeId);
  };

  const canAddMore = () => {
    return comparisonList.length < maxComparisons;
  };

  const setMaxComparisons = (max: number) => {
    // Fixed to 4 to match database schema - don't allow changes
    return; // Do nothing, always keep at 4
  };
  
  const syncComparisonList = useCallback((bikes: Bike[]) => {
    setComparisonList(bikes.slice(0, maxComparisons)); // Ensure we don't exceed max limit
  }, [maxComparisons]);

  return (
    <ComparisonContext.Provider
      value={{
        comparisonList,
        maxComparisons,
        addToComparison,
        addMultipleToComparison,
        removeFromComparison,
        clearComparison,
        isInComparison,
        canAddMore,
        setMaxComparisons,
        syncComparisonList
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