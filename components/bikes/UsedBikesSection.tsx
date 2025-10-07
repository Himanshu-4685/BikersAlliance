import React, { useState, useEffect } from 'react';
import { UsedBikeCity } from '@/components/bikes/DealersSection';
import Image from 'next/image';
import Link from 'next/link';

export default function UsedBikesSection() {
  // This is a simplified version of the component to display the city grid on the main used bikes page
  // Reusing the same data as in the DealersSection component
  const [usedBikeCities, setUsedBikeCities] = useState<UsedBikeCity[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading for demonstration purposes
    const mockUsedBikesData: UsedBikeCity[] = [
      { name: 'Ahmedabad', slug: 'ahmedabad', count: 87, svgIcon: '/images/location-svg/ahmedabad.svg' },
      { name: 'Bangalore', slug: 'bangalore', count: 388, svgIcon: '/images/location-svg/bangalore.svg' },
      { name: 'Chandigarh', slug: 'chandigarh', count: 25, svgIcon: '/images/location-svg/chandigarh.svg' },
      { name: 'Chennai', slug: 'chennai', count: 184, svgIcon: '/images/location-svg/chennai.svg' },
      { name: 'Delhi', slug: 'delhi', count: 610, svgIcon: '/images/location-svg/delhi.svg' },
      { name: 'Ghaziabad', slug: 'ghaziabad', count: 82, svgIcon: '/images/location-svg/ghaziabad.svg' },
      { name: 'Gurgaon', slug: 'gurgaon', count: 113, svgIcon: '/images/location-svg/gurgaon.svg' },
      { name: 'Hyderabad', slug: 'hyderabad', count: 260, svgIcon: '/images/location-svg/hyderabad.svg' },
      { name: 'Jaipur', slug: 'jaipur', count: 125, svgIcon: '/images/location-svg/jaipur.svg' },
      { name: 'Kolkata', slug: 'kolkata', count: 147, svgIcon: '/images/location-svg/kolkata.svg' },
      { name: 'Lucknow', slug: 'lucknow', count: 84, svgIcon: '/images/location-svg/lucknow.svg' },
      { name: 'Mumbai', slug: 'mumbai', count: 238, svgIcon: '/images/location-svg/mumbai.svg' },
    ];
    
    // Simulate API call delay
    const timer = setTimeout(() => {
      setUsedBikeCities(mockUsedBikesData);
      setLoading(false);
    }, 1500);
    
    // Cleanup timeout on unmount
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="rounded-lg overflow-hidden shadow-md border border-gray-100" 
         style={{backgroundImage: 'url(https://cdn.bikedekho.com/pwa/img/cityBackground.svg)', 
                backgroundSize: 'cover', 
                backgroundPosition: 'center bottom'}}>
      <div className="p-6 bg-white bg-opacity-90">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
          {loading ? (
            // Loading skeleton
            [...Array(12)].map((_, index) => (
              <div key={index} className="flex flex-col items-center p-3 text-center bg-white rounded-lg animate-pulse shadow-sm">
                <div className="w-16 h-16 bg-gray-200 rounded-full mb-3"></div>
                <div className="w-24 h-4 bg-gray-200 rounded mb-2"></div>
                <div className="w-20 h-4 bg-gray-200 rounded"></div>
              </div>
            ))
          ) : (
            // Actual content
            usedBikeCities.map((city) => (
              <Link 
                href={`/used-bikes/${city.slug}`} 
                key={city.slug} 
                className="flex flex-col items-center px-0 py-4 text-center transition-transform duration-200 rounded-lg hover:scale-105 shadow-sm border border-gray-100"
                style={{
                  fontFamily: 'Lato, sans-serif, Arial', 
                  fontSize: '13px',
                  
                  position: 'relative'
                }}
              >
                <div className="w-16 h-16 flex items-center justify-center bg-blue-50 rounded-full relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    {/* SVG icon */}
                    <object 
                      data={city.svgIcon}
                      type="image/svg+xml"
                      className="w-12 h-12"
                      aria-label={`${city.name} icon`}
                    >
                      {/* This content shows when object fails */}
                      <div className="text-3xl font-bold text-primary">
                        {city.name.charAt(0)}
                      </div>
                    </object>
                  </div>
                </div>
                <p className="mt-2 font-medium text-gray-900">
                  {city.count} Used Bikes in
                </p>
                <p className="font-medium text-gray-900">
                  {city.name}
                </p>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}