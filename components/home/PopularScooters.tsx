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
    image: '/images/scooters/honda-activa-6g.jpg',
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
    image: '/images/scooters/tvs-jupiter.jpg',
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
    image: '/images/scooters/suzuki-access-125.jpg',
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
    image: '/images/scooters/honda-dio.jpg',
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
      
      {/* Scooters Slider */}
      <div 
        ref={sliderRef}
        className="flex gap-4 pb-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
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
    </div>
  );
}