'use client';

import { useEffect, useState } from 'react';
import { FiLoader, FiDollarSign, FiZap, FiActivity } from 'react-icons/fi';
import BikeCard from '@/components/bikes/BikeCard';
import { Bike } from '@/types/bike';

interface BestBike {
  variant_id: number;
  brand_name: string;
  model_name: string;
  variant_name: string;
  on_road_price: number;
  displacement: string;
  city_mileage: string;
  image_url?: string;
}

interface BestBikesResponse {
  success: boolean;
  data: BestBike[];
  total: number;
  criteria: {
    priceRange: string;
    displacement: string;
    minMileage: string;
  };
  error?: string;
}

export default function Page() {
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [criteria, setCriteria] = useState<BestBikesResponse['criteria'] | null>(null);

  useEffect(() => {
    fetchBestBikes();
  }, []);

  const fetchBestBikes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/best-bikes');
      const data: BestBikesResponse = await response.json();
      
      if (data.success) {
        // Convert API data to Bike format for BikeCard component
        const formattedBikes: Bike[] = data.data.map((bike, index) => {
          // Clean up the bike name - remove duplicate brand names
          let cleanName = bike.variant_name;
          
          // If variant name doesn't start with brand name, add it
          if (!cleanName.toLowerCase().includes(bike.brand_name.toLowerCase())) {
            cleanName = `${bike.brand_name} ${cleanName}`;
          }
          
          // Clean up any duplicate brand/model names
          const brandWords = bike.brand_name.split(' ');
          brandWords.forEach(word => {
            const regex = new RegExp(`\\b${word}\\s+${word}\\b`, 'gi');
            cleanName = cleanName.replace(regex, word);
          });
          
          return {
            id: bike.variant_id.toString(),
            name: cleanName,
            slug: bike.variant_id.toString(), // Use variant_id for navigation
            image: bike.image_url || '/demo.avif',
            price: formatPrice(bike.on_road_price),
            specs: {
              engine: bike.displacement,
              mileage: bike.city_mileage,
              power: 'N/A' // Power not available in current data
            }
          };
        });
        setBikes(formattedBikes);
        setCriteria(data.criteria);
      } else {
        setError(data.error || 'Failed to fetch best bikes');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error fetching best bikes:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)} Lakh`;
    }
    return `₹${price.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FiLoader className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-4" />
          <p className="text-gray-600">Loading best bikes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchBestBikes}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Best Value Bikes
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Discover the perfect balance of performance, fuel efficiency, and affordability
            </p>
            
            {/* Selection Criteria */}
            {criteria && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-3xl mx-auto">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Selection Criteria</h3>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center justify-center space-x-2">
                    <FiDollarSign className="h-4 w-4 text-blue-600" />
                    <span className="text-blue-800">Price: {criteria.priceRange}</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <FiActivity className="h-4 w-4 text-blue-600" />
                    <span className="text-blue-800">Engine: {criteria.displacement}</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <FiZap className="h-4 w-4 text-blue-600" />
                    <span className="text-blue-800">Mileage: {criteria.minMileage}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {bikes.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">No Bikes Found</h3>
              <p className="text-yellow-700">
                No bikes match the current criteria. Try adjusting your filters.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">
                {bikes.length} Best Value Bikes Found
              </h2>
              <button
                onClick={fetchBestBikes}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Refresh
              </button>
            </div>

            {/* Bikes Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {bikes.map((bike) => (
                <div key={bike.id} className="w-full">
                  <BikeCard bike={bike} />
                </div>
              ))}
            </div>

            {/* Footer Note */}
            <div className="mt-12 text-center">
              <div className="bg-gray-100 rounded-lg p-6 max-w-4xl mx-auto">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  About Our Selection
                </h4>
                <p className="text-gray-700 text-sm leading-relaxed">
                  These bikes are carefully selected based on optimal price-to-performance ratio, 
                  fuel efficiency, and engine capacity. They represent the best value in the 
                  mid-range motorcycle segment, perfect for daily commuting and weekend rides.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}