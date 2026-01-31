'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FiChevronRight, FiFilter, FiX } from 'react-icons/fi';
import BikeCard from '@/components/bikes/BikeCard';

// Filter components
import BrandFilter from '@/components/filters/BrandFilter';
import Pagination from '@/components/ui/Pagination';
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
  const currentMinDisplacement = searchParams.get('minDisplacement');
  const currentMaxDisplacement = searchParams.get('maxDisplacement');
  const currentMinMileage = searchParams.get('minMileage');
  const currentSortBy = searchParams.get('sortBy') || 'price';
  const currentSortOrder = searchParams.get('sortOrder') || 'asc';
  const currentPage = Number(searchParams.get('page')) || 1;

  // Fetch scooters
  const fetchScooters = async () => {
    setLoading(true);
    try {
      // Construct query parameters
      const params = new URLSearchParams();
      
      if (currentBrand) params.append('brand', currentBrand);
      if (currentMinPrice) params.append('minPrice', currentMinPrice);
      if (currentMaxPrice) params.append('maxPrice', currentMaxPrice);
      if (currentMinDisplacement) params.append('minDisplacement', currentMinDisplacement);
      if (currentMaxDisplacement) params.append('maxDisplacement', currentMaxDisplacement);
      if (currentMinMileage) params.append('minMileage', currentMinMileage);
      params.append('sortBy', currentSortBy);
      params.append('sortOrder', currentSortOrder);
      params.append('page', currentPage.toString());
      params.append('limit', '12');
      
      const response = await fetch(`/api/bikes/scooters?${params.toString()}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        setScooters(result.data.bikes || []);
        
        // Handle pagination properly
        if (result.data.pagination) {
          setPagination(result.data.pagination);
        } else {
          // Fallback pagination calculation
          const totalBikes = result.data.bikes?.length || 0;
          setPagination({
            total: totalBikes,
            page: currentPage,
            limit: 12,
            totalPages: Math.ceil(totalBikes / 12)
          });
        }
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
  }, [
    currentBrand, 
    currentMinPrice, 
    currentMaxPrice, 
    currentMinDisplacement, 
    currentMaxDisplacement, 
    currentMinMileage, 
    currentSortBy, 
    currentSortOrder, 
    currentPage
  ]);

  // Update URL with new filter
  const updateFilters = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Update params
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    
    // Reset to page 1 when filters change
    if (!('page' in newParams)) {
      params.delete('page');
    }
    
    router.push(`/scooters?${params.toString()}`);
  };

  // Update individual filter
  const updateFilter = (key: string, value: string | null) => {
    updateFilters({ [key]: value });
  };

  // Clear all filters
  const clearAllFilters = () => {
    router.push('/scooters');
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    updateFilter('page', page.toString());
  };

  // Check if any filters are active
  const hasActiveFilters = currentBrand || currentMinPrice || 
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
                    updateFilters({
                      'minPrice': minPrice?.toString() || null,
                      'maxPrice': maxPrice?.toString() || null
                    });
                  }}
                />
                
                <EngineFilter
                  minDisplacement={currentMinDisplacement ? Number(currentMinDisplacement) : undefined}
                  maxDisplacement={currentMaxDisplacement ? Number(currentMaxDisplacement) : undefined}
                  onChange={(min, max) => {
                    updateFilters({
                      'minDisplacement': min?.toString() || null,
                      'maxDisplacement': max?.toString() || null
                    });
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
                sortOrder={currentSortOrder}
                onChange={(sortBy, sortOrder) => updateFilters({ 
                  'sortBy': sortBy,
                  'sortOrder': sortOrder 
                })}
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
                <div className="flex flex-wrap gap-6">
                  {scooters.map((scooter) => {
                    // Convert scooter data to Bike format for BikeCard
                    const bikeData = {
                      id: scooter.variant_id,
                      name: scooter.variant_name,
                      image: scooter.image_url || '/demo.avif',
                      price: scooter.on_road_price.toLocaleString(),
                      specs: {
                        engine: scooter.displacement || 'N/A',
                        mileage: scooter.city_mileage || 'N/A',
                        power: scooter.peak_power || 'N/A'
                      }
                    };
                    
                    return (
                      <BikeCard 
                        key={scooter.variant_id}
                        bike={bikeData}
                        viewMode="grid"
                        showBrand={true}
                      />
                    );
                  })}
                </div>

                {/* Pagination Info */}
                {pagination.total > 0 && (
                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                      Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} scooters
                    </p>
                  </div>
                )}

                {/* Pagination */}
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                  className="mt-8"
                />
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