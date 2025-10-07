'use client';

import { useState, useEffect } from 'react';

// Types
interface CategoryFilterProps {
  selectedCategory: string;
  onChange: (category: string | null) => void;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  count: number;
}

export default function CategoryFilter({ selectedCategory, onChange }: CategoryFilterProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const result = await response.json();
        
        if (result.success) {
          setCategories(result.data.categories);
        } else {
          console.error('Failed to fetch categories:', result.error);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);
  
  return (
    <div className="filter-group">
      <h3 className="mb-3 text-sm font-medium text-gray-700">Category</h3>
      
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
          {categories.map((category) => (
            <div key={category.id} className="flex items-center">
              <input
                type="radio"
                id={`category-${category.slug}`}
                name="category-filter"
                checked={selectedCategory === category.slug}
                onChange={() => onChange(selectedCategory === category.slug ? null : category.slug)}
                className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
              />
              <label
                htmlFor={`category-${category.slug}`}
                className="ml-2 text-sm text-gray-700 cursor-pointer"
              >
                {category.name} ({category.count})
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}