'use client';

import { useComparison } from '@/context/ComparisonContext';
import Image from 'next/image';
import Link from 'next/link';
import { FiX, FiBarChart2 } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ComparisonBar() {
  const { comparisonList, removeFromComparison, clearComparison, maxComparisons } = useComparison();
  const [isVisible, setIsVisible] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const pathname = usePathname();
  
  // Check if we're on compare page
  const isComparePage = pathname === '/compare';
  
  useEffect(() => {
    if (isComparePage) {
      setIsVisible(true); // Always visible on compare page
    } else {
      setIsVisible(comparisonList.length > 0); // Only when bikes selected on other pages
    }
  }, [comparisonList.length, isComparePage]);

  // Track if we're on compare page for proper state management
  useEffect(() => {
    if (isComparePage) {
      sessionStorage.setItem('wasOnComparePage', 'true');
    } else {
      // Only clear the session storage when leaving compare page, not the comparison itself
      sessionStorage.removeItem('wasOnComparePage');
    }
  }, [isComparePage]);

  const handleImageError = (bikeId: string) => {
    setImageErrors(prev => ({ ...prev, [bikeId]: true }));
  };

  const getImageSrc = (bike: any) => {
    if (imageErrors[bike.id]) {
      return '/demo.avif';
    }
    return bike.image || '/demo.avif';
  };
  
  if (!isVisible) {
    return null;
  }
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg z-50 border-t">
      <div className="container py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FiBarChart2 className="text-primary w-5 h-5 mr-2" />
            <span className="text-sm font-medium">Compare Bikes ({comparisonList.length}/{maxComparisons})</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={clearComparison}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Clear all
            </button>
            
            {comparisonList.length >= 2 && (
              <Link 
                href="/compare" 
                className="bg-primary text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-primary-600"
              >
                Compare Now
              </Link>
            )}
          </div>
        </div>
        
        <div className={`grid gap-4 mt-3 ${
          maxComparisons === 2 ? 'grid-cols-2' :
          maxComparisons === 3 ? 'grid-cols-3' :
          maxComparisons === 4 ? 'grid-cols-4' :
          maxComparisons === 5 ? 'grid-cols-5' :
          'grid-cols-6'
        }`}>
          {[...Array(maxComparisons)].map((_, index) => {
            const bike = comparisonList[index];
            
            return (
              <div 
                key={index} 
                className="bg-gray-50 border rounded-md p-2 h-24 flex items-center justify-center relative"
              >
                {bike ? (
                  <>
                    <button 
                      onClick={() => removeFromComparison(bike.id)}
                      className="absolute top-1 right-1 text-gray-500 hover:text-red-500 bg-white rounded-full p-0.5"
                      aria-label="Remove from comparison"
                    >
                      <FiX size={14} />
                    </button>
                    
                    <div className="flex flex-col items-center text-center">
                      <div className="relative w-12 h-12 mb-1 bg-gray-100 rounded overflow-hidden">
                        <Image 
                          src={getImageSrc(bike)}
                          alt={bike.name}
                          fill
                          className="object-contain"
                          sizes="48px"
                          onError={() => handleImageError(bike.id)}
                        />
                      </div>
                      <span className="text-xs font-medium line-clamp-1">{bike.name}</span>
                      <span className="text-xs text-gray-500">₹{bike.price.toLocaleString('en-IN')}</span>
                    </div>
                  </>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}