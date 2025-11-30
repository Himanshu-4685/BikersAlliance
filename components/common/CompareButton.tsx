'use client';

import { useComparison } from '@/context/ComparisonContext';
import { FiBarChart2 } from 'react-icons/fi';
import { useState } from 'react';

interface CompareButtonProps {
  bike: {
    id: string;
    name: string;
    slug: string;
    image: string;
    price: number;
    brand?: {
      name: string;
      slug: string;
    };
  };
  className?: string;
}

export default function CompareButton({ bike, className = '' }: CompareButtonProps) {
  const { addToComparison, removeFromComparison, isInComparison } = useComparison();
  const [isHovered, setIsHovered] = useState(false);
  
  const inCompare = isInComparison(bike.id);
  
  const handleCompareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (inCompare) {
      removeFromComparison(bike.id);
    } else {
      addToComparison(bike);
    }
  };
  
  return (
    <button
      onClick={handleCompareClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`flex items-center justify-center p-1.5 rounded-md transition-colors ${
        inCompare
          ? 'bg-primary text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      } ${className}`}
      title={inCompare ? 'Remove from comparison' : 'Add to comparison'}
      aria-label={inCompare ? 'Remove from comparison' : 'Add to comparison'}
    >
      <FiBarChart2 className="w-4 h-4" />
      
      {isHovered && (
        <span className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          {inCompare ? 'Remove from compare' : 'Add to compare'}
        </span>
      )}
    </button>
  );
}