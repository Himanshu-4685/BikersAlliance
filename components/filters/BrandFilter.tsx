'use client';

import { useState, useEffect } from 'react';

// Types
interface BrandFilterProps {
  selectedBrand: string;
  onChange: (brand: string | null) => void;
}

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  count: number;
}

export default function BrandFilter({ selectedBrand, onChange }: BrandFilterProps) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch brands
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch('/api/brands');
        const result = await response.json();
        
        if (result.success) {
          setBrands(result.data.brands);
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
  }, []);
  
  return (
    <div className="filter-group">
      <h3 className="mb-3 text-sm font-medium text-gray-700">Brand</h3>
      
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
          {brands.map((brand) => (
            <div key={brand.id} className="flex items-center">
              <input
                type="radio"
                id={`brand-${brand.slug}`}
                name="brand-filter"
                checked={selectedBrand === brand.slug}
                onChange={() => onChange(selectedBrand === brand.slug ? null : brand.slug)}
                className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
              />
              <label
                htmlFor={`brand-${brand.slug}`}
                className="ml-2 text-sm text-gray-700 cursor-pointer"
              >
                {brand.name} ({brand.count})
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}