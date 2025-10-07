'use client';

import { useState, useEffect } from 'react';

// Types
interface MileageFilterProps {
  minMileage?: number;
  onChange: (minMileage?: number) => void;
}

export default function MileageFilter({ minMileage, onChange }: MileageFilterProps) {
  const [localMin, setLocalMin] = useState<number | undefined>(minMileage);
  
  // Update local state when props change
  useEffect(() => {
    setLocalMin(minMileage);
  }, [minMileage]);
  
  // Handle mileage change
  const handleApply = () => {
    onChange(localMin);
  };
  
  // Predefined mileage ranges
  const mileageOptions = [
    { value: 30, label: 'Above 30 kmpl' },
    { value: 40, label: 'Above 40 kmpl' },
    { value: 50, label: 'Above 50 kmpl' },
    { value: 60, label: 'Above 60 kmpl' }
  ];
  
  return (
    <div className="filter-group">
      <h3 className="mb-3 text-sm font-medium text-gray-700">Mileage</h3>
      
      <div className="mb-3">
        <label htmlFor="min-mileage" className="sr-only">
          Min Mileage
        </label>
        <div className="relative">
          <input
            type="number"
            id="min-mileage"
            min="0"
            placeholder="Min kmpl"
            value={localMin || ''}
            onChange={(e) => setLocalMin(e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <span className="text-xs text-gray-500">kmpl</span>
          </div>
        </div>
      </div>
      
      <button
        onClick={handleApply}
        className="w-full px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-600"
      >
        Apply
      </button>
      
      {/* Quick select mileage options */}
      <div className="grid grid-cols-2 gap-2 mt-3">
        {mileageOptions.map(option => (
          <button
            key={option.value}
            onClick={() => {
              setLocalMin(option.value);
              onChange(option.value);
            }}
            className={`px-2 py-1 text-xs rounded-md ${
              localMin === option.value
                ? 'bg-primary text-white'
                : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}