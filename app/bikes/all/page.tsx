'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FiChevronRight, FiFilter, FiX } from 'react-icons/fi';
import BikeCard from '@/components/bikes/BikeCard';

// Filter components
import BrandFilter from '@/components/filters/BrandFilter';
import BodyTypeFilter from '@/components/filters/BodyTypeFilter';
import PriceFilter from '@/components/filters/PriceFilter';
import EngineFilter from '@/components/filters/EngineFilter';
import EngineTypeFilter from '@/components/filters/EngineTypeFilter';
import MileageFilter from '@/components/filters/MileageFilter';
import SortSelector from '@/components/filters/SortSelector';

// Types
interface Bike {
  id: string;
  name: string;
  slug: string;
  price: number | null;
  image?: string | null;
  brand: {
    id: string;
    name: string;
    slug: string;
    logo?: string | null;
  };
  model?: {
    id: string;
    name: string;
  };
  specs?: {
    engine?: string;
    mileage?: string;
    power?: string;
    torque?: string;
    displacement?: string;
    engineType?: string;
  };
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AllBikesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Filter states
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0
  });
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // Get current filters from URL
  const currentBrand = searchParams.get('brand');
  const currentBodyType = searchParams.get('bodyType');
  const currentMinPrice = searchParams.get('minPrice');
  const currentMaxPrice = searchParams.get('maxPrice');
  const currentMinDisplacement = searchParams.get('minDisplacement');
  const currentMaxDisplacement = searchParams.get('maxDisplacement');
  const currentMinMileage = searchParams.get('minMileage');
  const currentSortBy = searchParams.get('sortBy') || 'price';
  const currentSortOrder = searchParams.get('sortOrder') || 'asc';
  const currentPage = Number(searchParams.get('page')) || 1;

  // Fetch bikes with filters
  const fetchBikes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      // Add filters to params
      if (currentBrand) params.append('brand', currentBrand);
      if (currentBodyType) params.append('bodyType', currentBodyType);
      if (currentMinPrice) params.append('minPrice', currentMinPrice);
      if (currentMaxPrice) params.append('maxPrice', currentMaxPrice);
      if (currentMinDisplacement) params.append('minDisplacement', currentMinDisplacement);
      if (currentMaxDisplacement) params.append('maxDisplacement', currentMaxDisplacement);
      if (currentMinMileage) params.append('minMileage', currentMinMileage);
      params.append('sortBy', currentSortBy);
      params.append('sortOrder', currentSortOrder);
      params.append('page', currentPage.toString());
      params.append('limit', '12');
      
      const response = await fetch(`/api/bikes?${params.toString()}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        // Try both possible response structures
        const bikesData = result.data.bikes || result.data.models || [];
        setBikes(bikesData);
        setPagination(result.data.pagination || {
          total: bikesData.length,
          page: currentPage,
          limit: 12,
          totalPages: Math.ceil(bikesData.length / 12)
        });
      }
    } catch (error) {
      console.error('Error fetching bikes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch bikes on component mount and when filters change
  useEffect(() => {
    fetchBikes();
  }, [currentBrand, currentBodyType, currentMinPrice, currentMaxPrice, 
      currentMinDisplacement, currentMaxDisplacement, currentMinMileage, 
      currentSortBy, currentSortOrder, currentPage]);

  // Update URL with new filter
  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    // Reset to page 1 when filters change
    if (key !== 'page') {
      params.delete('page');
    }
    
    router.push(`/bikes/all?${params.toString()}`);
  };

  // Clear all filters
  const clearAllFilters = () => {
    router.push('/bikes/all');
  };

  // Handle sort changes
  const handleSortChange = (sortBy: string, sortOrder: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sortBy', sortBy);
    params.set('sortOrder', sortOrder);
    params.delete('page'); // Reset to page 1 when sort changes
    router.push(`/bikes/all?${params.toString()}`);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    updateFilter('page', page.toString());
  };

  // Generate pagination numbers
  const getPaginationNumbers = () => {
    const numbers = [];
    const maxPages = Math.min(pagination.totalPages, 5);
    
    for (let i = 1; i <= maxPages; i++) {
      numbers.push(i);
    }
    
    return numbers;
  };

  // Check if any filters are active
  const hasActiveFilters = currentBrand || currentBodyType || currentMinPrice || 
    currentMaxPrice || currentMinDisplacement || currentMaxDisplacement || 
    currentMinMileage;

  return (
    <div className="bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="container py-6">
          <div className="flex items-center text-sm text-gray-500">
            <Link href="/" className="hover:text-primary">Home</Link>
            <FiChevronRight className="mx-2" />
            <Link href="/bikes" className="hover:text-primary">Bikes</Link>
            <FiChevronRight className="mx-2" />
            <span className="text-gray-900">All Bikes</span>
          </div>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">All Bikes</h1>
          <p className="mt-2 text-gray-600">
            Discover the complete range of motorcycles available in India
          </p>
          {pagination.total > 0 && (
            <p className="mt-1 text-sm text-gray-500">
              {pagination.total} {pagination.total === 1 ? 'bike' : 'bikes'} found
            </p>
          )}
        </div>
      </div>

      <div className="container py-6">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-md"
            >
              <FiFilter className="mr-2" />
              Filters
              {hasActiveFilters && (
                <span className="ml-2 px-2 py-1 text-xs bg-white text-primary rounded-full">
                  Active
                </span>
              )}
            </button>
          </div>

          {/* Filters Sidebar */}
          <div className={`lg:w-64 lg:flex-shrink-0 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white border rounded-lg lg:sticky lg:top-6 lg:max-h-[calc(100vh-8rem)]">
              <div className="p-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Filters</h2>
                  <div className="flex items-center space-x-2">
                    {hasActiveFilters && (
                      <button
                        onClick={clearAllFilters}
                        className="text-sm text-primary hover:text-primary-600"
                      >
                        Clear All
                      </button>
                    )}
                    <button
                      onClick={() => setShowMobileFilters(false)}
                      className="lg:hidden"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Scrollable filters content */}
              <div className="px-6 pb-6 overflow-y-auto filters-scroll max-h-[calc(100vh-12rem)] lg:max-h-[calc(100vh-16rem)]">
                <div className="space-y-6">
                <BrandFilter
                  selectedBrand={currentBrand || ''}
                  onChange={(brand) => updateFilter('brand', brand)}
                />
                
                <BodyTypeFilter
                  selectedBodyType={currentBodyType || ''}
                  onChange={(bodyType) => updateFilter('bodyType', bodyType)}
                />
                
                <PriceFilter
                  minPrice={currentMinPrice ? Number(currentMinPrice) : undefined}
                  maxPrice={currentMaxPrice ? Number(currentMaxPrice) : undefined}
                  onChange={(minPrice, maxPrice) => {
                    const params = new URLSearchParams(searchParams.toString());
                    
                    // Update both price filters in a single operation
                    if (minPrice !== undefined) {
                      params.set('minPrice', minPrice.toString());
                    } else {
                      params.delete('minPrice');
                    }
                    
                    if (maxPrice !== undefined) {
                      params.set('maxPrice', maxPrice.toString());
                    } else {
                      params.delete('maxPrice');
                    }
                    
                    // Reset to page 1 when filters change
                    params.delete('page');
                    
                    router.push(`/bikes/all?${params.toString()}`);
                  }}
                />
                
                <EngineFilter
                  minDisplacement={currentMinDisplacement ? Number(currentMinDisplacement) : undefined}
                  maxDisplacement={currentMaxDisplacement ? Number(currentMaxDisplacement) : undefined}
                  onChange={(min, max) => {
                    const params = new URLSearchParams(searchParams.toString());
                    
                    // Update both displacement filters in a single operation
                    if (min !== undefined) {
                      params.set('minDisplacement', min.toString());
                    } else {
                      params.delete('minDisplacement');
                    }
                    
                    if (max !== undefined) {
                      params.set('maxDisplacement', max.toString());
                    } else {
                      params.delete('maxDisplacement');
                    }
                    
                    // Reset to page 1 when filters change
                    params.delete('page');
                    
                    router.push(`/bikes/all?${params.toString()}`);
                  }}
                />
                
                <MileageFilter
                  minMileage={currentMinMileage ? Number(currentMinMileage) : undefined}
                  onChange={(mileage) => updateFilter('minMileage', mileage?.toString() || null)}
                />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Sort Options */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-gray-500">
                {loading ? 'Loading...' : `Showing ${bikes.length} of ${pagination.total} bikes`}
              </div>
              
              <SortSelector
                sortBy={currentSortBy}
                sortOrder={currentSortOrder}
                onChange={handleSortChange}
              />
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="bg-white border rounded-lg overflow-hidden animate-pulse">
                    <div className="h-48 bg-gray-200"></div>
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : bikes.length > 0 ? (
              <>
                {/* Bikes grid */}
                <div className="flex flex-wrap gap-6">
                  {bikes.map((bike) => {
                    // Convert to BikeCard format
                    const bikeData = {
                      id: bike.id,
                      name: bike.name,
                      image: bike.image || '/demo.avif',
                      price: bike.price ? bike.price.toLocaleString() : 'Price not available',
                      specs: {
                        engine: bike.specs?.engine || bike.specs?.displacement || 'N/A',
                        mileage: bike.specs?.mileage || 'N/A',
                        power: bike.specs?.power || 'N/A'
                      }
                    };
                    
                    return (
                      <BikeCard 
                        key={bike.id}
                        bike={bikeData}
                        viewMode="grid"
                        showBrand={true}
                      />
                    );
                  })}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center mt-8 space-x-2">
                    {pagination.page > 1 && (
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                      >
                        Previous
                      </button>
                    )}
                    
                    {getPaginationNumbers().map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 text-sm border rounded ${
                          pagination.page === pageNum
                            ? 'bg-primary text-white border-primary'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                    
                    {pagination.page < pagination.totalPages && (
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                      >
                        Next
                      </button>
                    )}
                  </div>
                )}
              </>
            ) : (
              /* No Results */
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 mb-4 text-gray-300">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-medium text-gray-900">No bikes found</h3>
                <p className="text-gray-500">
                  No bikes match your selected filters. Try adjusting or removing some filters.
                </p>
                <button 
                  onClick={clearAllFilters}
                  className="px-4 py-2 mt-4 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-600"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}