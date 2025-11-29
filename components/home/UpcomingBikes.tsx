'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiChevronLeft, FiChevronRight, FiClock } from 'react-icons/fi';
import WishlistButton from '@/components/common/WishlistButton';
import NotificationPopup from '@/components/common/NotificationPopup';

// Upcoming Bikes Data
const upcomingBikes = [
  {
    id: 'ktm-rc-390',
    name: 'KTM RC 390',
    image: '/demo.avif',
    expectedPrice: '2.77 - 3.20 Lakh',
    expectedLaunch: 'Nov 2023',
  },
  {
    id: 'triumph-trident-660',
    name: 'Triumph Trident 660',
    image: '/demo.avif',
    expectedPrice: '6.95 - 7.45 Lakh',
    expectedLaunch: 'Dec 2023',
  },
  {
    id: 'honda-cb300r',
    name: 'Honda CB300R',
    image: '/demo.avif',
    expectedPrice: '2.40 - 2.70 Lakh',
    expectedLaunch: 'Jan 2024',
  },
  {
    id: 'royal-enfield-hunter-350',
    name: 'Royal Enfield Hunter 350',
    image: '/demo.avif',
    expectedPrice: '1.50 - 1.70 Lakh',
    expectedLaunch: 'Dec 2023',
  },
];

export default function UpcomingBikes() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedBike, setSelectedBike] = useState<typeof upcomingBikes[0] | null>(null);
  
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

  const handleNotifyClick = (bike: typeof upcomingBikes[0]) => {
    setSelectedBike(bike);
    setIsPopupOpen(true);
  };
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl text-gray-900" style={{ fontFamily: 'Lato, sans-serif, Arial', fontSize: '23px', fontWeight: 500 }}>
          <b>Upcoming Bikes & Scooters</b>
        </h2>
        <Link href="/upcoming-bikes" className="px-4 py-2 text-sm text-primary border border-primary rounded-md hover:bg-primary hover:text-white transition-colors">
          View All Upcoming
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
        
        {/* Upcoming Bikes Slider */}
        <div 
          ref={sliderRef}
          className="flex gap-4 overflow-x-hidden scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
        {upcomingBikes.map((bike) => (
          <div 
            key={bike.id} 
            className="flex-none w-[270px] snap-start"
          >
            <div className="overflow-hidden transition-shadow bg-white border border-gray-200 rounded-lg hover:shadow-md">
              {/* Bike Image */}
              <Link href={`/bikes/${bike.id}`} className="block">
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  <Image
                    src={bike.image}
                    alt={bike.name}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 270px"
                  />
                  <div className="absolute top-0 left-0 px-2 py-1 text-xs font-medium text-white bg-primary">
                    Upcoming
                  </div>
                  {/* Wishlist Button */}
                  <div className="absolute top-2 right-2">
                    <WishlistButton 
                      bike={{
                        id: bike.id,
                        name: bike.name,
                        slug: bike.id,
                        image: bike.image
                      }}
                      size="sm" 
                    />
                  </div>
                </div>
              </Link>
              
              {/* Bike Info */}
              <div className="p-4">
                <Link href={`/bikes/${bike.id}`} className="block">
                  <h3 className="mb-2 text-lg font-medium text-gray-900 hover:text-primary">
                    {bike.name}
                  </h3>
                </Link>
                <div className="mb-3 text-lg font-bold text-gray-900">
                  ₹ {bike.expectedPrice}
                </div>
                
                {/* Expected Launch */}
                <div className="flex items-center pt-3 mt-3 text-sm text-gray-500 border-t border-gray-100">
                  <FiClock className="mr-2 text-gray-400" />
                  <span>Expected Launch: {bike.expectedLaunch}</span>
                </div>
                
                {/* CTA */}
                <button 
                  onClick={() => handleNotifyClick(bike)}
                  className="w-full px-4 py-2 mt-4 text-sm text-center text-primary transition-colors border border-primary rounded-md hover:bg-primary hover:text-white"
                >
                  Get Notified When Launched
                </button>
              </div>
            </div>
          </div>
        ))}
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

      {/* Notification Popup */}
      {selectedBike && (
        <NotificationPopup
          isOpen={isPopupOpen}
          onClose={() => setIsPopupOpen(false)}
          bikeData={{
            id: selectedBike.id,
            name: selectedBike.name,
            expectedPrice: selectedBike.expectedPrice,
            expectedLaunch: selectedBike.expectedLaunch,
            image: selectedBike.image
          }}
        />
      )}
    </div>
  );
}