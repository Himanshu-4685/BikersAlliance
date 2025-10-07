'use client';

import { useState, useEffect } from 'react';

// Types
interface EngineFilterProps {
  minEngineCapacity?: number;
  maxEngineCapacity?: number;
  onChange: (min?: number, max?: number) => void;
}

export default function EngineFilter({ minEngineCapacity, maxEngineCapacity, onChange }: EngineFilterProps) {
  const [localMin, setLocalMin] = useState<number | undefined>(minEngineCapacity);
  const [localMax, setLocalMax] = useState<number | undefined>(maxEngineCapacity);
  
  // Update local state when props change
  useEffect(() => {
    setLocalMin(minEngineCapacity);
  }, [minEngineCapacity]);
  
  useEffect(() => {
    setLocalMax(maxEngineCapacity);
  }, [maxEngineCapacity]);
  
  // Handle engine capacity range change
  const handleApply = () => {
    onChange(localMin, localMax);
  };
  
  return (
    <div className="filter-group">
      <h3 className="mb-3 text-sm font-medium text-gray-700">Engine Capacity (cc)</h3>
      
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div>
          <label htmlFor="min-engine" className="sr-only">
            Min Engine Capacity
          </label>
          <input
            type="number"
            id="min-engine"
            min="0"
            placeholder="Min CC"
            value={localMin || ''}
            onChange={(e) => setLocalMin(e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
          />
        </div>
        
        <div>
          <label htmlFor="max-engine" className="sr-only">
            Max Engine Capacity
          </label>
          <input
            type="number"
            id="max-engine"
            min="0"
            placeholder="Max CC"
            value={localMax || ''}
            onChange={(e) => setLocalMax(e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
          />
        </div>
      </div>
      
      <button
        onClick={handleApply}
        className="w-full px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-600"
      >
        Apply
      </button>
      
      {/* Quick select engine capacity ranges */}
      <div className="grid grid-cols-2 gap-2 mt-3">
        <button
          onClick={() => {
            setLocalMin(100);
            setLocalMax(150);
            onChange(100, 150);
          }}
          className="px-2 py-1 text-xs text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          100cc - 150cc
        </button>
        
        <button
          onClick={() => {
            setLocalMin(150);
            setLocalMax(200);
            onChange(150, 200);
          }}
          className="px-2 py-1 text-xs text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          150cc - 200cc
        </button>
        
        <button
          onClick={() => {
            setLocalMin(200);
            setLocalMax(350);
            onChange(200, 350);
          }}
          className="px-2 py-1 text-xs text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          200cc - 350cc
        </button>
        
        <button
          onClick={() => {
            setLocalMin(350);
            setLocalMax(undefined);
            onChange(350, undefined);
          }}
          className="px-2 py-1 text-xs text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          Above 350cc
        </button>
      </div>
    </div>
  );
}