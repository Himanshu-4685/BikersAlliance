'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiChevronLeft, FiChevronRight, FiClock, FiCalendar } from 'react-icons/fi';
import { BikeStatus } from '@/types/bike-status';
import NotificationPopup from '@/components/common/NotificationPopup';

interface DynamicBikeStatusProps {
  status: 'upcoming' | 'new_launch';
  title: string;
  viewAllLink: string;
  limit?: number;
}

export default function DynamicBikeStatus({ 
  status, 
  title, 
  viewAllLink, 
  limit = 8 
}: DynamicBikeStatusProps) {
  const [bikes, setBikes] = useState<BikeStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedBike, setSelectedBike] = useState<BikeStatus | null>(null);

  useEffect(() => {
    fetchBikes();
  }, [status, limit]);

  const fetchBikes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/bike-status?status=${status}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      const data = await response.json();

      if (data.success && data.data && data.data.length > 0) {
        setBikes(data.data);
      } else {
        // Fallback to hardcoded data
        console.warn('API returned no data, using fallback data');
        setFallbackData();
      }
    } catch (err) {
      console.error('Error fetching bikes:', err);
      // Fallback to hardcoded data
      setFallbackData();
    } finally {
      setLoading(false);
    }
  };

  const setFallbackData = () => {
    const fallbackBikes: BikeStatus[] = status === 'upcoming' ? [
      {
        id: 1,
        status: 'upcoming',
        priceRange: '2.77 - 3.20 Lakh',
        expectedLaunch: '2024-03-15',
        brand: { id: '1', name: 'KTM', logo: '/demo.avif' },
        model: { id: 1, name: 'RC 390' },
        variant: {
          id: 1,
          name: 'RC 390',
          onRoadPrice: 290000,
          slug: 'ktm-rc-390',
          images: [{ image_id: 1, url: '/demo.avif', alt_text: 'KTM RC 390' }],
          specs: undefined
        }
      },
      {
        id: 2,
        status: 'upcoming',
        priceRange: '6.95 - 7.45 Lakh',
        expectedLaunch: '2024-04-20',
        brand: { id: '2', name: 'Triumph', logo: '/demo.avif' },
        model: { id: 2, name: 'Trident 660' },
        variant: {
          id: 2,
          name: 'Trident 660',
          onRoadPrice: 720000,
          slug: 'triumph-trident-660',
          images: [{ image_id: 2, url: '/demo.avif', alt_text: 'Triumph Trident 660' }],
          specs: undefined
        }
      }
    ] : [
      {
        id: 3,
        status: 'new_launch',
        priceRange: '1.20 - 1.40 Lakh',
        launchDate: '2024-01-15',
        brand: { id: '3', name: 'Hero', logo: '/demo.avif' },
        model: { id: 3, name: 'Splendor Plus' },
        variant: {
          id: 3,
          name: 'Splendor Plus',
          onRoadPrice: 72650,
          slug: 'hero-splendor-plus',
          images: [{ image_id: 3, url: '/demo.avif', alt_text: 'Hero Splendor Plus' }],
          specs: {
            engine_type: 'Single Cylinder',
            displacement: '97.2 cc',
            peak_power: '7.91 PS',
            city_mileage: '80.6 kmpl',
            highway_mileage: '85 kmpl',
            body_type: 'Commuter',
            transmission: 'Manual',
            max_torque: '8.05 Nm'
          }
        }
      }
    ];
    
    setBikes(fallbackBikes);
    setError(null);
  };

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    });
  };

  // Helper function to clean power specifications
  const cleanPowerSpec = (power: string | undefined): string => {
    if (!power) return 'N/A';
    // Remove @rpm and any additional formatting, keep just the numeric value and basic unit
    return power.replace(/\s*@.*$/, '').trim() || 'N/A';
  };

  const handleNotifyClick = (bike: BikeStatus) => {
    setSelectedBike(bike);
    setIsPopupOpen(true);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl text-gray-900" style={{ fontFamily: 'Lato, sans-serif, Arial', fontSize: '23px', fontWeight: 500 }}>
            <b>{title}</b>
          </h2>
          <div className="w-32 h-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
        
        {/* Loading skeleton */}
        <div className="flex gap-4 overflow-hidden">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="flex-none w-[270px]">
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="h-48 bg-gray-200 animate-pulse"></div>
                <div className="p-4">
                  <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="w-1/2 h-6 bg-gray-200 rounded animate-pulse mb-3"></div>
                  <div className="w-full h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="text-center py-8">
          <p className="text-red-500">Error: {error}</p>
          <button 
            onClick={fetchBikes}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (bikes.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl text-gray-900" style={{ fontFamily: 'Lato, sans-serif, Arial', fontSize: '23px', fontWeight: 500 }}>
            <b>{title}</b>
          </h2>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500">No {status === 'upcoming' ? 'upcoming' : 'new launch'} bikes available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl text-gray-900" style={{ fontFamily: 'Lato, sans-serif, Arial', fontSize: '23px', fontWeight: 500 }}>
          <b>{title}</b>
        </h2>
        <Link 
          href={viewAllLink} 
          className="px-4 py-2 text-sm text-primary border border-primary rounded-md hover:bg-primary hover:text-white transition-colors"
        >
          {status === 'upcoming' ? 'View All Upcoming' : 'View All Latest'}
        </Link>
      </div>
      
      {/* Carousel with side arrows */}
      <div className="relative flex items-center">
        {/* Left Arrow */}
        {bikes.length > 4 && (
          <button 
            onClick={scrollLeft}
            className="absolute -left-4 z-10 flex items-center justify-center w-10 h-10 transition-colors bg-white border border-gray-200 rounded-full shadow hover:bg-gray-50"
            aria-label="Scroll left"
          >
            <FiChevronLeft className="w-6 h-6" />
          </button>
        )}
        
        {/* Bikes Slider */}
        <div 
          ref={sliderRef}
          className="flex gap-4 pb-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
        >
          {bikes.map((bike) => (
            <div 
              key={bike.id} 
              className="flex-none w-[270px] snap-start"
            >
              <div className="overflow-hidden transition-shadow bg-white border border-gray-200 rounded-lg hover:shadow-md">
                {/* Bike Image */}
                <Link 
                  href={`/bikes/${bike.variant.id}`} 
                  className="block"
                >
                  <div className="relative h-48 overflow-hidden bg-gray-100">
                    <Image
                      src={(bike.variant.images && bike.variant.images.length > 0) ? bike.variant.images[0].url : '/demo.avif'}
                      alt={(bike.variant.images && bike.variant.images.length > 0) ? (bike.variant.images[0].alt_text || bike.variant.name) : `${bike.brand.name} ${bike.model.name} ${bike.variant.name}`}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 270px"
                    />
                    <div className={`absolute top-0 left-0 px-2 py-1 text-xs font-medium text-white ${
                      status === 'upcoming' ? 'bg-orange-500' : 'bg-green-500'
                    }`}>
                      {status === 'upcoming' ? 'Upcoming' : 'New Launch'}
                    </div>
                  </div>
                </Link>
                
                {/* Bike Info */}
                <div className="p-4">
                  <Link 
                    href={`/bikes/${bike.variant.id}`} 
                    className="block"
                  >
                    <h3 className="mb-2 text-lg font-medium text-gray-900 hover:text-primary">
                      {bike.variant.name}
                    </h3>
                  </Link>
                  
                  <div className="mb-3 text-lg font-bold text-gray-900">
                    ₹ {status === 'upcoming' 
                        ? bike.priceRange
                        : (bike.variant.onRoadPrice 
                            ? bike.variant.onRoadPrice.toLocaleString('en-IN') 
                            : bike.priceRange)
                    }
                  </div>
                  
                  {/* Status-specific content */}
                  {status === 'upcoming' ? (
                    <div className="flex items-center pt-3 mt-3 text-sm text-gray-500 border-t border-gray-100">
                      <FiClock className="mr-2 text-gray-400" />
                      <span>
                        Expected Launch: {bike.expectedLaunch ? formatDate(bike.expectedLaunch) : 'TBA'}
                      </span>
                    </div>
                  ) : (
                    bike.variant.specs && (
                      <div className="grid grid-cols-3 gap-2 pt-3 mt-3 text-xs text-gray-500 border-t border-gray-100">
                        <div>
                          <div className="font-medium">Engine</div>
                          <div>{bike.variant.specs.displacement || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="font-medium">Mileage</div>
                          <div>{bike.variant.specs.city_mileage || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="font-medium">Power</div>
                          <div>{cleanPowerSpec(bike.variant.specs.peak_power)}</div>
                        </div>
                      </div>
                    )
                  )}
                  
                  {/* CTA Button */}
                  {status === 'upcoming' ? (
                    <button 
                      onClick={() => handleNotifyClick(bike)}
                      className="w-full px-4 py-2 mt-4 text-sm text-center text-primary transition-colors border border-primary rounded-md hover:bg-primary hover:text-white"
                    >
                      Get Notified When Launched
                    </button>
                  ) : (
                    <Link 
                      href={`/bikes/${bike.variant.id}`}
                      className="block w-full px-4 py-2 mt-4 text-sm text-center text-primary transition-colors border border-primary rounded-md hover:bg-primary hover:text-white"
                    >
                      View Details
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Right Arrow */}
        {bikes.length > 4 && (
          <button 
            onClick={scrollRight}
            className="absolute -right-4 z-10 flex items-center justify-center w-10 h-10 transition-colors bg-white border border-gray-200 rounded-full shadow hover:bg-gray-50"
            aria-label="Scroll right"
          >
            <FiChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Notification Popup */}
      {selectedBike && (
        <NotificationPopup
          isOpen={isPopupOpen}
          onClose={() => setIsPopupOpen(false)}
          bikeData={{
            id: selectedBike.variant.slug,
            name: selectedBike.variant.name,
            expectedPrice: selectedBike.priceRange,
            expectedLaunch: selectedBike.expectedLaunch ? formatDate(selectedBike.expectedLaunch) : undefined,
            image: (selectedBike.variant.images && selectedBike.variant.images.length > 0) 
              ? selectedBike.variant.images[0].url 
              : '/demo.avif'
          }}
        />
      )}
    </div>
  );
}