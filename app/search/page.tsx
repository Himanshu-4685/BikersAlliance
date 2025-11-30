'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FiSearch, FiChevronRight, FiStar, FiHeart } from 'react-icons/fi';
import { generateSlug } from '@/lib/slug-utils';

interface SearchResult {
  variant_id: number;
  variant_name: string;
  on_road_price?: number;
  model_name?: string;
  brand_name?: string;
  image_url?: string;
  rating?: number;
  mileage?: string;
  engine_capacity?: string;
}

interface BrandSuggestion {
  id: string;
  title: string;
  type: string;
  brandName?: string;
  href: string;
  description?: string;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<SearchResult[]>([]);
  const [brandSuggestions, setBrandSuggestions] = useState<BrandSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (query) {
      fetchSearchResults(query);
    } else {
      setLoading(false);
    }
  }, [query]);

  const fetchSearchResults = async (searchQuery: string) => {
    try {
      setLoading(true);
      setError(null);

      // Use the existing search API
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();

      if (data.success) {
        // Extract bike results from the search response
        const bikeResults = data.data.results?.bikes || [];
        setResults(bikeResults);
        
        // Extract brand suggestions
        const suggestions = data.data.suggestions || [];
        const brands = suggestions.filter((s: any) => s.type === 'brand');
        setBrandSuggestions(brands);
      } else {
        setError(data.error || 'Failed to fetch search results');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to perform search');
    } finally {
      setLoading(false);
    }
  };

  const handleBikeClick = (bike: SearchResult) => {
    const fullName = bike.model_name ? `${bike.model_name} ${bike.variant_name}` : bike.variant_name;
    const slug = generateSlug(fullName);
    return `/bikes/${slug}`;
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="container py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="h-40 bg-gray-200 rounded mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Breadcrumbs */}
      <div className="bg-white border-b">
        <div className="container py-4">
          <div className="flex items-center text-sm text-gray-500">
            <Link href="/" className="hover:text-primary">Home</Link>
            <FiChevronRight className="mx-2" />
            <span className="text-gray-900">Search Results</span>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Search Results for "{query}"
          </h1>
          <p className="text-gray-600">
            {results.length > 0 
              ? `Found ${results.length} bike${results.length === 1 ? '' : 's'}`
              : brandSuggestions.length > 0
              ? `Found ${brandSuggestions.length} brand${brandSuggestions.length === 1 ? '' : 's'}`
              : 'No results found'
            }
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Brand Results */}
        {brandSuggestions.length > 0 && results.length === 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Brands</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {brandSuggestions.map((brand) => (
                <Link
                  key={brand.id}
                  href={brand.href}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 group border"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg group-hover:text-primary transition-colors">
                        {brand.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {brand.description}
                      </p>
                    </div>
                    <div className="ml-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-bold text-lg">
                          {brand.title.charAt(0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Bike Search Results */}
        {results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((bike) => (
              <Link
                key={bike.variant_id}
                href={handleBikeClick(bike)}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 group"
              >
                {/* Bike Image */}
                <div className="relative h-40 mb-4">
                  {bike.image_url ? (
                    <Image
                      src={bike.image_url}
                      alt={bike.variant_name}
                      fill
                      className="object-contain group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
                      <span className="text-gray-400">No Image</span>
                    </div>
                  )}
                </div>

                {/* Bike Details */}
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 text-lg group-hover:text-primary transition-colors">
                      {bike.brand_name && `${bike.brand_name} `}
                      {bike.model_name ? `${bike.model_name} ${bike.variant_name}` : bike.variant_name}
                    </h3>
                    <button
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        // Add to wishlist functionality
                      }}
                    >
                      <FiHeart className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Price */}
                  <div className="mb-3">
                    <span className="text-2xl font-bold text-primary">
                      ₹{bike.on_road_price?.toLocaleString('en-IN') || 'N/A'}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">onwards</span>
                  </div>

                  {/* Specifications */}
                  <div className="flex justify-between text-sm text-gray-600 mb-4">
                    {bike.engine_capacity && (
                      <div>
                        <span className="font-medium">{bike.engine_capacity}</span>
                        <div className="text-xs text-gray-500">Engine</div>
                      </div>
                    )}
                    {bike.mileage && (
                      <div>
                        <span className="font-medium">{bike.mileage}</span>
                        <div className="text-xs text-gray-500">Mileage</div>
                      </div>
                    )}
                    {bike.rating && (
                      <div className="flex items-center">
                        <FiStar className="w-4 h-4 text-yellow-400 mr-1" />
                        <span className="font-medium">{bike.rating}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="flex space-x-2">
                    <div className="flex-1 bg-primary text-white text-center py-2 rounded group-hover:bg-primary-600 transition-colors">
                      View Details
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          !loading && brandSuggestions.length === 0 && (
            <div className="text-center py-12">
              <FiSearch className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No bikes found</h3>
              <p className="text-gray-600 mb-6">
                Try searching with different keywords or browse our popular bikes below.
              </p>
              <Link
                href="/bikes"
                className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                Browse All Bikes
              </Link>
            </div>
          )
        )}

        {/* Popular Searches */}
        {results.length === 0 && brandSuggestions.length === 0 && !loading && (
          <div className="mt-12">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Popular Searches</h3>
            <div className="flex flex-wrap gap-2">
              {[
                'KTM Duke 390',
                'Honda Activa',
                'Yamaha R15',
                'Royal Enfield Classic',
                'TVS Apache',
                'Bajaj Pulsar',
                'Hero Splendor',
                'Suzuki Gixxer'
              ].map((term) => (
                <Link
                  key={term}
                  href={`/search?q=${encodeURIComponent(term)}`}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:border-primary hover:text-primary transition-colors"
                >
                  {term}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}