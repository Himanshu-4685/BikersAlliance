"use client";

import { useState, useEffect } from "react";
import { FiSearch } from 'react-icons/fi';
import { createClient } from "@/utils/supabase/client";

interface Variant {
  variant_id: number;
  variant_name: string;
}

export default function SearchBar() {
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<Variant[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  // Fetch variants from Supabase using the RPC function
  useEffect(() => {
    const fetchResults = async () => {
      if (query.trim().length < 1) {
        setResults([]);
        setShowDropdown(false);
        return;
      }

      setLoading(true);

      const supabase = createClient();
      const { data, error } = await supabase.rpc("search_variants", {
        search_text: query,
      });

      if (error) {
        console.error("Error fetching search results:", error.message);
      } else if (data) {
        setResults(data as Variant[]);
        setShowDropdown(true);
      }

      setLoading(false);
    };

    const timeout = setTimeout(fetchResults, 300); // debounce 300ms
    return () => clearTimeout(timeout);
  }, [query]);

  const handleSelect = (variant: Variant) => {
    setQuery(variant.variant_name);
    setShowDropdown(false);
  };

  const handleFocus = () => {
    if (query.trim().length >= 1 && results.length > 0) {
      setShowDropdown(true);
    }
  };

  const handleBlur = () => {
    // Delay hiding results to allow clicking on them
    setTimeout(() => setShowDropdown(false), 200);
  };

  return (
    <div className="w-full max-w-2xl relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Search Bikes or Scooters eg. KTM, Honda Activa"
          className="w-full py-2 pl-4 pr-12 text-sm text-gray-900 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          autoComplete="off"
        />
        <div className="absolute inset-y-0 right-0 flex items-center px-4">
          <FiSearch className="w-4 h-4 text-gray-500" />
        </div>
        
        {/* Search Results */}
        {(loading || showDropdown) && (
          <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 z-50 max-h-60 overflow-y-auto">
            {loading && (
              <div className="px-4 py-3 text-sm text-gray-500 flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                Loading...
              </div>
            )}
            
            {!loading && results.length > 0 && results.map((variant) => (
              <div
                key={variant.variant_id}
                className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex justify-between items-center border-b border-gray-100 last:border-b-0 transition-colors"
                onClick={() => handleSelect(variant)}
              >
                <span className="text-sm text-gray-900 font-medium">{variant.variant_name}</span>
                <span className="text-xs text-gray-500 capitalize bg-gray-100 px-2 py-1 rounded-full">
                  variant
                </span>
              </div>
            ))}
            
            {!loading && results.length === 0 && query.trim().length > 0 && (
              <div className="px-4 py-3 text-sm text-gray-500">
                No results found for "{query}"
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}