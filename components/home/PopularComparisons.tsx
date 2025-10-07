'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

// Popular Comparisons Data
const comparisons = [
  {
    id: 'hero-splendor-plus-vs-honda-shine',
    bikes: [
      {
        name: 'Hero Splendor Plus',
        image: '/images/bikes/hero-splendor-plus.jpg',
        price: '72,650'
      },
      {
        name: 'Honda Shine',
        image: '/images/bikes/honda-shine.jpg',
        price: '78,687'
      }
    ]
  },
  {
    id: 'royal-enfield-classic-350-vs-jawa-42',
    bikes: [
      {
        name: 'Royal Enfield Classic 350',
        image: '/images/bikes/royal-enfield-classic-350.jpg',
        price: '1,90,292'
      },
      {
        name: 'Jawa 42',
        image: '/images/bikes/jawa-42.jpg',
        price: '1,98,142'
      }
    ]
  },
  {
    id: 'bajaj-pulsar-150-vs-yamaha-fz-s-v3',
    bikes: [
      {
        name: 'Bajaj Pulsar 150',
        image: '/images/bikes/bajaj-pulsar-150.jpg',
        price: '1,07,494'
      },
      {
        name: 'Yamaha FZ S V3',
        image: '/images/bikes/yamaha-fz-s-v3.jpg',
        price: '1,20,900'
      }
    ]
  },
  {
    id: 'tvs-raider-vs-hero-glamour',
    bikes: [
      {
        name: 'TVS Raider',
        image: '/images/bikes/tvs-raider.jpg',
        price: '95,219'
      },
      {
        name: 'Hero Glamour',
        image: '/images/bikes/hero-glamour.jpg',
        price: '82,348'
      }
    ]
  }
];

export default function PopularComparisons() {
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
      {/* Slider Navigation - moved from container header to component for better encapsulation */}
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
      
      {/* Comparison Slider */}
      <div 
        ref={sliderRef}
        className="flex gap-4 pb-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
      >
        {comparisons.map((comparison) => (
          <div 
            key={comparison.id} 
            className="flex-none w-[350px] snap-start"
          >
            <div className="overflow-hidden transition-shadow bg-white border border-gray-200 rounded-lg hover:shadow-md">
              {/* Comparison Card */}
              <div className="p-4">
                {/* Bikes */}
                <div className="flex items-center justify-between mb-4">
                  {comparison.bikes.map((bike, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div className="relative w-32 h-24 mb-2 overflow-hidden bg-gray-100 rounded-md">
                        <Image
                          src={bike.image}
                          alt={bike.name}
                          fill
                          className="object-cover"
                          sizes="128px"
                        />
                      </div>
                      <h4 className="mb-1 text-sm font-medium text-center text-gray-900">
                        {bike.name}
                      </h4>
                      <p className="text-sm text-gray-700">₹ {bike.price}</p>
                    </div>
                  ))}
                </div>
                
                {/* VS Badge */}
                <div className="relative flex items-center justify-center my-4">
                  <div className="flex-grow border-t border-gray-200"></div>
                  <span className="flex items-center justify-center w-10 h-10 text-xs font-bold text-white bg-primary rounded-full mx-4">VS</span>
                  <div className="flex-grow border-t border-gray-200"></div>
                </div>
                
                {/* CTA */}
                <Link 
                  href={`/compare/${comparison.id}`} 
                  className="block w-full px-4 py-2 text-sm font-medium text-center text-white transition-colors bg-primary rounded-md hover:bg-primary-600"
                >
                  Compare Bikes
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}