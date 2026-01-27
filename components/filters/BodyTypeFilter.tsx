'use client';

import { useState, useEffect } from 'react';

// Types
interface BodyTypeFilterProps {
  selectedBodyType: string;
  onChange: (bodyType: string | null) => void;
}

interface BodyType {
  id?: string;
  name: string;
  slug: string;
  count: number;
}

// Predefined body types that match the spotlight section
const PREDEFINED_BODY_TYPES = [
  { name: 'Commuter', slug: 'commuter' },
  { name: 'Sports', slug: 'sports' },
  { name: 'Cruiser', slug: 'cruiser' },
  { name: 'Adventure', slug: 'adventure' },
  { name: 'Scooter', slug: 'scooter' },
  { name: 'Off-Road', slug: 'off-road' },
  { name: 'Electric', slug: 'electric' },
  { name: 'Moped', slug: 'moped' },
  { name: 'Naked', slug: 'naked' },
  { name: 'Super', slug: 'super' },
  { name: 'Tourer', slug: 'tourer' },
  { name: 'Touring', slug: 'touring' },
  { name: 'Scrambler', slug: 'scrambler' },
  { name: 'Street', slug: 'street' },
  { name: 'Cafe Racer', slug: 'cafe-racer' },
  { name: 'Dirt', slug: 'dirt' },
  { name: 'Roadster', slug: 'roadster' }
];

export default function BodyTypeFilter({ selectedBodyType, onChange }: BodyTypeFilterProps) {
  // Use simplified hardcoded list for now to match spotlight section
  const bodyTypes = [
    { name: 'Commuter', slug: 'commuter', count: 50 },
    { name: 'Sports', slug: 'sports', count: 25 },
    { name: 'Cruiser', slug: 'cruiser', count: 15 },
    { name: 'Adventure', slug: 'adventure', count: 20 },
    { name: 'Scooter', slug: 'scooter', count: 35 },
    { name: 'Moped', slug: 'moped', count: 18 },
    { name: 'Electric', slug: 'electric', count: 12 },
    { name: 'Naked', slug: 'naked', count: 8 },
    { name: 'Touring', slug: 'touring', count: 10 },
    { name: 'Street', slug: 'street', count: 14 },
    { name: 'Roadster', slug: 'roadster', count: 6 }
  ];
  
  return (
    <div className="filter-group">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700">Body Type</h3>
        {selectedBodyType && (
          <button
            onClick={() => onChange(null)}
            className="text-xs text-gray-500 hover:text-red-500"
          >
            Clear
          </button>
        )}
      </div>
      
      <div className="space-y-2">
        {bodyTypes.map((bodyType, index) => (
          <div key={bodyType.slug || index} className="flex items-center">
            <input
              type="radio"
              id={`bodytype-${bodyType.slug || index}`}
              name="bodytype-filter"
              checked={selectedBodyType === bodyType.slug}
              onChange={() => onChange(selectedBodyType === bodyType.slug ? null : bodyType.slug)}
              className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
            />
            <label
              htmlFor={`bodytype-${bodyType.slug || index}`}
              className="ml-2 text-sm text-gray-700 cursor-pointer"
            >
              {bodyType.name} ({bodyType.count})
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}