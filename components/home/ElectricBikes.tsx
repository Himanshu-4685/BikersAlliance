'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { ElectricBike, Bike } from '@/types/bike';
import BikeCard from '@/components/bikes/BikeCard';

// Helper function to convert ElectricBike to standard Bike format
const formatElectricBikeData = (electricBike: ElectricBike): Bike => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN').format(price);
  };

  const formatRange = (mileage: number) => {
    // For electric bikes, assume range is approximately mileage * 1.5 (rough estimate)
    const range = Math.round(mileage * 1.5);
    return `${range} km`;
  };

  const formatPower = (power: number) => {
    return `${power} kW`;
  };

  return {
    id: electricBike.variant_id,
    name: electricBike.variant_name,
    slug: electricBike.variant_url,
    image: electricBike.image_url,
    price: formatPrice(electricBike.on_road_price),
    specs: {
      engine: 'Electric',
      mileage: formatRange(electricBike.city_mileage || 50),
      power: formatPower(electricBike.peak_power || 5)
    }
  };
};

export default function ElectricBikes() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [electricBikes, setElectricBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchElectricBikes = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/bikes/electric');
        
        if (!response.ok) {
          throw new Error('Failed to fetch electric bikes');
        }
        
        const data = await response.json();
        
        if (data.success && data.data?.bikes) {
          const formattedBikes = data.data.bikes.map(formatElectricBikeData);
          setElectricBikes(formattedBikes);
        } else {
          setElectricBikes([]);
        }
      } catch (err) {
        console.error('Error fetching electric bikes:', err);
        setError(err instanceof Error ? err.message : 'Failed to load electric bikes');
        setElectricBikes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchElectricBikes();
  }, []);
  
  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };
  
  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };


  
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl text-gray-900" style={{ fontFamily: 'Lato, sans-serif, Arial', fontSize: '23px', fontWeight: 500 }}>
          <b>Electric Bikes in India</b>
        </h2>
        <Link href="/electric" className="px-4 py-2 text-sm text-primary border border-primary rounded-md hover:bg-primary hover:text-white transition-colors">
          View All Electric Bikes
        </Link>
      </div>
      
      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex justify-center items-center h-64">
          <div className="text-red-500 text-center">
            <p>Failed to load electric bikes</p>
            <p className="text-sm text-gray-500 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && electricBikes.length === 0 && (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500 text-center">
            <p>No electric bikes available at the moment</p>
          </div>
        </div>
      )}
      
      {/* Carousel with side arrows */}
      {!loading && !error && electricBikes.length > 0 && (
        <div className="relative flex items-center">
          {/* Left Arrow */}
          <button 
            onClick={scrollLeft}
            className="absolute -left-4 z-10 flex items-center justify-center w-10 h-10 transition-colors bg-white border border-gray-200 rounded-full shadow hover:bg-gray-50"
            aria-label="Scroll left"
          >
            <FiChevronLeft className="w-6 h-6" />
          </button>
          
          {/* Electric Bikes Slider */}
          <div 
            ref={sliderRef}
            className="flex gap-4 overflow-x-hidden scrollbar-hide snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
          {electricBikes.map((bike) => (
            <BikeCard 
              key={bike.id} 
              bike={bike} 
              viewMode="grid"
            />
          ))}
          
          <div className="flex-none w-[200px] snap-start">
            <Link 
              href="/electric"
              className="flex flex-col items-center justify-center h-full min-h-[300px] rounded-lg border-2 border-dashed border-gray-300 bg-white hover:border-primary hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-center w-12 h-12 mb-2 text-white rounded-full bg-primary">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
              <p className="text-sm font-medium text-primary">View All Electric Bikes</p>
            </Link>
          </div>
          </div>
          
          {/* Right Arrow */}
          <button 
            onClick={scrollRight}
            className="absolute -right-4 z-10 flex items-center justify-center w-10 h-10 transition-colors bg-white border border-gray-200 rounded-full shadow hover:bg-gray-50"
            aria-label="Scroll right"
          >
            <FiChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}