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
import MileageFilter from '@/components/filters/MileageFilter';
import SortSelector from '@/components/filters/SortSelector';

// Types
interface Bike {
  id: string;
  name: string;
  slug: string;
  brand: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  image: string | null;
  price: number | null;
  specs: {
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

export default function BikesPage() {
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
  const currentSortOrder = searchParams.get('sortOrder') || 'asc';
  const currentPage = Number(searchParams.get('page') || '1');
  
  // Fetch bikes with current filters
  useEffect(() => {
    const fetchBikes = async () => {
      setLoading(true);
      
      // Construct query parameters
      const params = new URLSearchParams();
      
      if (currentBrand) params.append('brand', currentBrand);
      if (currentCategory) params.append('category', currentCategory);
      if (currentMinPrice) params.append('minPrice', currentMinPrice);
      if (currentMaxPrice) params.append('maxPrice', currentMaxPrice);
      if (currentMinEngineCapacity) params.append('minEngineCapacity', currentMinEngineCapacity);
      if (currentMaxEngineCapacity) params.append('maxEngineCapacity', currentMaxEngineCapacity);
      if (currentMinMileage) params.append('minMileage', currentMinMileage);
      params.append('sortBy', currentSortBy);
      params.append('sortOrder', currentSortOrder);
      params.append('page', currentPage.toString());
      params.append('limit', '12');
      
      try {
        const response = await fetch(`/api/bikes?${params.toString()}`);
        const result = await response.json();
        
        if (result.success) {
          setBikes(result.data.models);
          setPagination(result.data.pagination);
        } else {
          console.error('Failed to fetch bikes:', result.error);
        }
      } catch (error) {
        console.error('Error fetching bikes:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBikes();
  }, [
    currentBrand,
    currentCategory,
    currentMinPrice,
    currentMaxPrice,
    currentMinEngineCapacity,
    currentMaxEngineCapacity,
    currentMinMileage,
    currentSortBy,
    currentSortOrder,
    currentPage
  ]);
  
  // Update URL with filter parameters
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
      params.set('page', '1');
    }
    
    // Update URL
    router.push(`/bikes?${params.toString()}`);
  };
  
  // Clear all filters
  const clearAllFilters = () => {
    router.push('/bikes');
  };
  
  // Check if any filter is applied
  const hasActiveFilters = Boolean(
    currentBrand ||
    currentCategory ||
    currentMinPrice ||
    currentMaxPrice ||
    currentMinEngineCapacity ||
    currentMaxEngineCapacity ||
    currentMinMileage ||
    (currentSortBy && currentSortBy !== 'price') ||
    (currentSortOrder && currentSortOrder !== 'asc')
  );
  
  return (
    <div className="bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="container py-6">
          <div className="flex items-center text-sm text-gray-500">
            <Link href="/" className="hover:text-primary">Home</Link>
            <FiChevronRight className="mx-2" />
            <span className="text-gray-900">Bikes</span>
          </div>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            {currentCategory ? `${currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1)} Bikes` : 
             currentBrand ? `${currentBrand.charAt(0).toUpperCase() + currentBrand.slice(1)} Bikes` : 
             'All Bikes'}
          </h1>
          <p className="mt-2 text-gray-600">
            {pagination.total} {pagination.total === 1 ? 'bike' : 'bikes'} found
          </p>
        </div>
      </div>
      
      <div className="container py-6">
        <div className="flex items-center justify-between mb-4">
          {/* Mobile Filter Button */}
          <button 
            onClick={() => setShowMobileFilters(true)}
            className="flex items-center px-4 py-2 bg-white border rounded-md shadow-sm md:hidden"
          >
            <FiFilter className="mr-2" /> Filters
          </button>
          
          {/* Sort Selector (Mobile & Desktop) */}
          <div className="ml-auto">
            <SortSelector 
              sortBy={currentSortBy} 
              sortOrder={currentSortOrder} 
              onChange={(sortBy, sortOrder) => updateFilters({ sortBy, sortOrder })}
            />
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row">
          {/* Desktop Filters Sidebar */}
          <div className="hidden w-64 mr-6 md:block">
            <div className="sticky p-4 bg-white border rounded-lg shadow-sm top-24">
              <div className="flex items-center justify-between pb-3 mb-3 border-b">
                <h2 className="text-lg font-medium">Filters</h2>
                {hasActiveFilters && (
                  <button 
                    onClick={clearAllFilters}
                    className="text-sm text-primary hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </div>
              
              <div className="space-y-6">
                {/* Brand Filter */}
                <BrandFilter 
                  selectedBrand={currentBrand || ''} 
                  onChange={(brand) => updateFilters({ brand })}
                />
                
                {/* Category Filter */}
                <CategoryFilter 
                  selectedCategory={currentCategory || ''} 
                  onChange={(category) => updateFilters({ category })}
                />
                
                {/* Price Filter */}
                <PriceFilter 
                  minPrice={currentMinPrice ? parseInt(currentMinPrice) : undefined}
                  maxPrice={currentMaxPrice ? parseInt(currentMaxPrice) : undefined}
                  onChange={(minPrice, maxPrice) => updateFilters({ 
                    minPrice: minPrice?.toString() || null, 
                    maxPrice: maxPrice?.toString() || null 
                  })}
                />
                
                {/* Engine Capacity Filter */}
                <EngineFilter 
                  minEngineCapacity={currentMinEngineCapacity ? parseInt(currentMinEngineCapacity) : undefined}
                  maxEngineCapacity={currentMaxEngineCapacity ? parseInt(currentMaxEngineCapacity) : undefined}
                  onChange={(min, max) => updateFilters({ 
                    minEngineCapacity: min?.toString() || null, 
                    maxEngineCapacity: max?.toString() || null 
                  })}
                />
                
                {/* Mileage Filter */}
                <MileageFilter 
                  minMileage={currentMinMileage ? parseInt(currentMinMileage) : undefined}
                  onChange={(minMileage) => updateFilters({ 
                    minMileage: minMileage?.toString() || null 
                  })}
                />
              </div>
            </div>
          </div>
          
          {/* Mobile Filters Sidebar (Overlay) */}
          {showMobileFilters && (
            <div className="fixed inset-0 z-50 flex bg-black/50 md:hidden">
              <div className="w-80 h-full p-4 overflow-auto bg-white">
                <div className="flex items-center justify-between pb-3 mb-3 border-b">
                  <h2 className="text-lg font-medium">Filters</h2>
                  <button 
                    onClick={() => setShowMobileFilters(false)}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <FiX />
                  </button>
                </div>
                
                <div className="space-y-6">
                  {/* Brand Filter */}
                  <BrandFilter 
                    selectedBrand={currentBrand || ''} 
                    onChange={(brand) => {
                      updateFilters({ brand });
                      setShowMobileFilters(false);
                    }}
                  />
                  
                  {/* Category Filter */}
                  <CategoryFilter 
                    selectedCategory={currentCategory || ''} 
                    onChange={(category) => {
                      updateFilters({ category });
                      setShowMobileFilters(false);
                    }}
                  />
                  
                  {/* Price Filter */}
                  <PriceFilter 
                    minPrice={currentMinPrice ? parseInt(currentMinPrice) : undefined}
                    maxPrice={currentMaxPrice ? parseInt(currentMaxPrice) : undefined}
                    onChange={(minPrice, maxPrice) => {
                      updateFilters({ 
                        minPrice: minPrice?.toString() || null, 
                        maxPrice: maxPrice?.toString() || null 
                      });
                      setShowMobileFilters(false);
                    }}
                  />
                  
                  {/* Engine Capacity Filter */}
                  <EngineFilter 
                    minEngineCapacity={currentMinEngineCapacity ? parseInt(currentMinEngineCapacity) : undefined}
                    maxEngineCapacity={currentMaxEngineCapacity ? parseInt(currentMaxEngineCapacity) : undefined}
                    onChange={(min, max) => {
                      updateFilters({ 
                        minEngineCapacity: min?.toString() || null, 
                        maxEngineCapacity: max?.toString() || null 
                      });
                      setShowMobileFilters(false);
                    }}
                  />
                  
                  {/* Mileage Filter */}
                  <MileageFilter 
                    minMileage={currentMinMileage ? parseInt(currentMinMileage) : undefined}
                    onChange={(minMileage) => {
                      updateFilters({ 
                        minMileage: minMileage?.toString() || null 
                      });
                      setShowMobileFilters(false);
                    }}
                  />
                  
                  <div className="pt-4 mt-4 border-t">
                    <button 
                      onClick={clearAllFilters}
                      className="w-full px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-600"
                    >
                      Clear All Filters
                    </button>
                    
                    <button 
                      onClick={() => setShowMobileFilters(false)}
                      className="w-full px-4 py-2 mt-2 text-sm font-medium border rounded-md hover:bg-gray-50"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Bikes Grid */}
          <div className="flex-1">
            {loading ? (
              // Loading state
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="p-4 bg-white border rounded-lg shadow-sm">
                    <div className="w-full h-48 bg-gray-200 rounded-md animate-pulse"></div>
                    <div className="h-4 mt-3 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-2/3 h-3 mt-2 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-6 mt-3 bg-gray-200 rounded animate-pulse"></div>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
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
                        {bike.image ? (
                          <Image
                            src={bike.image}
                            alt={bike.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full bg-gray-100">
                            <p className="text-gray-400">No image</p>
                          </div>
                        )}
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
                        <div className="mt-2 mb-3">
                          {bike.price ? (
                            <p className="text-xl font-bold text-gray-900">₹ {bike.price.toLocaleString('en-IN')}</p>
                          ) : (
                            <p className="text-gray-500">Price not available</p>
                          )}
                        </div>
                        
                        {/* Specs */}
                        <div className="grid grid-cols-2 gap-2">
                          {bike.specs.engine && (
                            <div className="text-sm">
                              <span className="text-gray-500">Engine: </span>
                              <span className="font-medium">{bike.specs.engine}</span>
                            </div>
                          )}
                          
                          {bike.specs.mileage && (
                            <div className="text-sm">
                              <span className="text-gray-500">Mileage: </span>
                              <span className="font-medium">{bike.specs.mileage}</span>
                            </div>
                          )}
                          
                          {bike.specs.power && (
                            <div className="text-sm">
                              <span className="text-gray-500">Power: </span>
                              <span className="font-medium">{bike.specs.power}</span>
                            </div>
                          )}
                          
                          {bike.specs.torque && (
                            <div className="text-sm">
                              <span className="text-gray-500">Torque: </span>
                              <span className="font-medium">{bike.specs.torque}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                
                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center mt-8">
                    <div className="inline-flex items-center space-x-2">
                      <button
                        onClick={() => updateFilters({ page: Math.max(1, currentPage - 1).toString() })}
                        disabled={currentPage === 1}
                        className={`px-3 py-1 border rounded-md ${
                          currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-50'
                        }`}
                      >
                        Previous
                      </button>
                      
                      {[...Array(pagination.totalPages)].map((_, index) => {
                        const pageNumber = index + 1;
                        
                        // Show limited page numbers for better UX
                        if (
                          pagination.totalPages <= 7 ||
                          pageNumber === 1 ||
                          pageNumber === pagination.totalPages ||
                          Math.abs(pageNumber - currentPage) <= 1
                        ) {
                          return (
                            <button
                              key={pageNumber}
                              onClick={() => updateFilters({ page: pageNumber.toString() })}
                              className={`w-8 h-8 rounded-md ${
                                pageNumber === currentPage
                                  ? 'bg-primary text-white'
                                  : 'border hover:bg-gray-50'
                              }`}
                            >
                              {pageNumber}
                            </button>
                          );
                        } else if (
                          (pageNumber === 2 && currentPage > 3) ||
                          (pageNumber === pagination.totalPages - 1 && currentPage < pagination.totalPages - 2)
                        ) {
                          return <span key={pageNumber} className="px-1">...</span>;
                        }
                        
                        return null;
                      })}
                      
                      <button
                        onClick={() => updateFilters({ page: Math.min(pagination.totalPages, currentPage + 1).toString() })}
                        disabled={currentPage === pagination.totalPages}
                        className={`px-3 py-1 border rounded-md ${
                          currentPage === pagination.totalPages ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-50'
                        }`}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              // Empty state
              <div className="flex flex-col items-center justify-center p-10 text-center bg-white rounded-lg">
                <div className="w-16 h-16 mb-4 text-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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