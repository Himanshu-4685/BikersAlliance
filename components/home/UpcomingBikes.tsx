'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiChevronLeft, FiChevronRight, FiClock } from 'react-icons/fi';

// Upcoming Bikes Data
const upcomingBikes = [
  {
    id: 'ktm-rc-390',
    name: 'KTM RC 390',
    image: '/images/bikes/ktm-rc-390.jpg',
    expectedPrice: '2.77 - 3.20 Lakh',
    expectedLaunch: 'Nov 2023',
  },
  {
    id: 'triumph-trident-660',
    name: 'Triumph Trident 660',
    image: '/images/bikes/triumph-trident-660.jpg',
    expectedPrice: '6.95 - 7.45 Lakh',
    expectedLaunch: 'Dec 2023',
  },
  {
    id: 'honda-cb300r',
    name: 'Honda CB300R',
    image: '/images/bikes/honda-cb300r.jpg',
    expectedPrice: '2.40 - 2.70 Lakh',
    expectedLaunch: 'Jan 2024',
  },
  {
    id: 'royal-enfield-hunter-350',
    name: 'Royal Enfield Hunter 350',
    image: '/images/bikes/royal-enfield-hunter-350.jpg',
    expectedPrice: '1.50 - 1.70 Lakh',
    expectedLaunch: 'Dec 2023',
  },
];

export default function UpcomingBikes() {
  const sliderRef = useRef<HTMLDivElement>(null);
  
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
    <div className="relative bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      {/* Slider Navigation */}
      <div className="absolute right-6 flex space-x-2 -top-12">
        <button 
          onClick={scrollLeft}
          className="flex items-center justify-center w-8 h-8 transition-colors bg-gray-100 rounded-full hover:bg-gray-200"
          aria-label="Scroll left"
        >
          <FiChevronLeft className="w-5 h-5" />
        </button>
        <button 
          onClick={scrollRight}
          className="flex items-center justify-center w-8 h-8 transition-colors bg-gray-100 rounded-full hover:bg-gray-200"
          aria-label="Scroll right"
        >
          <FiChevronRight className="w-5 h-5" />
        </button>
      </div>
      
      {/* Upcoming Bikes Slider */}
      <div 
        ref={sliderRef}
        className="flex gap-4 pb-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
      >
        {upcomingBikes.map((bike) => (
          <div 
            key={bike.id} 
            className="flex-none w-[270px] snap-start"
          >
            <div className="overflow-hidden transition-shadow bg-white border border-gray-200 rounded-lg hover:shadow-md">
              {/* Bike Image */}
              <Link href={`/upcoming-bikes/${bike.id}`} className="block">
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
                </div>
              </Link>
              
              {/* Bike Info */}
              <div className="p-4">
                <Link href={`/upcoming-bikes/${bike.id}`} className="block">
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
                <button className="w-full px-4 py-2 mt-4 text-sm text-center text-primary transition-colors border border-primary rounded-md hover:bg-primary hover:text-white">
                  Get Notified When Launched
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}