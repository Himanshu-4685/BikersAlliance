'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FiChevronRight, FiFilter, FiX, FiSearch } from 'react-icons/fi';
import { ElectricBike } from '@/types/bike';

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function ElectricBikesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [bikes, setBikes] = useState<ElectricBike[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0
  });
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState(searchParams?.get('search') || '');
  const [sortBy, setSortBy] = useState(searchParams?.get('sortBy') || 'price');
  const [sortOrder, setSortOrder] = useState(searchParams?.get('sortOrder') || 'asc');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch electric bikes
  const fetchElectricBikes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/bikes/electric');
      
      if (!response.ok) {
        throw new Error('Failed to fetch electric bikes');
      }
      
      const data = await response.json();
      
      if (data.success && data.data?.bikes) {
        let filteredBikes = data.data.bikes;
        
        // Apply search filter
        if (searchTerm) {
          filteredBikes = filteredBikes.filter((bike: ElectricBike) =>
            bike.variant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bike.brand_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bike.model_name.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        // Apply sorting
        filteredBikes.sort((a: ElectricBike, b: ElectricBike) => {
          let aValue: any, bValue: any;
          
          switch (sortBy) {
            case 'price':
              aValue = a.on_road_price;
              bValue = b.on_road_price;
              break;
            case 'name':
              aValue = a.variant_name.toLowerCase();
              bValue = b.variant_name.toLowerCase();
              break;
            case 'brand':
              aValue = a.brand_name.toLowerCase();
              bValue = b.brand_name.toLowerCase();
              break;
            case 'power':
              aValue = a.peak_power || 0;
              bValue = b.peak_power || 0;
              break;
            default:
              aValue = a.on_road_price;
              bValue = b.on_road_price;
          }
          
          if (sortOrder === 'desc') {
            return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
          } else {
            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
          }
        });
        
        setBikes(filteredBikes);
        setPagination({
          total: filteredBikes.length,
          page: 1,
          limit: 12,
          totalPages: Math.ceil(filteredBikes.length / 12)
        });
      } else {
        setBikes([]);
      }
    } catch (err) {
      console.error('Error fetching electric bikes:', err);
      setError(err instanceof Error ? err.message : 'Failed to load electric bikes');
      setBikes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchElectricBikes();
  }, [searchTerm, sortBy, sortOrder]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN').format(price);
  };

  const formatRange = (mileage: number) => {
    const range = Math.round(mileage * 1.5);
    return `${range} Km`;
  };

  const formatTopSpeed = (power: number) => {
    const topSpeed = Math.round(power * 2.5);
    return `${topSpeed} Kmph`;
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    const params = new URLSearchParams(searchParams?.toString());
    if (value) {
      params.set('search', value);
    } else {
      params.delete('search');
    }
    router.push(`/electric?${params.toString()}`);
  };

  const handleSort = (field: string, order: string) => {
    setSortBy(field);
    setSortOrder(order);
    const params = new URLSearchParams(searchParams?.toString());
    params.set('sortBy', field);
    params.set('sortOrder', order);
    router.push(`/electric?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
            <Link href="/" className="hover:text-primary">Home</Link>
            <FiChevronRight className="w-4 h-4" />
            <span className="text-gray-900">Electric Bikes</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Electric Bikes in India</h1>
              <p className="text-gray-600 mt-2">
                Discover the latest electric motorcycles and scooters with zero emissions
              </p>
            </div>

            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search electric bikes..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent w-full sm:w-80"
                />
              </div>

              {/* Sort */}
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  handleSort(field, order);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
                <option value="brand-asc">Brand: A to Z</option>
                <option value="power-desc">Power: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Results Count */}
        {!loading && (
          <div className="mb-6">
            <p className="text-gray-600">
              {bikes.length > 0 
                ? `Showing ${bikes.length} electric bike${bikes.length === 1 ? '' : 's'}`
                : 'No electric bikes found'
              }
              {searchTerm && ` matching "${searchTerm}"`}
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex justify-center items-center h-64">
            <div className="text-red-500 text-center">
              <p className="text-lg font-medium">Failed to load electric bikes</p>
              <p className="text-sm text-gray-500 mt-1">{error}</p>
              <button
                onClick={fetchElectricBikes}
                className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && bikes.length === 0 && (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500 text-center">
              <h3 className="text-lg font-medium">No electric bikes found</h3>
              <p className="text-sm mt-1">Try adjusting your search or filters</p>
              {searchTerm && (
                <button
                  onClick={() => handleSearch('')}
                  className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Clear Search
                </button>
              )}
            </div>
          </div>
        )}

        {/* Bikes Grid */}
        {!loading && !error && bikes.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {bikes.map((bike) => (
              <div
                key={bike.variant_id}
                className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Bike Image */}
                <div className="relative h-48 bg-gray-100">
                  <Image
                    src={bike.image_url}
                    alt={bike.variant_name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                  />
                  {/* Brand Logo */}
                  {bike.brand_logo && (
                    <div className="absolute top-2 left-2 w-8 h-8 bg-white rounded-full p-1 shadow-sm">
                      <Image
                        src={bike.brand_logo}
                        alt={bike.brand_name}
                        fill
                        className="object-contain"
                        sizes="32px"
                      />
                    </div>
                  )}
                  {/* Electric Badge */}
                  <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    Electric
                  </div>
                </div>

                {/* Bike Info */}
                <div className="p-4">
                  <div className="mb-3">
                    <h3 className="font-semibold text-gray-900 text-lg line-clamp-1">
                      {bike.variant_name}
                    </h3>
                    <p className="text-sm text-gray-500">{bike.brand_name}</p>
                    <p className="text-lg font-bold text-primary mt-1">
                      ₹ {formatPrice(bike.on_road_price)}
                    </p>
                  </div>

                  {/* Key Specs */}
                  <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                    <div>
                      <span className="text-gray-500">Range:</span>
                      <span className="ml-1 font-medium">{formatRange(bike.city_mileage || 50)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Top Speed:</span>
                      <span className="ml-1 font-medium">{formatTopSpeed(bike.peak_power || 5)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Power:</span>
                      <span className="ml-1 font-medium">{bike.peak_power || 'N/A'} kW</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Type:</span>
                      <span className="ml-1 font-medium">{bike.bike_style}</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <Link
                    href={`/bikes/${bike.variant_url}`}
                    className="block w-full text-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}