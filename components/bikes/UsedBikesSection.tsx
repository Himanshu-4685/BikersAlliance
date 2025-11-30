'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { UsedBikeCity } from '@/components/bikes/DealersSection';
import Image from 'next/image';
import Link from 'next/link';
import UsedBikeSearchInput from './UsedBikeSearchInput';

// Simple component to handle SVG icons with fallback
const CityIcon = ({ city }: { city: UsedBikeCity }) => {
  const [imageError, setImageError] = useState(false);
  
  if (imageError) {
    return (
      <div className="text-3xl font-bold text-blue-600">
        {city.name.charAt(0)}
      </div>
    );
  }
  
  return (
    <img
      src={city.svgIcon}
      alt={`${city.name} icon`}
      className="w-12 h-12 object-contain"
      onError={() => setImageError(true)}
    />
  );
};

export default function UsedBikesSection() {
  const [usedBikeCities, setUsedBikeCities] = useState<UsedBikeCity[]>([]);
  const [loading, setLoading] = useState(true);
  
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  
  useEffect(() => {
    const fetchCityCounts = async () => {
      try {
        // Show 12 cities on homepage, all cities on used-bikes page
        const apiUrl = isHomePage ? '/api/used-bikes/cities?limit=12' : '/api/used-bikes/cities';
        const response = await fetch(apiUrl);
        const result = await response.json();
        
        if (result.success) {
          // API now returns only top 12 cities (2 rows of 6 each)
          setUsedBikeCities(result.data);
        } else {
          console.error('Failed to fetch city counts:', result.error);
          // Fallback to mock data if API fails - limiting to main cities only (2 rows)
          const mockData: UsedBikeCity[] = [
            { name: 'Delhi', slug: 'delhi', count: 4, svgIcon: '/images/location-svg/delhi.svg' },
            { name: 'Hyderabad', slug: 'hyderabad', count: 3, svgIcon: '/images/location-svg/hyderabad.svg' },
            { name: 'Kolkata', slug: 'kolkata', count: 3, svgIcon: '/images/location-svg/kolkata.svg' },
            { name: 'Mumbai', slug: 'mumbai', count: 2, svgIcon: '/images/location-svg/mumbai.svg' },
            { name: 'Bangalore', slug: 'bangalore', count: 2, svgIcon: '/images/location-svg/bangalore.svg' },
            { name: 'Pune', slug: 'pune', count: 2, svgIcon: '/images/location-svg/pune.svg' },
            { name: 'Ahmedabad', slug: 'ahmedabad', count: 2, svgIcon: '/images/location-svg/ahmedabad.svg' },
            { name: 'Jaipur', slug: 'jaipur', count: 2, svgIcon: '/images/location-svg/jaipur.svg' },
            { name: 'Lucknow', slug: 'lucknow', count: 2, svgIcon: '/images/location-svg/lucknow.svg' },
            { name: 'Chandigarh', slug: 'chandigarh', count: 2, svgIcon: '/images/location-svg/chandigarh.svg' },
            { name: 'Indore', slug: 'indore', count: 2, svgIcon: '/images/location-svg/indore.svg' },
            { name: 'Coimbatore', slug: 'coimbatore', count: 2, svgIcon: '/images/location-svg/coimbatore.svg' },
          ];
          // Limit cities based on page - 12 for homepage, all for used-bikes page
          const limitedData = isHomePage ? mockData.slice(0, 12) : mockData;
          setUsedBikeCities(limitedData);
        }
      } catch (error) {
        console.error('Error fetching city counts:', error);
        // Fallback to mock data
        const mockData: UsedBikeCity[] = [
          { name: 'Mumbai', slug: 'mumbai', count: 0, svgIcon: '/images/location-svg/mumbai.svg' },
          { name: 'Delhi', slug: 'delhi', count: 0, svgIcon: '/images/location-svg/delhi.svg' },
          { name: 'Bangalore', slug: 'bangalore', count: 0, svgIcon: '/images/location-svg/bangalore.svg' },
        ];
        // Limit cities for error fallback based on page
        const errorFallback = isHomePage ? mockData.slice(0, 6) : mockData;
        setUsedBikeCities(errorFallback);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCityCounts();
  }, [isHomePage]);
  
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
                <div className={`grid grid-cols-2 gap-4 md:grid-cols-3 ${isHomePage ? 'lg:grid-cols-6' : 'lg:grid-cols-4 xl:grid-cols-6'}`}>
                  {loading ? (
                    // Loading skeletons
                    [...Array(isHomePage ? 12 : 18)].map((_, index) => (
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
                          <CityIcon city={city} />
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
                <UsedBikeSearchInput />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}