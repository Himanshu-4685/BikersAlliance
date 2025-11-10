'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FiChevronRight, FiFilter, FiX, FiSearch } from 'react-icons/fi';

// Filter components
import BrandFilter from '@/components/filters/BrandFilter';
import PriceFilter from '@/components/filters/PriceFilter';
import EngineFilter from '@/components/filters/EngineFilter';
import SortSelector from '@/components/filters/SortSelector';

// Types
interface Bike {
  id: string;
  name: string;
  slug: string;
  brand: {
    name: string;
    logo: string | null;
  };
  model: string;
  image: string | null;
  price: number;
  specs: {
    bodyType?: string;
    engine?: string;
    displacement?: string;
    power?: string;
    mileage?: string;
  };
}

interface EngineTypeInfo {
  slug: string;
  type: string;
  label: string;
  description: string;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function EngineTypeFilterPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const engineTypeSlug = params.engineType as string;

  // State
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [engineTypeInfo, setEngineTypeInfo] = useState<EngineTypeInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0
  });

  // Filter states
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedBodyType, setSelectedBodyType] = useState<string>('');
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [minDisplacement, setMinDisplacement] = useState<number | undefined>(undefined);
  const [maxDisplacement, setMaxDisplacement] = useState<number | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('price');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Fetch bikes data
  const fetchBikes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      // Add filters to params
      if (selectedBrand) params.set('brand', selectedBrand);
      if (selectedBodyType) params.set('bodyType', selectedBodyType);
      if (minPrice !== undefined) params.set('minPrice', minPrice.toString());
      if (maxPrice !== undefined) params.set('maxPrice', maxPrice.toString());
      if (minDisplacement !== undefined) params.set('minDisplacement', minDisplacement.toString());
      if (maxDisplacement !== undefined) params.set('maxDisplacement', maxDisplacement.toString());
      if (searchQuery) params.set('search', searchQuery);
      params.set('sortBy', sortBy);
      params.set('sortOrder', sortOrder);
      params.set('page', pagination.page.toString());
      params.set('limit', pagination.limit.toString());

      const response = await fetch(`/api/bikes/engine-type/${engineTypeSlug}?${params}`);
      
      if (!response.ok) {
        if (response.status === 404 || response.status === 400) {
          notFound();
        }
        throw new Error('Failed to fetch bikes');
      }

      const data = await response.json();
      
      setBikes(data.bikes);
      setEngineTypeInfo(data.engineType);
      setPagination(data.pagination);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBikes();
  }, [engineTypeSlug, selectedBrand, selectedBodyType, minPrice, maxPrice, minDisplacement, maxDisplacement, searchQuery, sortBy, sortOrder, pagination.page]);

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSelectedBrand('');
    setSelectedBodyType('');
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setMinDisplacement(undefined);
    setMaxDisplacement(undefined);
    setSearchQuery('');
    setSortBy('price');
    setSortOrder('asc');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-primary">
              Home
            </Link>
            <FiChevronRight className="text-gray-300" />
            <Link href="/bikes" className="text-gray-500 hover:text-primary">
              Bikes
            </Link>
            <FiChevronRight className="text-gray-300" />
            <span className="text-primary font-medium">
              {engineTypeInfo?.label || 'Engine Type Filter'}
            </span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {engineTypeInfo?.label || 'Engine Type Bikes'}
              </h1>
              <p className="text-gray-600 mt-2">
                {engineTypeInfo?.description}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {pagination.total} bikes found
              </p>
            </div>
            
            {/* Mobile filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden px-4 py-2 bg-primary text-white rounded-md flex items-center space-x-2"
            >
              <FiFilter />
              <span>Filters</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className={`md:w-1/4 ${showFilters ? 'block' : 'hidden md:block'}`}>
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary hover:text-primary-600"
                >
                  Clear All
                </button>
              </div>

              {/* Search */}
              <form onSubmit={handleSearch} className="mb-6">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search bikes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>
              </form>

              {/* Brand Filter */}
              <div className="mb-6">
                <BrandFilter
                  selectedBrand={selectedBrand}
                  onChange={(brand) => setSelectedBrand(brand || '')}
                />
              </div>

              {/* Body Type Filter */}
              <div className="mb-6">
                <h3 className="mb-3 text-sm font-medium text-gray-700">Body Type</h3>
                <select
                  value={selectedBodyType}
                  onChange={(e) => setSelectedBodyType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                >
                  <option value="">All Body Types</option>
                  <option value="Sports">Sports Bikes</option>
                  <option value="Commuter">Commuter Bikes</option>
                  <option value="Cruiser">Cruiser Bikes</option>
                  <option value="Adventure">Adventure Bikes</option>
                  <option value="Scooter">Scooters</option>
                  <option value="Electric">Electric Bikes</option>
                  <option value="Naked">Naked Bikes</option>
                  <option value="Touring">Touring Bikes</option>
                </select>
              </div>

              {/* Price Filter */}
              <div className="mb-6">
                <PriceFilter
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  onChange={(min, max) => {
                    setMinPrice(min);
                    setMaxPrice(max);
                  }}
                />
              </div>

              {/* Displacement Filter */}
              <div className="mb-6">
                <EngineFilter
                  minDisplacement={minDisplacement}
                  maxDisplacement={maxDisplacement}
                  onChange={(min, max) => {
                    setMinDisplacement(min);
                    setMaxDisplacement(max);
                  }}
                />
              </div>

              {/* Sort Options */}
              <div>
                <SortSelector
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onChange={(field: string, order: string) => {
                    setSortBy(field);
                    setSortOrder(order as 'asc' | 'desc');
                  }}
                />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:w-3/4">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading bikes...</p>
              </div>
            ) : bikes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No bikes found with this engine type.</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-600"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                {/* Bikes Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {bikes.map((bike) => (
                    <div
                      key={bike.id}
                      className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="aspect-w-16 aspect-h-12">
                        {bike.image ? (
                          <Image
                            src={bike.image}
                            alt={bike.name}
                            width={400}
                            height={300}
                            className="w-full h-48 object-cover"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400">No Image</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-500">{bike.brand.name}</span>
                          {bike.brand.logo && (
                            <Image
                              src={bike.brand.logo}
                              alt={bike.brand.name}
                              width={24}
                              height={24}
                              className="w-6 h-6 object-contain"
                            />
                          )}
                        </div>
                        
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                          {bike.name}
                        </h3>
                        
                        <div className="text-2xl font-bold text-primary mb-3">
                          ₹{bike.price?.toLocaleString('en-IN') || 'N/A'}
                        </div>
                        
                        <div className="space-y-1 text-sm text-gray-600 mb-4">
                          {bike.specs.displacement && (
                            <div>{bike.specs.displacement}</div>
                          )}
                          {bike.specs.engine && (
                            <div>{bike.specs.engine}</div>
                          )}
                          {bike.specs.mileage && (
                            <div>{bike.specs.mileage}</div>
                          )}
                        </div>
                        
                        <div className="flex space-x-2">
                          <Link
                            href={`/bikes/${bike.slug}`}
                            className="flex-1 px-4 py-2 bg-primary text-white text-center rounded-md hover:bg-primary-600 transition-colors"
                          >
                            View Details
                          </Link>
                          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
                            Compare
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <div className="flex space-x-2">
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-4 py-2 rounded-md ${
                            page === pagination.page
                              ? 'bg-primary text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
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