'use client';

import { useState, useEffect } from 'react';

// Types
interface BrandFilterProps {
  selectedBrand: string;
  onChange: (brand: string | null) => void;
  bodyType?: string; // Add bodyType prop for filtering brands
}

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  count: number;
}

export default function BrandFilter({ selectedBrand, onChange, bodyType }: BrandFilterProps) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch brands
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const queryParams = new URLSearchParams();
        if (bodyType) {
          queryParams.set('bodyType', bodyType);
        }
        
        const response = await fetch(`/api/brands?${queryParams}`);
        const result = await response.json();
        
        if (result.success) {
          // Clean brand names to handle any whitespace issues
          const cleanedBrands = result.data.brands.map((brand: Brand) => ({
            ...brand,
            name: brand.name.trim().replace(/[\n\r]/g, '')
          }));
          setBrands(cleanedBrands);
        } else {
          console.error('Failed to fetch brands:', result.error);
        }
      } catch (error) {
        console.error('Error fetching brands:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBrands();
  }, [bodyType]);
  
  return (
    <div className="filter-group">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700">Brand</h3>
        {selectedBrand && (
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
        <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
          {/* Show "All Brands" option */}
          <div className="flex items-center">
            <input
              type="radio"
              id="brand-all"
              name="brand-filter"
              checked={selectedBrand === ''}
              onChange={() => onChange(null)}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <label
              htmlFor="brand-all"
              className="ml-2 text-sm text-gray-700 cursor-pointer font-medium"
            >
              All Brands
            </label>
          </div>
          
          {brands.length > 0 ? (
            brands.map((brand) => (
              <div key={brand.id} className="flex items-center">
                <input
                  type="radio"
                  id={`brand-${brand.slug}`}
                  name="brand-filter"
                  checked={selectedBrand.trim() === brand.name.trim()}
                  onChange={() => onChange(selectedBrand.trim() === brand.name.trim() ? null : brand.name)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <label
                  htmlFor={`brand-${brand.slug}`}
                  className="ml-2 text-sm text-gray-700 cursor-pointer hover:text-gray-900"
                >
                  {brand.name}
                  {brand.count > 0 && (
                    <span className="ml-1 text-xs text-gray-500">({brand.count})</span>
                  )}
                </label>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 italic">No brands available for this category</p>
          )}
        </div>
      )}
    </div>
  );
}