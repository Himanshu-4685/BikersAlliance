'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FiChevronRight, FiFilter, FiX } from 'react-icons/fi';

// Filter components
import BrandFilter from '@/components/filters/BrandFilter';
import CategoryFilter from '@/components/filters/CategoryFilter';
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
  const currentCategory = searchParams.get('category');
  const currentMinPrice = searchParams.get('minPrice');
  const currentMaxPrice = searchParams.get('maxPrice');
  const currentMinEngineCapacity = searchParams.get('minEngineCapacity');
  const currentMaxEngineCapacity = searchParams.get('maxEngineCapacity');
  const currentMinMileage = searchParams.get('minMileage');
  const currentSortBy = searchParams.get('sortBy') || 'price';
  const currentPage = Number(searchParams.get('page')) || 1;

  // Fetch bikes with filters
  const fetchBikes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      // Add filters to params
      if (currentBrand) params.append('brand', currentBrand);
      if (currentCategory) params.append('category', currentCategory);
      if (currentMinPrice) params.append('minPrice', currentMinPrice);
      if (currentMaxPrice) params.append('maxPrice', currentMaxPrice);
      if (currentMinEngineCapacity) params.append('minEngineCapacity', currentMinEngineCapacity);
      if (currentMaxEngineCapacity) params.append('maxEngineCapacity', currentMaxEngineCapacity);
      if (currentMinMileage) params.append('minMileage', currentMinMileage);
      params.append('sortBy', currentSortBy);
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
  }, [currentBrand, currentCategory, currentMinPrice, currentMaxPrice, 
      currentMinEngineCapacity, currentMaxEngineCapacity, currentMinMileage, 
      currentSortBy, currentPage]);

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
  const hasActiveFilters = currentBrand || currentCategory || currentMinPrice || 
    currentMaxPrice || currentMinEngineCapacity || currentMaxEngineCapacity || 
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
            <div className="bg-white border rounded-lg p-6 lg:sticky lg:top-6">
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

              <div className="space-y-6">
                <BrandFilter
                  selectedBrand={currentBrand || ''}
                  onChange={(brand) => updateFilter('brand', brand)}
                />
                
                <CategoryFilter
                  selectedCategory={currentCategory || ''}
                  onChange={(category) => updateFilter('category', category)}
                />
                
                <PriceFilter
                  minPrice={currentMinPrice ? Number(currentMinPrice) : undefined}
                  maxPrice={currentMaxPrice ? Number(currentMaxPrice) : undefined}
                  onChange={(minPrice, maxPrice) => {
                    updateFilter('minPrice', minPrice?.toString() || null);
                    updateFilter('maxPrice', maxPrice?.toString() || null);
                  }}
                />
                
                <EngineFilter
                  minEngineCapacity={currentMinEngineCapacity ? Number(currentMinEngineCapacity) : undefined}
                  maxEngineCapacity={currentMaxEngineCapacity ? Number(currentMaxEngineCapacity) : undefined}
                  onChange={(min, max) => {
                    updateFilter('minEngineCapacity', min?.toString() || null);
                    updateFilter('maxEngineCapacity', max?.toString() || null);
                  }}
                />
                
                <MileageFilter
                  minMileage={currentMinMileage ? Number(currentMinMileage) : undefined}
                  onChange={(mileage) => updateFilter('minMileage', mileage?.toString() || null)}
                />
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
                sortOrder="asc"
                onChange={(sortBy, sortOrder) => updateFilter('sortBy', sortBy)}
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
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {bikes.map((bike) => (
                    <Link 
                      key={bike.id} 
                      href={`/bikes/${bike.slug}`} 
                      className="overflow-hidden transition-shadow bg-white border rounded-lg hover:shadow-md"
                    >
                      {/* Bike Image */}
                      <div className="relative h-48 bg-gray-100">
                        <Image
                          src={bike.image || '/demo.avif'}
                          alt={bike.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                      
                      <div className="p-4">
                        {/* Brand */}
                        <div className="flex items-center mb-1">
                          {bike.brand.logo ? (
                            <div className="relative w-6 h-6 mr-2">
                              <Image
                                src={bike.brand.logo}
                                alt={bike.brand.name}
                                fill
                                className="object-contain"
                              />
                            </div>
                          ) : null}
                          <p className="text-sm text-gray-500">{bike.brand.name}</p>
                        </div>
                        
                        {/* Bike Name */}
                        <h2 className="text-lg font-semibold">{bike.name}</h2>
                        
                        {/* Price */}
                        {bike.price && (
                          <div className="mt-2 text-xl font-bold text-primary">
                            ₹{bike.price.toLocaleString()}
                          </div>
                        )}
                        
                        {/* Specs */}
                        {bike.specs && (
                          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
                            {bike.specs.engine && (
                              <div>
                                <div className="font-medium">Engine</div>
                                <div>{bike.specs.engine}</div>
                              </div>
                            )}
                            {bike.specs.mileage && (
                              <div>
                                <div className="font-medium">Mileage</div>
                                <div>{bike.specs.mileage}</div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
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