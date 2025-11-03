'use client';

import { useState, useEffect } from 'react';

// Types
interface EngineTypeFilterProps {
  selectedEngineType: string;
  onChange: (engineType: string | null) => void;
}

interface EngineType {
  id: string;
  name: string;
  slug: string;
  count: number;
}

export default function EngineTypeFilter({ selectedEngineType, onChange }: EngineTypeFilterProps) {
  const [engineTypes, setEngineTypes] = useState<EngineType[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch engine types data
  useEffect(() => {
    const fetchEngineTypes = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/engine-types');
        if (response.ok) {
          const data = await response.json();
          setEngineTypes(data.engineTypes || []);
        }
      } catch (error) {
        console.error('Error fetching engine types:', error);
        // Fallback to static engine types if API fails
        setEngineTypes([
          { id: '4-stroke', name: '4-Stroke', slug: '4-stroke', count: 0 },
          { id: '2-stroke', name: '2-Stroke', slug: '2-stroke', count: 0 },
          { id: 'electric', name: 'Electric', slug: 'electric', count: 0 },
          { id: 'single-cylinder', name: 'Single Cylinder', slug: 'single-cylinder', count: 0 },
          { id: 'multi-cylinder', name: 'Multi Cylinder', slug: 'multi-cylinder', count: 0 }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchEngineTypes();
  }, []);

  return (
    <div className="filter-group">
      <h3 className="mb-3 text-sm font-medium text-gray-700">Engine Type</h3>
      
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
          {engineTypes.map((engineType) => (
            <div key={engineType.id} className="flex items-center">
              <input
                type="radio"
                id={`engine-type-${engineType.slug}`}
                name="engine-type-filter"
                checked={selectedEngineType === engineType.slug}
                onChange={() => onChange(selectedEngineType === engineType.slug ? null : engineType.slug)}
                className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
              />
              <label
                htmlFor={`engine-type-${engineType.slug}`}
                className="ml-2 text-sm text-gray-700 cursor-pointer"
              >
                {engineType.name} {engineType.count > 0 && `(${engineType.count})`}
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}