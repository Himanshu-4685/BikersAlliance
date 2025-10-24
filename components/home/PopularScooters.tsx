'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { BikeFromDB, Bike } from '@/types/bike';

// Helper function to truncate text with ellipsis
const truncateText = (text: string, maxLength: number): string => {
  if (!text) return 'N/A';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Helper function to clean and format values that might already contain units
const cleanAndFormatValue = (value: any, unit: string): string => {
  if (!value) return 'N/A';
  
  const stringValue = String(value).trim();
  
  // If the value already contains the unit, return as is
  if (stringValue.toLowerCase().includes(unit.toLowerCase())) {
    return stringValue;
  }
  
  // If it's just a number, add the unit
  const numericValue = parseFloat(stringValue);
  if (!isNaN(numericValue)) {
    return `${numericValue} ${unit}`;
  }
  
  // Fallback: return the value as is
  return stringValue;
};

// Function to format database bike data for UI
const formatScooterData = (dbBike: BikeFromDB): Bike => {
  const isElectric = dbBike.bike_style === 'electric' || dbBike.engine_type === 'electric';
  
  return {
    id: dbBike.variant_id,
    name: dbBike.variant_name, // Just show the variant name
    slug: dbBike.variant_url, // Add slug for navigation
    image: dbBike.image_url || '/demo.avif',
    price: dbBike.on_road_price?.toLocaleString('en-IN') || 'N/A',
    specs: {
      engine: isElectric 
        ? 'Electric' 
        : cleanAndFormatValue(dbBike.displacement, 'cc'),
      mileage: isElectric 
        ? cleanAndFormatValue(dbBike.city_mileage, 'km')
        : cleanAndFormatValue(dbBike.city_mileage, 'kmpl'),
      power: isElectric 
        ? cleanAndFormatValue(dbBike.peak_power, 'kW')
        : cleanAndFormatValue(dbBike.peak_power, 'PS'),
    }
  };
};

export default function PopularScooters() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [scooters, setScooters] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch scooters on component mount
  useEffect(() => {
    const fetchScooters = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('Fetching scooters with body_type=scooter');
        const response = await fetch('/api/bikes/scooters');
        const data = await response.json();
        
        console.log('API Response:', data);
        
        if (data.success) {
          const formattedScooters = data.data.bikes.map(formatScooterData);
          console.log('Formatted scooters:', formattedScooters);
          setScooters(formattedScooters);
        } else {
          setError(data.message || 'Failed to fetch scooters');
        }
      } catch (err) {
        setError('Failed to fetch scooters');
        console.error('Error fetching scooters:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchScooters();
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
          <b>Scooters in Spotlight</b>
        </h2>
        <Link href="/scooters" className="px-4 py-2 text-sm text-primary border border-primary rounded-md hover:bg-primary hover:text-white transition-colors">
          View All Scooters
        </Link>
      </div>
      
      {/* Carousel with side arrows */}
      <div className="relative flex items-center">
        {/* Left Arrow */}
        <button 
          onClick={scrollLeft}
          className="absolute -left-4 z-10 flex items-center justify-center w-10 h-10 transition-colors bg-white border border-gray-200 rounded-full shadow hover:bg-gray-50"
          aria-label="Scroll left"
        >
          <FiChevronLeft className="w-6 h-6" />
        </button>
        
        {/* Scooters Slider */}
        <div 
          ref={sliderRef}
          className="flex gap-4 overflow-x-hidden scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
        {loading ? (
          // Loading skeleton
          <div className="flex gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-none w-[270px] snap-start">
                <div className="overflow-hidden bg-white border border-gray-200 rounded-lg animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-4">
                    <div className="h-4 mb-2 bg-gray-200 rounded"></div>
                    <div className="h-6 mb-3 bg-gray-200 rounded w-2/3"></div>
                    <div className="grid grid-cols-3 gap-2 pt-3 mt-3 border-t border-gray-100">
                      <div className="h-8 bg-gray-200 rounded"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-8 mt-4 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          // Error state
          <div className="flex justify-center items-center h-48 text-red-600">
            {error}
          </div>
        ) : scooters.length === 0 ? (
          // No scooters found
          <div className="flex justify-center items-center h-48 text-gray-500">
            No scooters found
          </div>
        ) : (
          // Scooters data
          scooters.map((scooter) => (
            <div 
              key={scooter.id} 
              className="flex-none w-[270px] snap-start"
            >
            <div className="overflow-hidden transition-shadow bg-white border border-gray-200 rounded-lg hover:shadow-md">
              {/* Scooter Image */}
              <Link href={`/bikes/${scooter.slug || scooter.id}`} className="block">
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  <Image
                    src={scooter.image}
                    alt={scooter.name}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 270px"
                  />
                </div>
              </Link>
              
              {/* Scooter Info */}
              <div className="p-4">
                <Link href={`/bikes/${scooter.slug || scooter.id}`} className="block">
                  <h3 className="mb-2 text-lg font-medium text-gray-900 hover:text-primary">
                    {truncateText(scooter.name, 22)}
                  </h3>
                </Link>
                <div className="mb-3 text-lg font-bold text-gray-900">
                  ₹ {scooter.price}
                </div>
                
                {/* Specs */}
                <div className="grid grid-cols-3 gap-2 pt-3 mt-3 text-xs text-gray-500 border-t border-gray-100">
                  <div>
                    <div className="font-medium">Engine</div>
                    <div>{scooter.specs.engine}</div>
                  </div>
                  <div>
                    <div className="font-medium">Mileage</div>
                    <div>{scooter.specs.mileage}</div>
                  </div>
                  <div>
                    <div className="font-medium">Power</div>
                    <div>{scooter.specs.power}</div>
                  </div>
                </div>
                
                {/* CTA */}
                <button className="w-full px-4 py-2 mt-4 text-sm text-center text-primary transition-colors border border-primary rounded-md hover:bg-primary hover:text-white">
                  View Specifications & Price
                </button>
              </div>
            </div>
            </div>
          ))
        )}
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
    </div>
  );
}