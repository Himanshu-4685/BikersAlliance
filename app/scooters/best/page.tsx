'use client';

import React, { useState, useEffect } from 'react';
import { FiZap, FiDollarSign, FiDroplet, FiTrendingUp } from 'react-icons/fi';
import BikeCard from '@/components/bikes/BikeCard';
import { Bike } from '@/types/bike';

interface BestScooter {
  variant_id: number;
  brand_name: string;
  model_name: string;
  variant_name: string;
  on_road_price: number;
  displacement: string;
  city_mileage: string;
  image_url?: string | null;
}

interface BestScootersApiResponse {
  success: boolean;
  data?: BestScooter[];
  total?: number;
  criteria?: {
    priceRange: string;
    displacement: string;
    minMileage: string;
    category: string;
  };
  error?: string;
}

export default function BestScootersPage() {
  const [scooters, setScooters] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [criteria, setCriteria] = useState<any>(null);

  // Helper function to format price
  const formatPrice = (price: number): string => {
    return `₹${price.toLocaleString()}`;
  };

  const fetchBestScooters = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/best-scooters');
      
      if (!response.ok) {
        throw new Error('Failed to fetch best scooters');
      }
      
      const data: BestScootersApiResponse = await response.json();
      
      if (data.success && data.data) {
        // Convert API data to Bike format for BikeCard component
        const formattedScooters: Bike[] = data.data.map((scooter) => {
          // Clean up the scooter name - remove duplicate brand names
          let cleanName = scooter.variant_name;
          
          // If variant name doesn't start with brand name, add it
          if (!cleanName.toLowerCase().includes(scooter.brand_name.toLowerCase())) {
            cleanName = `${scooter.brand_name} ${cleanName}`;
          }
          
          // Clean up any duplicate brand/model names
          const brandWords = scooter.brand_name.split(' ');
          brandWords.forEach(word => {
            const regex = new RegExp(`\\b${word}\\s+${word}\\b`, 'gi');
            cleanName = cleanName.replace(regex, word);
          });
          
          return {
            id: scooter.variant_id.toString(),
            name: cleanName,
            slug: scooter.variant_id.toString(),
            image: scooter.image_url || '/demo.avif',
            price: formatPrice(scooter.on_road_price),
            specs: {
              engine: scooter.displacement,
              mileage: scooter.city_mileage,
              power: 'N/A' // Power not available in current data
            }
          };
        });
        
        setScooters(formattedScooters);
        if (data.criteria) {
          setCriteria(data.criteria);
        }
      } else {
        throw new Error(data.error || 'Failed to fetch scooters');
      }
    } catch (err) {
      console.error('Error fetching best scooters:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBestScooters();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          <p>Error: {error}</p>
          <button
            onClick={fetchBestScooters}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Best Value Scooters
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
          Discover the most fuel-efficient and affordable scooters perfect for city commuting. 
          Our curated selection offers exceptional value for money with proven reliability and performance.
        </p>
        
        {criteria && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 max-w-4xl mx-auto">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Selection Criteria</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center justify-center bg-white rounded-lg p-4 shadow-sm">
                <FiDollarSign className="text-green-600 mr-2" size={20} />
                <div className="text-center">
                  <p className="text-sm text-gray-600">Price Range</p>
                  <p className="font-semibold text-gray-800">{criteria.priceRange}</p>
                </div>
              </div>
              <div className="flex items-center justify-center bg-white rounded-lg p-4 shadow-sm">
                <FiZap className="text-orange-600 mr-2" size={20} />
                <div className="text-center">
                  <p className="text-sm text-gray-600">Displacement</p>
                  <p className="font-semibold text-gray-800">{criteria.displacement}</p>
                </div>
              </div>
              <div className="flex items-center justify-center bg-white rounded-lg p-4 shadow-sm">
                <FiDroplet className="text-blue-600 mr-2" size={20} />
                <div className="text-center">
                  <p className="text-sm text-gray-600">Mileage</p>
                  <p className="font-semibold text-gray-800">{criteria.minMileage}</p>
                </div>
              </div>
              <div className="flex items-center justify-center bg-white rounded-lg p-4 shadow-sm">
                <FiTrendingUp className="text-purple-600 mr-2" size={20} />
                <div className="text-center">
                  <p className="text-sm text-gray-600">Category</p>
                  <p className="font-semibold text-gray-800">{criteria.category}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
            {scooters.length} Best Value Scooters
          </h2>
          <div className="text-sm text-gray-600">
            Showing all scooters matching our strict criteria
          </div>
        </div>
      </div>

      {/* Scooters Grid */}
      {scooters.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {scooters.map((scooter) => (
            <BikeCard
              key={scooter.id}
              bike={scooter}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <FiZap size={48} className="mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No Scooters Found</h3>
            <p>No scooters match our current criteria. Please check back later for updates.</p>
          </div>
        </div>
      )}
    </div>
  );
}