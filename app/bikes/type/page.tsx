'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiChevronRight, FiGrid, FiList, FiSearch } from 'react-icons/fi';
import { BodyTypesApiResponse, BodyType } from '@/types/bike';
import BodyTypeCard from '@/components/body-types/BodyTypeCard';
import { getBodyTypeIcon } from '@/components/body-types/utils';

export default function BikeTypesPage() {
  const [bodyTypes, setBodyTypes] = useState<BodyType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Fetch body types
  useEffect(() => {
    const fetchBodyTypes = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/body-types');
        
        if (!response.ok) {
          throw new Error('Failed to fetch body types');
        }

        const data: BodyTypesApiResponse = await response.json();
        setBodyTypes(data.bodyTypes);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchBodyTypes();
  }, []);

  // Filter body types based on search
  const filteredBodyTypes = bodyTypes.filter(bodyType =>
    bodyType.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header skeleton */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
          </div>
        </div>
        
        {/* Content skeleton */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                <div className="h-12 w-12 bg-gray-200 rounded mb-4"></div>
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Bike Types</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <FiChevronRight className="w-4 h-4" />
            <Link href="/bikes" className="hover:text-blue-600">Bikes</Link>
            <FiChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">By Type</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Browse Bikes by Type
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover motorcycles and scooters organized by their design and purpose. 
              Find the perfect bike that matches your riding style and needs.
            </p>
          </div>

          {/* Search and View Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search bike types..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">View:</span>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <FiGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <FiList className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 text-sm text-gray-600">
            {filteredBodyTypes.length} bike type{filteredBodyTypes.length !== 1 ? 's' : ''} found
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {filteredBodyTypes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No bike types found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search term to find bike types
            </p>
            <button
              onClick={() => setSearchTerm('')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className={`${
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }`}>
            {filteredBodyTypes.map((bodyType) => (
              bodyType && bodyType.name && bodyType.slug ? (
                <Link
                  key={bodyType.slug}
                  href={`/bikes/type/${bodyType.slug}`}
                  className={`block bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 group ${
                    viewMode === 'grid' ? 'p-6' : 'p-4'
                  }`}
                >
                  {viewMode === 'grid' ? (
                    // Grid view
                    <div className="text-center">
                      <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-200">
                        {getBodyTypeIcon(bodyType.name)}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600">
                        {bodyType.name}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {bodyType.count} bike{bodyType.count !== 1 ? 's' : ''}
                    </p>
                    <div className="mt-4 text-blue-600 font-medium text-sm group-hover:underline">
                      Explore {bodyType.name} bikes →
                    </div>
                  </div>
                ) : (
                  // List view
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl flex-shrink-0">
                      {getBodyTypeIcon(bodyType.name)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                        {bodyType.name}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {bodyType.count} bike{bodyType.count !== 1 ? 's' : ''} available
                      </p>
                    </div>
                    <FiChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                  </div>
                )}
              </Link>
            ) : null
            )).filter(Boolean)}
          </div>
        )}
      </div>

      {/* Popular bike types section */}
      {!searchTerm && (
        <div className="bg-white border-t mt-12">
          <div className="container mx-auto px-4 py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Popular Bike Types
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {bodyTypes
                .filter(bodyType => bodyType && bodyType.name && bodyType.slug)
                .sort((a, b) => b.count - a.count)
                .slice(0, 8)
                .map((bodyType) => (
                  <Link
                    key={bodyType.slug}
                    href={`/bikes/type/${bodyType.slug}`}
                    className="text-center p-4 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200">
                      {getBodyTypeIcon(bodyType.name)}
                    </div>
                    <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                      {bodyType.name}
                    </div>
                    <div className="text-xs text-gray-600">
                      {bodyType.count} bikes
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
