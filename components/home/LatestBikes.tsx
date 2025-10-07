'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

// Latest Bikes Data
const latestBikes = [
  {
    id: 'royal-enfield-hunter-350',
    name: 'Royal Enfield Hunter 350',
    image: '/images/bikes/royal-enfield-hunter-350.jpg',
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
    image: '/images/bikes/tvs-ronin.jpg',
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
    image: '/images/bikes/yamaha-r15-v4.jpg',
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
    image: '/images/bikes/bajaj-pulsar-n160.jpg',
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
      
      {/* Latest Bikes Slider */}
      <div 
        ref={sliderRef}
        className="flex gap-4 pb-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
      >
        {latestBikes.map((bike) => (
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
                  <div className="absolute top-0 left-0 px-2 py-1 text-xs font-medium text-white bg-green-500">
                    New Launch
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
                  ₹ {bike.price}
                </div>
                
                {/* Specs */}
                <div className="grid grid-cols-3 gap-2 pt-3 mt-3 text-xs text-gray-500 border-t border-gray-100">
                  <div>
                    <div className="font-medium">Engine</div>
                    <div>{bike.specs.engine}</div>
                  </div>
                  <div>
                    <div className="font-medium">Mileage</div>
                    <div>{bike.specs.mileage}</div>
                  </div>
                  <div>
                    <div className="font-medium">Power</div>
                    <div>{bike.specs.power}</div>
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