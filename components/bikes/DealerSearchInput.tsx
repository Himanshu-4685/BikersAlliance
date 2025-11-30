'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DealerSearchInput() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      const citySlug = searchQuery.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      router.push(`/used-bikes/${citySlug}`);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
      <h3 className="font-medium text-gray-900 mb-3">I am looking to buy a second hand bike in</h3>
      <div className="relative">
        <input
          type="text"
          placeholder="Enter your city and press Enter"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearch}
          className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:ring-1 focus:ring-primary focus:border-primary"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-2">Press Enter to search for bikes in your city</p>
    </div>
  );
}