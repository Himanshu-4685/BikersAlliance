'use client';

import { useComparison } from '@/context/ComparisonContext';
import Image from 'next/image';
import Link from 'next/link';
import { FiX, FiBarChart2 } from 'react-icons/fi';
import { useState, useEffect } from 'react';

export default function ComparisonBar() {
  const { comparisonList, removeFromComparison, clearComparison } = useComparison();
  const [isVisible, setIsVisible] = useState(false);
  
  // Only show comparison bar if there are bikes to compare
  useEffect(() => {
    setIsVisible(comparisonList.length > 0);
  }, [comparisonList.length]);
  
  if (!isVisible) {
    return null;
  }
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg z-50 border-t">
      <div className="container py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FiBarChart2 className="text-primary w-5 h-5 mr-2" />
            <span className="text-sm font-medium">Compare Bikes ({comparisonList.length}/4)</span>
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
        
        <div className="grid grid-cols-4 gap-4 mt-3">
          {[...Array(4)].map((_, index) => {
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
                      <div className="relative w-12 h-12 mb-1">
                        <Image 
                          src={bike.image}
                          alt={bike.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <span className="text-xs font-medium line-clamp-1">{bike.name}</span>
                      <span className="text-xs text-gray-500">₹{bike.price.toLocaleString('en-IN')}</span>
                    </div>
                  </>
                ) : (
                  <span className="text-xs text-gray-400">Add bike to compare</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}