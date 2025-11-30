'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UsedBikeSearchInput() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      const citySlug = searchQuery.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      router.push(`/used-bikes/${citySlug}`);
    }
  };

  return (
    <div className="mb-4 max-w-md">
      <div className="relative">
        <input
          type="text"
          placeholder="Enter city name and press Enter"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearch}
          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-4">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
      </div>
      <p className="text-sm text-gray-500 mt-2">Type your city name and press Enter to find used bikes</p>
    </div>
  );
}