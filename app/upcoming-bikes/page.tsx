'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiChevronRight, FiClock, FiTag, FiFilter, FiX } from 'react-icons/fi';
import { BikeStatus } from '@/types/bike-status';

// Types
interface UpcomingBike {
  id: string;
  name: string;
  image: string;
  expectedPrice: string;
  expectedLaunch: string;
  brand: string;
  category: string;
  description?: string;
}
export default function UpcomingBikesPage() {
  const [bikes, setBikes] = useState<BikeStatus[]>([]);
  const [filteredBikes, setFilteredBikes] = useState<BikeStatus[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch bikes from API
  useEffect(() => {
    const fetchBikes = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/bike-status?status=upcoming&limit=50');
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API Response:', data);
        
        if (data.success && data.data) {
          console.log('Setting bikes data:', data.data);
          setBikes(data.data);
        } else {
          console.log('No data found, setting error');
          setError('No upcoming bikes found');
        }
      } catch (err) {
        console.error('Error fetching bikes:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch bikes');
      } finally {
        setLoading(false);
      }
    };

    fetchBikes();
  }, []);

  // Get unique brands and categories
  const brands = Array.from(new Set(bikes.map(bike => bike.brand?.name || 'Unknown'))).sort();
  const categories = Array.from(new Set(bikes.map(bike => bike.variant?.specs?.body_type || 'Unknown'))).sort();

  // Filter bikes based on selected filters
  useEffect(() => {
    let filtered = bikes;

    if (selectedBrand) {
      filtered = filtered.filter(bike => bike.brand?.name === selectedBrand);
    }

    if (selectedCategory) {
      filtered = filtered.filter(bike => bike.variant?.specs?.body_type === selectedCategory);
    }

    setFilteredBikes(filtered);
  }, [selectedBrand, selectedCategory, bikes]);

  // Clear all filters
  const clearFilters = () => {
    setSelectedBrand('');
    setSelectedCategory('');
  };

  const hasActiveFilters = selectedBrand || selectedCategory;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="container py-6">
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <Link href="/" className="hover:text-primary">Home</Link>
            <FiChevronRight className="mx-2" />
            <span className="text-gray-900">Upcoming Bikes</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Upcoming Bikes & Scooters
          </h1>
          <p className="text-gray-600">
            {filteredBikes.length} upcoming {filteredBikes.length === 1 ? 'bike' : 'bikes'} launching soon
          </p>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="flex items-center px-4 py-2 bg-white border rounded-lg w-full justify-between"
              >
                <span className="flex items-center">
                  <FiFilter className="mr-2" />
                  Filters
                </span>
                {hasActiveFilters && (
                  <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
                    {[selectedBrand, selectedCategory].filter(Boolean).length}
                  </span>
                )}
              </button>
            </div>

            {/* Filters */}
            <div className={`bg-white rounded-lg border p-6 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium">Filters</h2>
                {hasActiveFilters && (
                  <button 
                    onClick={clearFilters}
                    className="text-sm text-primary hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Brand Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Brand</h3>
                <div className="space-y-2">
                  {brands.map((brand) => (
                    <label key={brand} className="flex items-center">
                      <input
                        type="radio"
                        name="brand"
                        value={brand}
                        checked={selectedBrand === brand}
                        onChange={(e) => setSelectedBrand(e.target.value)}
                        className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                      />
                      <span className="ml-2 text-sm text-gray-700">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Category</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <label key={category} className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        value={category}
                        checked={selectedCategory === category}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                      />
                      <span className="ml-2 text-sm text-gray-700">{category}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bikes Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              // Loading state
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="animate-pulse">
                      <div className="h-48 bg-gray-200"></div>
                      <div className="p-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                        <div className="h-8 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              // Error state
              <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-lg">
                <div className="w-16 h-16 mb-4 text-gray-300">
                  <FiClock className="w-full h-full" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading bikes</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 text-sm text-primary border border-primary rounded-md hover:bg-primary hover:text-white transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : filteredBikes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredBikes.map((bike) => (
                  <div 
                    key={bike.id}
                    className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* Bike Image */}
                    <Link href={`/bikes/${bike.variant.slug}`} className="block">
                      <div className="relative h-48 bg-gray-100">
                        <Image
                          src={bike.variant.images?.[0]?.url || '/demo.avif'}
                          alt={bike.variant.name}
                          fill
                          className="object-cover transition-transform duration-300 hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        <div className="absolute top-0 left-0 px-2 py-1 text-xs font-medium text-white bg-primary">
                          Upcoming
                        </div>
                        <div className="absolute top-0 right-0 px-2 py-1 text-xs font-medium text-white bg-black bg-opacity-70">
                          {bike.brand.name}
                        </div>
                      </div>
                    </Link>

                    {/* Bike Info */}
                    <div className="p-4">
                      <Link href={`/bikes/${bike.variant.slug}`} className="block">
                        <h3 className="text-lg font-medium text-gray-900 hover:text-primary mb-2">
                          {bike.variant.name}
                        </h3>
                      </Link>
                      
                      <div className="mb-3">
                        <div className="text-lg font-bold text-gray-900 mb-1">
                          ₹ {bike.priceRange}
                        </div>
                        <div className="text-sm text-gray-500">Expected Price</div>
                      </div>

                      {/* Expected Launch */}
                      <div className="flex items-center pt-3 mt-3 text-sm text-gray-500 border-t border-gray-100 mb-3">
                        <FiClock className="mr-2 text-gray-400" />
                        <span>Expected Launch: {bike.expectedLaunch || 'TBA'}</span>
                      </div>

                      {/* Category Tag */}
                      <div className="flex items-center mb-3">
                        <FiTag className="mr-1 text-gray-400 w-4 h-4" />
                        <span className="text-sm text-gray-600">{bike.variant.specs?.body_type || 'Unknown'}</span>
                      </div>

                      {/* CTA Button */}
                      <button className="w-full px-4 py-2 text-sm text-center text-primary transition-colors border border-primary rounded-md hover:bg-primary hover:text-white">
                        Get Notified When Launched
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Empty state
              <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-lg">
                <div className="w-16 h-16 mb-4 text-gray-300">
                  <FiClock className="w-full h-full" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming bikes found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your filters to see more upcoming bikes.
                </p>
                <button 
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm text-primary border border-primary rounded-md hover:bg-primary hover:text-white transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}