'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import BikeCard from '@/components/bikes/BikeCard';
import { Bike } from '@/types/bike';

// Latest Bikes Data
const latestBikes: Bike[] = [
  {
    id: 'royal-enfield-hunter-350',
    name: 'Royal Enfield Hunter 350',
    slug: 'royal-enfield-hunter-350',
    image: '/demo.avif',
    price: '1,49,900',
    specs: {
      engine: '349.34 cc',
      mileage: '36.2 kmpl',
      power: '20.4 PS',
    }
  },
  {
    id: 'tvs-ronin',
    name: 'TVS Ronin',
    slug: 'tvs-ronin',
    image: '/demo.avif',
    price: '1,49,000',
    specs: {
      engine: '225.9 cc',
      mileage: '35 kmpl',
      power: '20.4 PS',
    }
  },
  {
    id: 'yamaha-r15-v4',
    name: 'Yamaha R15 V4',
    slug: 'yamaha-r15-v4',
    image: '/demo.avif',
    price: '1,78,900',
    specs: {
      engine: '155 cc',
      mileage: '40 kmpl',
      power: '18.4 PS',
    }
  },
  {
    id: 'bajaj-pulsar-n160',
    name: 'Bajaj Pulsar N160',
    slug: 'bajaj-pulsar-n160',
    image: '/demo.avif',
    price: '1,28,000',
    specs: {
      engine: '160 cc',
      mileage: '45 kmpl',
      power: '16 PS',
    }
  }
];

export default function LatestBikes() {
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
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl text-gray-900" style={{ fontFamily: 'Lato, sans-serif, Arial', fontSize: '23px', fontWeight: 500 }}>
          <b>Latest Bikes & Scooters</b>
        </h2>
        <Link href="/latest-bikes" className="px-4 py-2 text-sm text-primary border border-primary rounded-md hover:bg-primary hover:text-white transition-colors">
          View All Latest
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
        
        {/* Latest Bikes Slider */}
        <div 
          ref={sliderRef}
          className="flex gap-4 overflow-x-hidden scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
        {latestBikes.map((bike) => (
          <BikeCard 
            key={bike.id} 
            bike={bike} 
            viewMode="grid"
            showNewLaunchTag={true}
          />
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
    </div>
  );
}