'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FiChevronRight, FiFilter, FiX, FiSearch } from 'react-icons/fi';
import BikeCard from '@/components/bikes/BikeCard';

// Filter components
import BrandFilter from '@/components/filters/BrandFilter';
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

interface BudgetInfo {
  slug: string;
  label: string;
  description: string;
  min: number;
  max: number;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function BudgetFilterPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const budgetSlug = params.budget as string;

  // State
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [budgetInfo, setBudgetInfo] = useState<BudgetInfo | null>(null);
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
  const [selectedEngineType, setSelectedEngineType] = useState<string>('');
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
      if (selectedEngineType) params.set('engineType', selectedEngineType);
      if (searchQuery) params.set('search', searchQuery);
      params.set('sortBy', sortBy);
      params.set('sortOrder', sortOrder);
      params.set('page', pagination.page.toString());
      params.set('limit', pagination.limit.toString());

      const response = await fetch(`/api/bikes/budget/${budgetSlug}?${params}`);
      
      if (!response.ok) {
        if (response.status === 404 || response.status === 400) {
          notFound();
        }
        throw new Error('Failed to fetch bikes');
      }

      const data = await response.json();
      
      setBikes(data.bikes);
      setBudgetInfo(data.budget);
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
  }, [budgetSlug, selectedBrand, selectedBodyType, selectedEngineType, searchQuery, sortBy, sortOrder, pagination.page]);

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSelectedBrand('');
    setSelectedBodyType('');
    setSelectedEngineType('');
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
              {budgetInfo?.label || 'Budget Filter'}
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
                Bikes {budgetInfo?.label}
              </h1>
              <p className="text-gray-600 mt-2">
                {budgetInfo?.description}
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

              {/* Engine Type Filter */}
              <div className="mb-6">
                <h3 className="mb-3 text-sm font-medium text-gray-700">Engine Type</h3>
                <select
                  value={selectedEngineType}
                  onChange={(e) => setSelectedEngineType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                >
                  <option value="">All Engine Types</option>
                  <option value="Petrol">Petrol</option>
                  <option value="Electric">Electric</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
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
                <p className="text-gray-600">No bikes found in this budget range.</p>
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
                <div className="flex flex-wrap gap-6">
                  {bikes.map((bike) => {
                    // Convert to BikeCard format
                    const bikeData = {
                      id: bike.id,
                      name: bike.name,
                      image: bike.image || '/demo.avif',
                      price: bike.price ? bike.price.toLocaleString('en-IN') : 'Price not available',
                      specs: {
                        engine: bike.specs.engine || bike.specs.displacement || 'N/A',
                        mileage: bike.specs.mileage || 'N/A',
                        power: bike.specs.power || 'N/A'
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