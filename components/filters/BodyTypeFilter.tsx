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
  const [bodyTypes, setBodyTypes] = useState<BodyType[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch real counts for each body type
  useEffect(() => {
    const fetchBodyTypeCounts = async () => {
      try {
        const bodyTypeCounts = await Promise.all(
          PREDEFINED_BODY_TYPES.map(async (bodyType) => {
            try {
              const response = await fetch(`/api/bikes?bodyType=${bodyType.slug}&limit=1`);
              const result = await response.json();
              const count = result.success ? (result.data.pagination?.total || 0) : 0;
              return { ...bodyType, count };
            } catch (error) {
              console.error(`Error fetching count for ${bodyType.name}:`, error);
              return { ...bodyType, count: 0 };
            }
          })
        );

        // Filter out body types with 0 count
        const nonEmptyBodyTypes = bodyTypeCounts.filter(bt => bt.count > 0);
        setBodyTypes(nonEmptyBodyTypes);
      } catch (error) {
        console.error('Error fetching body type counts:', error);
        // Fallback to showing body types without counts
        setBodyTypes(PREDEFINED_BODY_TYPES.map(bt => ({ ...bt, count: 0 })));
      } finally {
        setLoading(false);
      }
    };

    fetchBodyTypeCounts();
  }, []);
  
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
      
      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex items-center">
              <div className="w-4 h-4 mr-2 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      ) : (
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
      )}
    </div>
  );
}