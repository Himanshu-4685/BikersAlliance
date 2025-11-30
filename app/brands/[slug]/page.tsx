'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiGrid, FiList, FiFilter, FiChevronDown } from 'react-icons/fi';
import { BikeFromDB, Bike } from '@/types/bike';
import BikeCard from '@/components/bikes/BikeCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface BrandInfo {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  country: string;
  stats: {
    totalModels: number;
    totalVariants: number;
    priceRange: {
      min: number;
      max: number;
    };
  };
}

interface BrandPageProps {
  params: { slug: string };
}

// Helper function to clean and format values that might already contain units
const cleanAndFormatValue = (value: any, unit: string): string => {
  if (!value) return 'N/A';
  
  const stringValue = String(value).trim();
  
  // If the value already contains the unit, return as is
  if (stringValue.toLowerCase().includes(unit.toLowerCase())) {
    return stringValue;
  }
  
  // If it's just a number, add the unit
  const numericValue = parseFloat(stringValue);
  if (!isNaN(numericValue)) {
    return `${numericValue} ${unit}`;
  }
  
  // Fallback: return the value as is
  return stringValue;
};

// Function to format database bike data for UI
const formatBikeData = (dbBike: BikeFromDB): Bike => {
  const isElectric = dbBike.bike_style === 'electric' || dbBike.engine_type === 'electric';
  
  return {
    id: dbBike.variant_id,
    name: dbBike.variant_name,
    slug: dbBike.variant_url,
    image: dbBike.image_url || '/demo.avif',
    price: dbBike.on_road_price?.toLocaleString('en-IN') || 'N/A',
    specs: {
      engine: isElectric 
        ? 'Electric' 
        : cleanAndFormatValue(dbBike.displacement, 'cc'),
      mileage: isElectric 
        ? cleanAndFormatValue(dbBike.city_mileage, 'km')
        : cleanAndFormatValue(dbBike.city_mileage, 'kmpl'),
      power: isElectric 
        ? cleanAndFormatValue(dbBike.peak_power, 'kW')
        : cleanAndFormatValue(dbBike.peak_power, 'PS'),
    }
  };
};

export default function BrandPage({ params }: BrandPageProps) {
  const { slug } = params;
  
  // State management
  const [brand, setBrand] = useState<BrandInfo | null>(null);
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('price');
  const [sortOrder, setSortOrder] = useState('asc');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  // Fetch brand data and bikes
  const fetchBrandData = async (page = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        sortBy,
        sortOrder,
      });
      
      if (priceRange.min) params.append('minPrice', priceRange.min);
      if (priceRange.max) params.append('maxPrice', priceRange.max);
      
      const response = await fetch(`/api/brands/${slug}?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setBrand(data.data.brand);
        const formattedBikes = data.data.bikes.map(formatBikeData);
        setBikes(formattedBikes);
        setCurrentPage(data.data.pagination.currentPage);
        setTotalPages(data.data.pagination.totalPages);
      } else {
        setError(data.message || 'Failed to fetch brand data');
      }
    } catch (err) {
      setError('Failed to fetch brand data');
      console.error('Error fetching brand data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrandData();
  }, [slug, sortBy, sortOrder]);

  const handleFilterApply = () => {
    setCurrentPage(1);
    fetchBrandData(1);
    setShowFilters(false);
  };

  const handlePageChange = (page: number) => {
    fetchBrandData(page);
  };

  if (loading && !brand) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Brand Not Found</h1>
          <p className="text-gray-600">The requested brand could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Brand Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-6">
            <div className="flex-shrink-0">
              <Image
                src={brand.logoUrl || '/demo.avif'}
                alt={`${brand.name} logo`}
                width={80}
                height={80}
                className="rounded-lg object-contain bg-gray-100 p-2"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{brand.name}</h1>
              <p className="text-gray-600 mt-1">
                {brand.country && `From ${brand.country}`}
              </p>
              <div className="flex items-center space-x-6 mt-4 text-sm text-gray-500">
                <span>{brand.stats.totalModels} Models</span>
                <span>{brand.stats.totalVariants} Variants</span>
                <span>
                  Price Range: ₹{brand.stats.priceRange.min?.toLocaleString('en-IN')} - 
                  ₹{brand.stats.priceRange.max?.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <FiFilter className="w-4 h-4" />
              <span>Filters</span>
            </button>
            
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split('-');
                setSortBy(newSortBy);
                setSortOrder(newSortOrder);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
            >
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
            >
              <FiGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
            >
              <FiList className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-white rounded-lg shadow-sm border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Price (₹)
                </label>
                <input
                  type="number"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Price (₹)
                </label>
                <input
                  type="number"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  placeholder="1000000"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleFilterApply}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bikes Grid/List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="md" />
          </div>
        ) : bikes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No bikes found for the selected filters.</p>
          </div>
        ) : (
          <>
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
            }>
              {bikes.map((bike) => (
                <BikeCard
                  key={bike.id}
                  bike={bike}
                  viewMode={viewMode}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 rounded-md border ${
                        page === currentPage
                          ? 'border-red-600 bg-red-600 text-white'
                          : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}