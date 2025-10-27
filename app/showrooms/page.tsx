'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  FiSearch, 
  FiMapPin, 
  FiPhone, 
  FiClock, 
  FiStar, 
  FiFilter,
  FiX,
  FiChevronRight,
  FiCheckCircle,
  FiExternalLink,
  FiTrendingUp
} from 'react-icons/fi';

// Types
interface Showroom {
  id: string;
  name: string;
  slug: string;
  brand: {
    id: string;
    name: string;
    slug: string;
    logo: string;
  };
  address: {
    street: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
  };
  contact: {
    phone: string[];
    email: string;
    website?: string;
  };
  timings: {
    weekdays: string;
    weekends: string;
    holidays?: string;
  };
  services: string[];
  image: string;
  rating: number;
  reviews: number;
  verified: boolean;
  featured: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
  description?: string;
  established?: string;
  areaServed?: string[];
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface FilterData {
  cities: string[];
  brands: Array<{
    id: string;
    name: string;
    slug: string;
    logo: string;
  }>;
}

interface ApiResponse {
  data: Showroom[];
  pagination: PaginationData;
  filters: FilterData;
}

export default function ShowroomsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [showrooms, setShowrooms] = useState<Showroom[]>([]);
  const [filters, setFilters] = useState<FilterData>({ cities: [], brands: [] });
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || '');
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || '');
  const [showFeatured, setShowFeatured] = useState(searchParams.get('featured') === 'true');
  const [showVerified, setShowVerified] = useState(searchParams.get('verified') === 'true');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch showrooms
  const fetchShowrooms = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCity) params.append('city', selectedCity);
      if (selectedBrand) params.append('brand', selectedBrand);
      if (showFeatured) params.append('featured', 'true');
      if (showVerified) params.append('verified', 'true');
      params.append('page', page.toString());
      params.append('limit', '12');

      const response = await fetch(`/api/showrooms?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch showrooms');
      }
      
      const data: ApiResponse = await response.json();
      setShowrooms(data.data);
      setPagination(data.pagination);
      setFilters(data.filters);
      setError(null);
    } catch (err) {
      console.error('Error fetching showrooms:', err);
      setError('Failed to load showrooms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchShowrooms();
  }, []);

  // Handle search
  const handleSearch = () => {
    updateURL();
    fetchShowrooms(1);
  };

  // Handle filter changes
  const handleFilterChange = () => {
    updateURL();
    fetchShowrooms(1);
  };

  // Update URL with current filters
  const updateURL = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (selectedCity) params.append('city', selectedCity);
    if (selectedBrand) params.append('brand', selectedBrand);
    if (showFeatured) params.append('featured', 'true');
    if (showVerified) params.append('verified', 'true');
    
    router.push(`/showrooms?${params.toString()}`);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCity('');
    setSelectedBrand('');
    setShowFeatured(false);
    setShowVerified(false);
    router.push('/showrooms');
    fetchShowrooms(1);
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    fetchShowrooms(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasActiveFilters = searchQuery || selectedCity || selectedBrand || showFeatured || showVerified;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Find Motorcycle Showrooms
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Discover authorized dealers near you for the best prices and service
            </p>
            
            {/* Search Bar */}
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search showrooms by name, brand, or location..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <button
                  onClick={handleSearch}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <FiSearch /> Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-80">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <FiX className="w-4 h-4" />
                    Clear All
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {/* City Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => {
                      setSelectedCity(e.target.value);
                      setTimeout(handleFilterChange, 100);
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Cities</option>
                    {filters.cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                {/* Brand Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand
                  </label>
                  <select
                    value={selectedBrand}
                    onChange={(e) => {
                      setSelectedBrand(e.target.value);
                      setTimeout(handleFilterChange, 100);
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Brands</option>
                    {filters.brands.map(brand => (
                      <option key={brand.id} value={brand.slug}>{brand.name}</option>
                    ))}
                  </select>
                </div>

                {/* Feature Filters */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Features
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={showFeatured}
                        onChange={(e) => {
                          setShowFeatured(e.target.checked);
                          setTimeout(handleFilterChange, 100);
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Featured Showrooms</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={showVerified}
                        onChange={(e) => {
                          setShowVerified(e.target.checked);
                          setTimeout(handleFilterChange, 100);
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Verified Dealers</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">
                    Motorcycle Showrooms
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {loading ? 'Loading...' : `${pagination.total} showrooms found`}
                  </p>
                </div>
                
                {/* Mobile Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="md:hidden mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <FiFilter />
                  Filters
                </button>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                <p className="text-red-600">{error}</p>
                <button
                  onClick={() => fetchShowrooms(pagination.page)}
                  className="mt-2 text-red-700 hover:text-red-800 font-medium"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm border animate-pulse">
                    <div className="aspect-video bg-gray-200"></div>
                    <div className="p-6">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Showrooms Grid */}
            {!loading && !error && (
              <>
                {showrooms.length === 0 ? (
                  <div className="text-center py-12">
                    <FiMapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-500 mb-2">No showrooms found</h3>
                    <p className="text-gray-400 mb-6">Try adjusting your search or filters</p>
                    <button
                      onClick={clearFilters}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {showrooms.map((showroom) => (
                      <div key={showroom.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                        <Link href={`/showrooms/${showroom.slug}`}>
                          <div className="aspect-video relative overflow-hidden rounded-t-lg">
                            <Image
                              src={showroom.image}
                              alt={showroom.name}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                            {showroom.featured && (
                              <div className="absolute top-3 left-3">
                                <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                                  <FiTrendingUp className="w-3 h-3" />
                                  Featured
                                </span>
                              </div>
                            )}
                            {showroom.verified && (
                              <div className="absolute top-3 right-3">
                                <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                                  <FiCheckCircle className="w-3 h-3" />
                                  Verified
                                </span>
                              </div>
                            )}
                          </div>
                        </Link>

                        <div className="p-6">
                          {/* Brand Logo & Name */}
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 relative">
                              <Image
                                src={showroom.brand.logo}
                                alt={showroom.brand.name}
                                fill
                                className="object-contain"
                                sizes="40px"
                              />
                            </div>
                            <div>
                              <Link 
                                href={`/showrooms/${showroom.slug}`}
                                className="font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                              >
                                {showroom.name}
                              </Link>
                              <p className="text-sm text-gray-500">{showroom.brand.name}</p>
                            </div>
                          </div>

                          {/* Rating */}
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex items-center gap-1">
                              <FiStar className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="font-medium text-gray-900">{showroom.rating}</span>
                            </div>
                            <span className="text-gray-500 text-sm">({showroom.reviews} reviews)</span>
                          </div>

                          {/* Location */}
                          <div className="flex items-start gap-2 mb-3">
                            <FiMapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-gray-600">
                              <p>{showroom.address.area}, {showroom.address.city}</p>
                              <p>{showroom.address.state} - {showroom.address.pincode}</p>
                            </div>
                          </div>

                          {/* Timings */}
                          <div className="flex items-center gap-2 mb-4">
                            <FiClock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{showroom.timings.weekdays}</span>
                          </div>

                          {/* Services */}
                          <div className="flex flex-wrap gap-1 mb-4">
                            {showroom.services.slice(0, 3).map((service, index) => (
                              <span
                                key={index}
                                className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                              >
                                {service}
                              </span>
                            ))}
                            {showroom.services.length > 3 && (
                              <span className="text-gray-500 text-xs">
                                +{showroom.services.length - 3} more
                              </span>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            <Link
                              href={`/showrooms/${showroom.slug}`}
                              className="flex-1 bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                            >
                              View Details
                              <FiChevronRight className="w-4 h-4" />
                            </Link>
                            <a
                              href={`tel:${showroom.contact.phone[0]}`}
                              className="bg-gray-100 text-gray-700 p-2 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                              <FiPhone className="w-5 h-5" />
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={!pagination.hasPrevPage}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      
                      {[...Array(pagination.totalPages)].map((_, index) => {
                        const page = index + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-4 py-2 border rounded-lg ${
                              page === pagination.page
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={!pagination.hasNextPage}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
      </div>
    </div>
  );
}