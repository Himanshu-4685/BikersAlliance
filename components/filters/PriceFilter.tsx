'use client';

import { useState, useEffect } from 'react';

// Types
interface PriceFilterProps {
  minPrice?: number;
  maxPrice?: number;
  onChange: (minPrice?: number, maxPrice?: number) => void;
}

export default function PriceFilter({ minPrice, maxPrice, onChange }: PriceFilterProps) {
  const [localMin, setLocalMin] = useState<number | undefined>(minPrice);
  const [localMax, setLocalMax] = useState<number | undefined>(maxPrice);
  
  // Update local state when props change
  useEffect(() => {
    setLocalMin(minPrice);
  }, [minPrice]);
  
  useEffect(() => {
    setLocalMax(maxPrice);
  }, [maxPrice]);
  
  // Handle price range change
  const handleApply = () => {
    onChange(localMin, localMax);
  };
  
  return (
    <div className="filter-group">
      <h3 className="mb-3 text-sm font-medium text-gray-700">Price Range</h3>
      
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div>
          <label htmlFor="min-price" className="sr-only">
            Min Price
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span className="text-gray-500">₹</span>
            </div>
            <input
              type="number"
              id="min-price"
              min="0"
              placeholder="Min"
              value={localMin || ''}
              onChange={(e) => setLocalMin(e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full pl-7 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="max-price" className="sr-only">
            Max Price
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span className="text-gray-500">₹</span>
            </div>
            <input
              type="number"
              id="max-price"
              min="0"
              placeholder="Max"
              value={localMax || ''}
              onChange={(e) => setLocalMax(e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full pl-7 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>
        </div>
      </div>
      
      <button
        onClick={handleApply}
        className="w-full px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-600"
      >
        Apply
      </button>
      
      {/* Quick select price ranges */}
      <div className="grid grid-cols-2 gap-2 mt-3">
        <button
          onClick={() => {
            setLocalMin(50000);
            setLocalMax(100000);
            onChange(50000, 100000);
          }}
          className="px-2 py-1 text-xs text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          ₹50K - ₹1L
        </button>
        
        <button
          onClick={() => {
            setLocalMin(100000);
            setLocalMax(150000);
            onChange(100000, 150000);
          }}
          className="px-2 py-1 text-xs text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          ₹1L - ₹1.5L
        </button>
        
        <button
          onClick={() => {
            setLocalMin(150000);
            setLocalMax(200000);
            onChange(150000, 200000);
          }}
          className="px-2 py-1 text-xs text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          ₹1.5L - ₹2L
        </button>
        
        <button
          onClick={() => {
            setLocalMin(200000);
            setLocalMax(undefined);
            onChange(200000, undefined);
          }}
          className="px-2 py-1 text-xs text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          Above ₹2L
        </button>
      </div>
    </div>
  );
}