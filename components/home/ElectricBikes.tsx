'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

// Electric Bikes Data
const electricBikes = [
  {
    id: 'ola-s1-pro',
    name: 'Ola S1 Pro',
    image: '/images/bikes/ola-s1-pro.jpg',
    price: '1,30,000',
    range: '181 Km',
    chargingTime: '6.5 Hrs',
    topSpeed: '116 Kmph'
  },
  {
    id: 'ather-450x',
    name: 'Ather 450X',
    image: '/images/bikes/ather-450x.jpg',
    price: '1,40,000',
    range: '146 Km',
    chargingTime: '5.5 Hrs',
    topSpeed: '90 Kmph'
  },
  {
    id: 'tvs-iqube',
    name: 'TVS iQube',
    image: '/images/bikes/tvs-iqube.jpg',
    price: '99,130',
    range: '100 Km',
    chargingTime: '4.5 Hrs',
    topSpeed: '78 Kmph'
  },
  {
    id: 'bajaj-chetak',
    name: 'Bajaj Chetak',
    image: '/images/bikes/bajaj-chetak.jpg',
    price: '1,22,000',
    range: '95 Km',
    chargingTime: '5 Hrs',
    topSpeed: '70 Kmph'
  },
  {
    id: 'revolt-rv400',
    name: 'Revolt RV400',
    image: '/images/bikes/revolt-rv400.jpg',
    price: '1,25,000',
    range: '150 Km',
    chargingTime: '4.5 Hrs',
    topSpeed: '85 Kmph'
  }
];

export default function ElectricBikes() {
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
      <div 
        ref={sliderRef}
        className="flex gap-4 pb-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
      >
        {electricBikes.map((bike) => (
          <div 
            key={bike.id} 
            className="flex-none w-[280px] snap-start"
          >
            <div className="overflow-hidden transition-shadow bg-white border border-gray-200 rounded-lg hover:shadow-md">
              {/* Bike Image */}
              <div className="relative h-48 bg-gray-100">
                <Image
                  src={bike.image}
                  alt={bike.name}
                  fill
                  className="object-cover"
                  sizes="280px"
                />
                <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/70 to-transparent">
                  <h3 className="text-sm font-medium text-white">{bike.name}</h3>
                  <p className="text-xs text-white/90">₹ {bike.price}</p>
                </div>
              </div>
              
              {/* Bike Specs */}
              <div className="grid grid-cols-3 gap-2 p-3">
                <div className="text-center">
                  <p className="text-xs text-gray-500">Range</p>
                  <p className="font-medium text-gray-800">{bike.range}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Charging</p>
                  <p className="font-medium text-gray-800">{bike.chargingTime}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Top Speed</p>
                  <p className="font-medium text-gray-800">{bike.topSpeed}</p>
                </div>
              </div>
              
              {/* CTA */}
              <div className="px-3 pb-3">
                <Link 
                  href={`/electric-bikes/${bike.id}`} 
                  className="block w-full px-4 py-2 text-sm font-medium text-center text-white transition-colors bg-primary rounded-md hover:bg-primary-600"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
        
        <div className="flex-none w-[200px] snap-start">
          <Link 
            href="/electric-bikes"
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
    </div>
  );
}