'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FiMapPin, FiClock, FiPhone, FiSearch, FiFilter } from 'react-icons/fi';

// Define types
interface ChargingStation {
  id: string;
  name: string;
  slug: string;
  location: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  email?: string;
  timing: string;
  connectorTypes: string[];
  chargingSpeed: string;
  status: 'Available' | 'Occupied' | 'Maintenance' | 'Out of Order';
  pricing: string;
  amenities: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
  description?: string;
  operator?: string;
  capacity?: number;
  powerOutput?: string;
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
  states: string[];
  operators: string[];
  statuses: string[];
}

interface ApiResponse {
  data: ChargingStation[];
  pagination: PaginationData;
  filters: FilterData;
}

export default function ChargingStationsPage() {
  const [stations, setStations] = useState<ChargingStation[]>([]);
  const [filters, setFilters] = useState<FilterData>({ 
    cities: [], 
    states: [], 
    operators: [], 
    statuses: [] 
  });
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
  const [selectedState, setSelectedState] = useState('All States');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch charging stations
  const fetchStations = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCity && selectedCity !== 'All Cities') params.append('city', selectedCity);
      if (selectedState && selectedState !== 'All States') params.append('state', selectedState);
      if (selectedStatus) params.append('status', selectedStatus);
      params.append('page', page.toString());
      params.append('limit', '12');

      const response = await fetch(`/api/charging-stations?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch charging stations');
      }
      
      const data: ApiResponse = await response.json();
      setStations(data.data);
      setPagination(data.pagination);
      setFilters(data.filters);
      setError(null);
    } catch (err) {
      console.error('Error fetching charging stations:', err);
      setError('Failed to load charging stations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchStations();
  }, []);

  // Handle filter changes
  useEffect(() => {
    fetchStations(1);
  }, [selectedState, selectedCity, selectedStatus, searchTerm]);

  const openInMaps = (coordinates: { lat: number; lng: number }) => {
    const { lat, lng } = coordinates;
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, '_blank');
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    fetchStations(newPage);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Electric Charging Stations
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-red-100">
              Electric Charging stations in India
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                  <FiMapPin className="w-8 h-8" />
                </div>
                <p className="text-sm">Mumbai</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                  <FiMapPin className="w-8 h-8" />
                </div>
                <p className="text-sm">Delhi</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                  <FiMapPin className="w-8 h-8" />
                </div>
                <p className="text-sm">Gurgaon</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                  <FiMapPin className="w-8 h-8" />
                </div>
                <p className="text-sm">Pune</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white shadow-md py-6">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">
              Search Electric Charging Station in India
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or location"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {filters.states.map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {filters.cities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                {filters.statuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <button className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2">
                <FiFilter className="w-4 h-4" />
                Filter
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Charging Stations List */}
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold">
                Electric Charging Stations ({pagination.total})
              </h3>
              <div className="text-sm text-gray-600">
                Showing {stations.length} results
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                <p className="mt-2 text-gray-600">Loading charging stations...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">{error}</p>
                <button 
                  onClick={() => fetchStations(1)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                >
                  Retry
                </button>
              </div>
            ) : stations.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <FiMapPin className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No charging stations found</h3>
                <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
              </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stations.map((station) => (
                <div key={station.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {station.name}
                      </h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        station.status === 'Available' 
                          ? 'bg-green-100 text-green-800' 
                          : station.status === 'Occupied'
                          ? 'bg-red-100 text-red-800'
                          : station.status === 'Maintenance'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {station.status}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <FiMapPin className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{station.location}</p>
                          <p className="text-xs text-gray-600">{station.address}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <FiClock className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-gray-700">{station.timing}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <FiPhone className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-gray-700">{station.phone}</span>
                      </div>

                      <div className="border-t pt-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-900">Charging Speed:</span>
                          <span className="text-sm text-gray-700">{station.chargingSpeed}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-900">Pricing:</span>
                          <span className="text-sm text-gray-700">{station.pricing}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {station.connectorTypes.map((type, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              {type}
                            </span>
                          ))}
                        </div>
                        {station.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {station.amenities.map((amenity, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                {amenity}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <button 
                        onClick={() => openInMaps(station.coordinates)}
                        className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
                      >
                        Get Directions
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            )}

            {/* Pagination */}
            {!loading && !error && pagination.totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <div className="flex space-x-1">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={!pagination.hasPrevPage}
                    className={`px-3 py-2 rounded-md ${
                      pagination.hasPrevPage
                        ? 'bg-white border border-gray-300 text-gray-500 hover:bg-gray-50'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Previous
                  </button>
                  
                  {[...Array(Math.min(pagination.totalPages, 10))].map((_, i) => {
                    const pageNumber = i + 1;
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`px-3 py-2 rounded-md ${
                          pagination.page === pageNumber
                            ? 'bg-red-500 text-white'
                            : 'bg-white border border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!pagination.hasNextPage}
                    className={`px-3 py-2 rounded-md ${
                      pagination.hasNextPage
                        ? 'bg-white border border-gray-300 text-gray-500 hover:bg-gray-50'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}