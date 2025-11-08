'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FiChevronRight, FiFilter, FiX } from 'react-icons/fi';

// Filter components
import BrandFilter from '@/components/filters/BrandFilter';
import PriceFilter from '@/components/filters/PriceFilter';
import EngineFilter from '@/components/filters/EngineFilter';
import MileageFilter from '@/components/filters/MileageFilter';
import SortSelector from '@/components/filters/SortSelector';

// Types
interface Scooter {
  variant_id: string;
  variant_name: string;
  on_road_price: number;
  variant_url: string;
  brand_name: string;
  brand_logo?: string;
  model_name: string;
  engine_type?: string;
  displacement?: string;
  peak_power?: string;
  city_mileage?: string;
  bike_style: string;
  image_url: string;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function ScootersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Filter states
  const [scooters, setScooters] = useState<Scooter[]>([]);
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
  const currentMinPrice = searchParams.get('minPrice');
  const currentMaxPrice = searchParams.get('maxPrice');
  const currentMinEngineCapacity = searchParams.get('minEngineCapacity');
  const currentMaxEngineCapacity = searchParams.get('maxEngineCapacity');
  const currentMinMileage = searchParams.get('minMileage');
  const currentSortBy = searchParams.get('sortBy') || 'price';
  const currentPage = Number(searchParams.get('page')) || 1;

  // Fetch scooters
  const fetchScooters = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/bikes/scooters');
      const result = await response.json();
      
      if (result.success && result.data) {
        let filteredScooters = result.data.bikes || [];
        
        // Debug: Log available brand names
        const availableBrands = Array.from(new Set(filteredScooters.map((s: Scooter) => s.brand_name)));
        console.log('Available scooter brands:', availableBrands);
        console.log('Current brand filter:', currentBrand);
        
        // Apply client-side filters since API might not support all filters
        if (currentBrand) {
          filteredScooters = filteredScooters.filter((scooter: Scooter) => {
            const brandMatch = scooter.brand_name.toLowerCase().trim() === currentBrand.toLowerCase().trim() ||
                               scooter.brand_name.toLowerCase().includes(currentBrand.toLowerCase());
            console.log(`Checking ${scooter.brand_name} against ${currentBrand}: ${brandMatch}`);
            return brandMatch;
          });
        }
        
        if (currentMinPrice) {
          filteredScooters = filteredScooters.filter((scooter: Scooter) =>
            scooter.on_road_price >= Number(currentMinPrice)
          );
        }
        
        if (currentMaxPrice) {
          filteredScooters = filteredScooters.filter((scooter: Scooter) =>
            scooter.on_road_price <= Number(currentMaxPrice)
          );
        }
        
        if (currentMinEngineCapacity && currentMaxEngineCapacity) {
          filteredScooters = filteredScooters.filter((scooter: Scooter) => {
            const displacement = parseInt(scooter.displacement || '0');
            return displacement >= Number(currentMinEngineCapacity) && 
                   displacement <= Number(currentMaxEngineCapacity);
          });
        }
        
        // Sort scooters
        if (currentSortBy === 'price') {
          filteredScooters.sort((a: Scooter, b: Scooter) => a.on_road_price - b.on_road_price);
        } else if (currentSortBy === 'name') {
          filteredScooters.sort((a: Scooter, b: Scooter) => a.variant_name.localeCompare(b.variant_name));
        }
        
        // Pagination
        const startIndex = (currentPage - 1) * 12;
        const endIndex = startIndex + 12;
        const paginatedScooters = filteredScooters.slice(startIndex, endIndex);
        
        setScooters(paginatedScooters);
        setPagination({
          total: filteredScooters.length,
          page: currentPage,
          limit: 12,
          totalPages: Math.ceil(filteredScooters.length / 12)
        });
      }
    } catch (error) {
      console.error('Error fetching scooters:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch scooters on component mount and when filters change
  useEffect(() => {
    fetchScooters();
  }, [currentBrand, currentMinPrice, currentMaxPrice, 
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
    
    router.push(`/scooters?${params.toString()}`);
  };

  // Clear all filters
  const clearAllFilters = () => {
    router.push('/scooters');
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
  const hasActiveFilters = currentBrand || currentMinPrice || 
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
            <span className="text-gray-900">Scooters</span>
          </div>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">Scooters</h1>
          <p className="mt-2 text-gray-600">
            Discover the best scooters available in India
          </p>
          {pagination.total > 0 && (
            <p className="mt-1 text-sm text-gray-500">
              {pagination.total} {pagination.total === 1 ? 'scooter' : 'scooters'} found
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
                  bodyType="scooter"
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
                {loading ? 'Loading...' : `Showing ${scooters.length} of ${pagination.total} scooters`}
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
            ) : scooters.length > 0 ? (
              <>
                {/* Scooters grid */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {scooters.map((scooter) => (
                    <Link 
                      key={scooter.variant_id} 
                      href={`/scooters/${scooter.variant_url}`} 
                      className="overflow-hidden transition-shadow bg-white border rounded-lg hover:shadow-md"
                    >
                      {/* Scooter Image */}
                      <div className="relative h-48 bg-gray-100">
                        <Image
                          src={scooter.image_url || '/demo.avif'}
                          alt={scooter.variant_name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                      
                      <div className="p-4">
                        {/* Brand */}
                        <div className="flex items-center mb-1">
                          {scooter.brand_logo ? (
                            <div className="relative w-6 h-6 mr-2">
                              <Image
                                src={scooter.brand_logo}
                                alt={scooter.brand_name}
                                fill
                                className="object-contain"
                              />
                            </div>
                          ) : null}
                          <p className="text-sm text-gray-500">{scooter.brand_name}</p>
                        </div>
                        
                        {/* Scooter Name */}
                        <h2 className="text-lg font-semibold">{scooter.variant_name}</h2>
                        
                        {/* Price */}
                        <div className="mt-2 text-xl font-bold text-primary">
                          ₹{scooter.on_road_price.toLocaleString()}
                        </div>
                        
                        {/* Specs */}
                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
                          {scooter.displacement && (
                            <div>
                              <div className="font-medium">Engine</div>
                              <div>{scooter.displacement}cc</div>
                            </div>
                          )}
                          {scooter.city_mileage && (
                            <div>
                              <div className="font-medium">Mileage</div>
                              <div>{scooter.city_mileage}</div>
                            </div>
                          )}
                          {scooter.peak_power && (
                            <div>
                              <div className="font-medium">Power</div>
                              <div>{scooter.peak_power}</div>
                            </div>
                          )}
                          {scooter.engine_type && (
                            <div>
                              <div className="font-medium">Engine Type</div>
                              <div>{scooter.engine_type}</div>
                            </div>
                          )}
                        </div>
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
                <h3 className="mb-2 text-xl font-medium text-gray-900">No scooters found</h3>
                <p className="text-gray-500">
                  No scooters match your selected filters. Try adjusting or removing some filters.
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