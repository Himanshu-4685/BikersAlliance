'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { BikeFromDB, Bike } from '@/types/bike';
import BikeCard from '@/components/bikes/BikeCard';
import { generateBikeSlug } from '@/lib/slug-utils';

// Helper function to truncate text with ellipsis
const truncateText = (text: string, maxLength: number): string => {
  if (!text) return 'N/A';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Helper function to clean and format values
const cleanValue = (value: any): string => {
  if (!value) return 'N/A';
  const stringValue = String(value).trim();
  // Remove any existing units and formatting, just keep the numeric part and basic unit
  return stringValue.replace(/\s*@.*$/, '').trim() || 'N/A';
};

// Function to format database bike data for UI
const formatBikeData = (dbBike: BikeFromDB): Bike => {
  const isElectric = dbBike.bike_style === 'electric' || dbBike.engine_type === 'electric';
  
  return {
    id: dbBike.variant_id,
    name: dbBike.variant_name, // Just show the variant name
    slug: generateBikeSlug(dbBike.variant_name), // Generate consistent slug from variant name
    image: dbBike.image_url || '/demo.avif',
    price: dbBike.on_road_price?.toLocaleString('en-IN') || 'N/A',
    specs: {
      engine: isElectric 
        ? 'Electric' 
        : cleanValue(dbBike.displacement),
      mileage: cleanValue(dbBike.city_mileage),
      power: cleanValue(dbBike.peak_power),
    }
  };
};

export default function FeaturedBikes() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState('commuter');
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch bikes when category changes
  useEffect(() => {
    const fetchBikes = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('Fetching bikes for category:', activeCategory);
        const response = await fetch(`/api/bikes/category?category=${activeCategory}`);
        const data = await response.json();
        
        console.log('API Response:', data);
        
        if (data.success) {
          const formattedBikes = data.data.bikes.map(formatBikeData);
          console.log('Formatted bikes:', formattedBikes);
          setBikes(formattedBikes);
        } else {
          setError(data.message || 'Failed to fetch bikes');
        }
      } catch (err) {
        setError('Failed to fetch bikes');
        console.error('Error fetching bikes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBikes();
  }, [activeCategory]);
  
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

  const categories = [
    { key: 'commuter', label: 'Commuter Bikes', viewAllText: 'View All Commuter', link: '/bikes/type/commuter' },
    { key: 'sports', label: 'Sports Bikes', viewAllText: 'View All Sports', link: '/bikes/type/sports' },
    { key: 'cruiser', label: 'Cruiser Bikes', viewAllText: 'View All Cruiser', link: '/bikes/type/cruiser' },
    { key: 'mileage', label: 'Best Mileage Bikes', viewAllText: 'View All Mileage', link: '/bikes/mileage/above-60' },
    { key: 'electric', label: 'Electric Bikes', viewAllText: 'View All Electric', link: '/electric' }
  ];

  // Get the current category data
  const currentCategory = categories.find(cat => cat.key === activeCategory) || categories[0];
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl text-gray-900" style={{ fontFamily: 'Lato, sans-serif, Arial', fontSize: '23px', fontWeight: 500 }}>
          <b>Bikes in Spotlight</b>
        </h2>
        <Link href={currentCategory.link} className="px-4 py-2 text-sm text-primary border border-primary rounded-md hover:bg-primary hover:text-white transition-colors">
          {currentCategory.viewAllText}
        </Link>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b">
        {categories.map((category) => (
          <button
            key={category.key}
            onClick={() => setActiveCategory(category.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeCategory === category.key
                ? 'text-red-600 border-red-600'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            {category.label}
          </button>
        ))}
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
        
        {/* Bikes Slider */}
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
        ) : bikes.length === 0 ? (
          // No bikes found
          <div className="flex justify-center items-center h-48 text-gray-500">
            No bikes found for this category
          </div>
        ) : (
          // Bikes data
          bikes.map((bike) => (
            <BikeCard 
              key={bike.id} 
              bike={bike} 
              viewMode="grid"
            />
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