'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FiSearch, FiArrowRight } from 'react-icons/fi';
import { SearchSuggestion, getSearchSuggestions, debounce } from '@/utils/api/search';

interface SearchSuggestionsProps {
  searchQuery: string;
  onSuggestionClick: (suggestion: SearchSuggestion) => void;
  onSearchSubmit: (query: string) => void;
  isVisible: boolean;
  onClose: () => void;
}

export default function SearchSuggestions({
  searchQuery,
  onSuggestionClick,
  onSearchSubmit,
  isVisible,
  onClose
}: SearchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search function
  const debouncedSearch = useRef(
    debounce(async (query: string) => {
      if (query.length < 1) {
        setSuggestions([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const results = await getSearchSuggestions(query);
        setSuggestions(results);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300)
  ).current;

  // Fetch suggestions when query changes
  useEffect(() => {
    if (searchQuery.trim()) {
      debouncedSearch(searchQuery);
    } else {
      setSuggestions([]);
      setLoading(false);
    }
    setSelectedIndex(-1);
  }, [searchQuery, debouncedSearch]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible || suggestions.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < suggestions.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : suggestions.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
            const suggestion = suggestions[selectedIndex];
            onSuggestionClick(suggestion);
          } else {
            onSearchSubmit(searchQuery);
          }
          break;
        case 'Escape':
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, suggestions, selectedIndex, onSuggestionClick, onSearchSubmit, searchQuery, onClose]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isVisible, onClose]);

  if (!isVisible || (!loading && suggestions.length === 0)) {
    return null;
  }

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'brand':
        return '🏭';
      case 'model':
        return '🔧';
      case 'variant':
        return '🏍️';
      case 'category':
        return '📁';
      default:
        return '🔍';
    }
  };

  const getSuggestionTypeLabel = (type: string) => {
    switch (type) {
      case 'brand':
        return 'Brand';
      case 'model':
        return 'Model';
      case 'variant':
        return '';  // Don't show label for variants to keep it clean
      case 'category':
        return 'Category';
      default:
        return '';
    }
  };

  return (
    <div
      ref={containerRef}
      className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
    >
      {loading ? (
        <div className="p-4 text-center text-gray-500">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span>Searching...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Search suggestions */}
          <div className="py-2">
            {suggestions.map((suggestion, index) => (
              <Link
                key={suggestion.id}
                href={suggestion.href}
                onClick={() => onSuggestionClick(suggestion)}
                className={`flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors ${
                  index === selectedIndex ? 'bg-gray-50' : ''
                }`}
              >
                <div className="flex items-center space-x-3 flex-1">
                  <span className="text-lg">{getSuggestionIcon(suggestion.type)}</span>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className={`${suggestion.type === 'variant' ? 'font-semibold text-gray-900' : 'font-medium text-gray-900'}`}>
                        {suggestion.title}
                      </span>
                      {getSuggestionTypeLabel(suggestion.type) && (
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                          {getSuggestionTypeLabel(suggestion.type)}
                        </span>
                      )}
                    </div>
                    {suggestion.description && (
                      <p className={`text-sm mt-1 ${suggestion.type === 'variant' ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                        {suggestion.description}
                      </p>
                    )}
                  </div>
                </div>
                <FiArrowRight className="w-4 h-4 text-gray-400" />
              </Link>
            ))}
          </div>

          {/* Show all results link */}
          {searchQuery.trim() && (
            <div className="border-t border-gray-100">
              <button
                onClick={() => onSearchSubmit(searchQuery)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <FiSearch className="w-5 h-5 text-primary" />
                  <div>
                    <span className="font-medium text-primary">
                      Search for "{searchQuery}"
                    </span>
                    <p className="text-sm text-gray-500">
                      View all results
                    </p>
                  </div>
                </div>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}