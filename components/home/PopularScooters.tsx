'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

// Popular Scooters Data
const popularScooters = [
  {
    id: 'honda-activa-6g',
    name: 'Honda Activa 6G',
    image: '/demo.avif',
    price: '75,347',
    specs: {
      engine: '109.51 cc',
      mileage: '50 kmpl',
      power: '7.79 PS',
    }
  },
  {
    id: 'tvs-jupiter',
    name: 'TVS Jupiter',
    image: '/demo.avif',
    price: '72,853',
    specs: {
      engine: '109.7 cc',
      mileage: '50 kmpl',
      power: '7.47 PS',
    }
  },
  {
    id: 'suzuki-access-125',
    name: 'Suzuki Access 125',
    image: '/demo.avif',
    price: '79,899',
    specs: {
      engine: '124 cc',
      mileage: '52 kmpl',
      power: '8.7 PS',
    }
  },
  {
    id: 'honda-dio',
    name: 'Honda Dio',
    image: '/demo.avif',
    price: '70,211',
    specs: {
      engine: '109.51 cc',
      mileage: '48 kmpl',
      power: '7.76 PS',
    }
  }
];

export default function PopularScooters() {
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
        {popularScooters.map((scooter) => (
          <div 
            key={scooter.id} 
            className="flex-none w-[270px] snap-start"
          >
            <div className="overflow-hidden transition-shadow bg-white border border-gray-200 rounded-lg hover:shadow-md">
              {/* Scooter Image */}
              <Link href={`/scooters/${scooter.id}`} className="block">
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
                <Link href={`/scooters/${scooter.id}`} className="block">
                  <h3 className="mb-2 text-lg font-medium text-gray-900 hover:text-primary">
                    {scooter.name}
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