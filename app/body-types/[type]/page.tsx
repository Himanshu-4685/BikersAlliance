'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { FiChevronRight, FiFilter, FiX } from 'react-icons/fi';
import { BodyTypeBikesApiResponse, FormattedBike } from '@/types/bike';
import BikeGrid from '@/components/body-types/BikeGrid';

// Filter components (reusing existing ones)
import BrandFilter from '@/components/filters/BrandFilter';
import PriceFilter from '@/components/filters/PriceFilter';
import SortSelector from '@/components/filters/SortSelector';

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function BodyTypePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const bodyType = params.type as string;

  // State
  const [bikes, setBikes] = useState<FormattedBike[]>([]);
  const [bodyTypeName, setBodyTypeName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0
  });

  // Filter states
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [sortBy, setSortBy] = useState<string>('price');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'pagination' | 'loadmore'>('pagination');

  // Fetch bikes data
  const fetchBikes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(searchParams.toString());
      
      // Add filters to params
      if (selectedBrand) {
        params.set('brand', selectedBrand);
      }
      if (minPrice !== undefined) {
        params.set('minPrice', minPrice.toString());
      }
      if (maxPrice !== undefined) {
        params.set('maxPrice', maxPrice.toString());
      }
      params.set('sortBy', sortBy);
      params.set('sortOrder', sortOrder);
      params.set('page', pagination.page.toString());
      params.set('limit', pagination.limit.toString());

      const response = await fetch(`/api/body-types/${bodyType}?${params}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          notFound();
        }
        throw new Error('Failed to fetch bikes');
      }

      const data: BodyTypeBikesApiResponse = await response.json();
      
      if (viewMode === 'loadmore' && pagination.page > 1) {
        // Append new bikes to existing ones for load more mode
        setBikes(prevBikes => [...prevBikes, ...data.bikes]);
      } else {
        // Replace bikes for pagination mode or first page
        setBikes(data.bikes);
      }
      
      setBodyTypeName(data.bodyType.name);
      setPagination(data.pagination);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Reset to page 1 and clear bikes when filters change
    if (viewMode === 'loadmore') {
      setBikes([]);
    }
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [selectedBrand, minPrice, maxPrice, sortBy, sortOrder, viewMode]);

  useEffect(() => {
    fetchBikes();
  }, [bodyType, selectedBrand, minPrice, maxPrice, sortBy, sortOrder, pagination.page]);

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoadMore = async () => {
    if (pagination.page >= pagination.totalPages) return;
    
    try {
      setLoadingMore(true);
      const nextPage = pagination.page + 1;
      
      const params = new URLSearchParams(searchParams.toString());
      
      // Add filters to params
      if (selectedBrand) {
        params.set('brand', selectedBrand);
      }
      if (minPrice !== undefined) {
        params.set('minPrice', minPrice.toString());
      }
      if (maxPrice !== undefined) {
        params.set('maxPrice', maxPrice.toString());
      }
      params.set('sortBy', sortBy);
      params.set('sortOrder', sortOrder);
      params.set('page', nextPage.toString());
      params.set('limit', pagination.limit.toString());

      const response = await fetch(`/api/body-types/${bodyType}?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch more bikes');
      }

      const data: BodyTypeBikesApiResponse = await response.json();
      
      // Append new bikes to existing ones
      setBikes(prevBikes => [...prevBikes, ...data.bikes]);
      setPagination(data.pagination);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoadingMore(false);
    }
  };

  const clearFilters = () => {
    setSelectedBrand('');
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setSortBy('price');
    setSortOrder('asc');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header skeleton */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
        </div>
        
        {/* Content skeleton */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
                <div className="h-48 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Bikes</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => fetchBikes()}
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
            <Link href="/bikes/type" className="hover:text-blue-600">Body Types</Link>
            <FiChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">{bodyTypeName}</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{bodyTypeName} Bikes</h1>
              <p className="text-gray-600 mt-2">
                {pagination.total} bikes available in {bodyTypeName} category
              </p>
            </div>
            
            {/* Mobile filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden mt-4 flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg"
            >
              <FiFilter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-6">
                <BrandFilter
                  selectedBrand={selectedBrand}
                  onChange={(brand) => setSelectedBrand(brand || '')}
                />
                
                <PriceFilter
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  onChange={(min, max) => {
                    setMinPrice(min);
                    setMaxPrice(max);
                  }}
                />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Sort and View Options */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <div className="mb-4 sm:mb-0">
                <p className="text-gray-600">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} results
                </p>
                <p className="text-sm text-gray-500">
                  Page {pagination.page} of {pagination.totalPages}
                </p>
              </div>
              
              <SortSelector
                sortBy={sortBy}
                sortOrder={sortOrder}
                onChange={(newSortBy: string, newSortOrder: string) => {
                  setSortBy(newSortBy);
                  setSortOrder(newSortOrder as 'asc' | 'desc');
                }}
              />
            </div>

            {/* Bikes Grid */}
            <BikeGrid bikes={bikes} loading={loading} />

            {/* Pagination and Load More */}
            {pagination.totalPages > 1 && (
              <div className="mt-8">
                {/* View Mode Toggle */}
                <div className="flex justify-center mb-6">
                  <div className="bg-gray-100 p-1 rounded-lg">
                    <button
                      onClick={() => setViewMode('pagination')}
                      className={`px-4 py-2 rounded-md text-sm font-medium ${
                        viewMode === 'pagination'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Pagination
                    </button>
                    <button
                      onClick={() => setViewMode('loadmore')}
                      className={`px-4 py-2 rounded-md text-sm font-medium ${
                        viewMode === 'loadmore'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Load More
                    </button>
                  </div>
                </div>

                {viewMode === 'pagination' ? (
                  /* Standard Pagination */
                  <div className="flex flex-col items-center space-y-4">
                    {/* Mobile pagination info */}
                    <div className="text-sm text-gray-600 md:hidden">
                      Page {pagination.page} of {pagination.totalPages}
                    </div>
                    
                    <div className="flex items-center justify-center space-x-1 overflow-x-auto pb-2">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 flex items-center space-x-1 whitespace-nowrap"
                      >
                        <span className="hidden sm:inline">Previous</span>
                        <span className="sm:hidden">Prev</span>
                      </button>
                      
                      {/* Page numbers with smart display */}
                      {(() => {
                        const current = pagination.page;
                        const total = pagination.totalPages;
                        const pages: (number | string)[] = [];
                        
                        // For mobile, show fewer pages
                        const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
                        const maxPages = isMobile ? 5 : 7;
                        
                        if (total <= maxPages) {
                          // Show all pages if within limit
                          for (let i = 1; i <= total; i++) {
                            pages.push(i);
                          }
                        } else {
                          // Smart pagination
                          pages.push(1);
                          
                          if (current > 3) {
                            pages.push('...');
                          }
                          
                          const start = Math.max(2, current - 1);
                          const end = Math.min(total - 1, current + 1);
                          
                          for (let i = start; i <= end; i++) {
                            if (i !== 1 && i !== total) {
                              pages.push(i);
                            }
                          }
                          
                          if (current < total - 2) {
                            pages.push('...');
                          }
                          
                          if (total > 1) {
                            pages.push(total);
                          }
                        }
                        
                        return pages.map((page, index) => {
                          if (page === '...') {
                            return (
                              <span key={`ellipsis-${index}`} className="px-2 py-2 text-gray-500 text-sm">
                                ...
                              </span>
                            );
                          }
                          
                          const pageNum = page as number;
                          const isCurrentPage = pageNum === current;
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`px-3 py-2 border rounded-lg text-sm ${
                                isCurrentPage
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        });
                      })()}
                      
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                        className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 flex items-center space-x-1 whitespace-nowrap"
                      >
                        <span className="hidden sm:inline">Next</span>
                        <span className="sm:hidden">Next</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Load More Button */
                  <div className="flex flex-col items-center space-y-4">
                    <p className="text-sm text-gray-600">
                      Showing {bikes.length} of {pagination.total} bikes
                    </p>
                    
                    {pagination.page < pagination.totalPages && (
                      <button
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        {loadingMore ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Loading...</span>
                          </>
                        ) : (
                          <span>Load More Bikes</span>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}