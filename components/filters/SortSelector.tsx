'use client';

import { useState, useEffect, useRef } from 'react';
import { FiChevronDown } from 'react-icons/fi';

// Types
interface SortSelectorProps {
  sortBy: string;
  sortOrder: string;
  onChange: (sortBy: string, sortOrder: string) => void;
}

export default function SortSelector({ sortBy, sortOrder, onChange }: SortSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Sort options
  const sortOptions = [
    { id: 'price-asc', label: 'Price: Low to High', sortBy: 'price', sortOrder: 'asc' },
    { id: 'price-desc', label: 'Price: High to Low', sortBy: 'price', sortOrder: 'desc' },
    { id: 'name-asc', label: 'Name: A to Z', sortBy: 'name', sortOrder: 'asc' },
    { id: 'name-desc', label: 'Name: Z to A', sortBy: 'name', sortOrder: 'desc' },
    { id: 'latest', label: 'Newest First', sortBy: 'latest', sortOrder: 'desc' }
  ];
  
  // Get current sort option label
  const getCurrentSortLabel = () => {
    const current = sortOptions.find(option => option.sortBy === sortBy && option.sortOrder === sortOrder);
    return current ? current.label : 'Sort By';
  };
  
  // Handle sort option selection
  const handleSortChange = (sortBy: string, sortOrder: string) => {
    onChange(sortBy, sortOrder);
    setIsOpen(false);
  };
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-4 py-2 text-sm bg-white border rounded-md shadow-sm hover:bg-gray-50"
      >
        <span>{getCurrentSortLabel()}</span>
        <FiChevronDown className="w-4 h-4 ml-2" />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 z-10 w-48 mt-1 overflow-hidden bg-white border rounded-md shadow-lg">
          {sortOptions.map(option => (
            <button
              key={option.id}
              onClick={() => handleSortChange(option.sortBy, option.sortOrder)}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                sortBy === option.sortBy && sortOrder === option.sortOrder
                  ? 'bg-gray-50 text-primary font-medium'
                  : 'text-gray-800'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}