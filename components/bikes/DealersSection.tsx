'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Types
export interface UsedBikeCity {
  name: string;
  slug: string;
  count: number;
  svgIcon: string;
}

interface DealersSectionProps {
  brandId?: string;
}

export default function DealersSection({ brandId }: DealersSectionProps) {
  const [usedBikeCities, setUsedBikeCities] = useState<UsedBikeCity[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Mocked data for used bikes in cities
  useEffect(() => {
    // In a real application, this would fetch from an API
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
    
    // Simulate loading for demonstration purposes
    const timer = setTimeout(() => {
      setUsedBikeCities(mockUsedBikesData);
      setLoading(false);
    }, 2000); // 2 second delay to show loading state
    
    // Cleanup timeout on unmount
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="py-8 bg-gray-50">
      <div className="container">
        <div className="rounded-lg overflow-hidden shadow-md border border-gray-100" 
             style={{backgroundImage: 'url(/images/location-svg/cityBackground2.svg)', 
                    backgroundSize: 'cover', 
                    backgroundPosition: 'center bottom'}}>
          <div className="px-6 pt-6 pb-3 bg-white bg-opacity-80">
            <h2 className="text-2xl text-gray-900" style={{ fontFamily: 'Lato, sans-serif, Arial', fontSize: '23px', fontWeight: 500 }}>Get Trusted Used Bikes Nearby</h2>
          </div>
          <div className="p-6 bg-white bg-opacity-90">
            <div className="flex flex-wrap">
              <div className="w-full md:w-3/4">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                  {loading ? (
                    // Loading skeletons
                    [...Array(12)].map((_, index) => (
                      <div key={index} className="flex flex-col items-center p-3 text-center bg-white rounded-lg animate-pulse shadow-sm">
                        <div className="w-16 h-16 bg-gray-200 rounded-full mb-3"></div>
                        <div className="w-24 h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="w-20 h-4 bg-gray-200 rounded"></div>
                      </div>
                    ))
                  ) : (
                    // Used bikes by city
                    usedBikeCities.map((city) => (
                      <Link 
                        href={`/used-bikes/${city.slug}`} 
                        key={city.slug} 
                        className="flex flex-col items-center px-0 py-4 text-center transition-transform duration-200 rounded-lg hover:scale-105 shadow-sm border border-gray-100"
                        style={{
                          fontFamily: 'Lato, sans-serif, Arial', 
                          fontSize: '13px',
                          background: 'url(/images/location-svg/cityBackground.svg) center center / cover no-repeat #fff',
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
              
              <div className="w-full p-4 md:w-1/4 md:mt-0">
                <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                  <h3 className="font-medium text-gray-900">I am looking to buy a second hand bike in</h3>
                  <div className="relative mt-3">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Enter your city"
                        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:ring-1 focus:ring-primary focus:border-primary"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}