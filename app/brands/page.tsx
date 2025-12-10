'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiSearch, FiGrid, FiList } from 'react-icons/fi';
import BrandCard from '@/components/bikes/BrandCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  logoUrl?: string;
  country?: string;
  count?: number;
  _count?: {
    models: number;
  };
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const brandsPerPage = 24;

  // Fetch brands data
  useEffect(() => {
    const fetchBrands = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/brands?limit=100');
        const data = await response.json();
        
        if (data.success) {
          // Transform API response to match component expectations
          const transformedBrands = data.data.brands.map((brand: any) => ({
            ...brand,
            logoUrl: brand.logo || brand.logoUrl || '/demo.avif',
            _count: {
              models: brand.count || brand._count?.models || 0
            }
          }));
          setBrands(transformedBrands);
          setFilteredBrands(transformedBrands);
          setTotalPages(Math.ceil(transformedBrands.length / brandsPerPage));
        } else {
          setError(data.message || 'Failed to fetch brands');
        }
      } catch (err) {
        setError('Failed to fetch brands');
        console.error('Error fetching brands:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  // Filter brands based on search term
  useEffect(() => {
    const filtered = brands.filter(brand =>
      brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brand.country?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBrands(filtered);
    setTotalPages(Math.ceil(filtered.length / brandsPerPage));
    setCurrentPage(1);
  }, [searchTerm, brands]);

  // Get current page brands
  const getCurrentPageBrands = () => {
    const startIndex = (currentPage - 1) * brandsPerPage;
    const endIndex = startIndex + brandsPerPage;
    return filteredBrands.slice(startIndex, endIndex);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">All Bike Brands</h1>
            <p className="text-gray-600 mt-2">
              Discover bikes from {brands.length} top motorcycle brands
            </p>
          </div>
        </div>
      </div>

      {/* Search and Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search brands..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {filteredBrands.length} brands found
            </span>
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
      </div>

      {/* Brands Grid/List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {filteredBrands.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No brands found matching your search.</p>
          </div>
        ) : (
          <>
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6"
              : "space-y-4"
            }>
              {getCurrentPageBrands().map((brand) => (
                <BrandCard
                  key={brand.id}
                  brand={brand}
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
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let page;
                    if (totalPages <= 5) {
                      page = i + 1;
                    } else if (currentPage <= 3) {
                      page = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      page = totalPages - 4 + i;
                    } else {
                      page = currentPage - 2 + i;
                    }
                    
                    return (
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
                    );
                  })}
                  
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