'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiSearch, FiX } from 'react-icons/fi';
import SearchBar from './SearchBar';

export default function MobileSearchButton() {
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Close search overlay when route changes
  useEffect(() => {
    const handleRouteChange = () => {
      setIsSearchOpen(false);
    };

    // Listen for route changes
    // Since we're using App Router, we'll close on any navigation
    const handleNavigation = () => {
      setIsSearchOpen(false);
    };

    // Close search when navigation happens
    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', handleNavigation);
      return () => window.removeEventListener('popstate', handleNavigation);
    }
  }, []);

  // Also provide a way for SearchBar to close the overlay
  const closeSearch = () => {
    setIsSearchOpen(false);
  };

  return (
    <>
      {/* Search Toggle Button */}
      <button
        onClick={() => setIsSearchOpen(!isSearchOpen)}
        className="p-1 text-gray-500 transition-colors hover:text-primary"
        aria-label="Toggle search"
      >
        {isSearchOpen ? (
          <FiX className="w-5 h-5" />
        ) : (
          <FiSearch className="w-5 h-5" />
        )}
      </button>

      {/* Mobile Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-white z-50 md:hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex-1 mr-4">
              <SearchBar onNavigate={closeSearch} />
            </div>
            <button
              onClick={() => setIsSearchOpen(false)}
              className="p-2 text-gray-500 hover:text-gray-700"
              aria-label="Close search"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}