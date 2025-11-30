'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useComparison } from '@/context/ComparisonContext';

// Popular Comparisons Data
const comparisons = [
  {
    id: 'hero-splendor-plus-vs-honda-shine',
    bikes: [
      {
        id: 'hero-splendor-plus',
        name: 'Hero Splendor Plus',
        image: '/demo.avif',
        price: 72650,
        slug: 'hero-splendor-plus',
        brand: { name: 'Hero', slug: 'hero' }
      },
      {
        id: 'honda-shine',
        name: 'Honda Shine',
        image: '/demo.avif',
        price: 78687,
        slug: 'honda-shine',
        brand: { name: 'Honda', slug: 'honda' }
      }
    ]
  },
  {
    id: 'royal-enfield-classic-350-vs-jawa-42',
    bikes: [
      {
        id: 're-classic-350',
        name: 'Royal Enfield Classic 350',
        image: '/demo.avif',
        price: 190292,
        slug: 're-classic-350',
        brand: { name: 'Royal Enfield', slug: 'royal-enfield' }
      },
      {
        id: 'jawa-42',
        name: 'Jawa 42',
        image: '/demo.avif',
        price: 198142,
        slug: 'jawa-42',
        brand: { name: 'Jawa', slug: 'jawa' }
      }
    ]
  },
  {
    id: 'bajaj-pulsar-150-vs-yamaha-fz-s-v3',
    bikes: [
      {
        id: 'bajaj-pulsar-150',
        name: 'Bajaj Pulsar 150',
        image: '/demo.avif',
        price: 107494,
        slug: 'bajaj-pulsar-150',
        brand: { name: 'Bajaj', slug: 'bajaj' }
      },
      {
        id: 'yamaha-fz-s-v3',
        name: 'Yamaha FZ S V3',
        image: '/demo.avif',
        price: 120900,
        slug: 'yamaha-fz-s-v3',
        brand: { name: 'Yamaha', slug: 'yamaha' }
      }
    ]
  },
  {
    id: 'tvs-raider-vs-hero-glamour',
    bikes: [
      {
        id: 'tvs-raider',
        name: 'TVS Raider',
        image: '/demo.avif',
        price: 95219,
        slug: 'tvs-raider',
        brand: { name: 'TVS', slug: 'tvs' }
      },
      {
        id: 'hero-glamour',
        name: 'Hero Glamour',
        image: '/demo.avif',
        price: 82348,
        slug: 'hero-glamour',
        brand: { name: 'Hero', slug: 'hero' }
      }
    ]
  }
];

export default function PopularComparisons() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const { addToComparison, clearComparison } = useComparison();
  const router = useRouter();
  
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

  const handleCompareClick = (comparison: typeof comparisons[0]) => {
    // Clear existing comparison first
    clearComparison();
    
    // Add both bikes to comparison
    comparison.bikes.forEach(bike => {
      addToComparison(bike);
    });
    
    // Navigate to compare page
    router.push('/compare');
  };
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl text-gray-900" style={{ fontFamily: 'Lato, sans-serif, Arial', fontSize: '23px', fontWeight: 500 }}>
          <b>Popular Comparisons</b>
        </h2>
        <Link href="/compare" className="px-4 py-2 text-sm text-primary border border-primary rounded-md hover:bg-primary hover:text-white transition-colors">
          Compare Bikes
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
        
        {/* Comparison Slider - moved from container header to component for better encapsulation */}
        <div 
          ref={sliderRef}
          className="flex gap-4 overflow-x-hidden scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
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
                      <p className="text-sm text-gray-700">₹ {bike.price.toLocaleString('en-IN')}</p>
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
                <button 
                  onClick={() => handleCompareClick(comparison)}
                  className="block w-full px-4 py-2 text-sm font-medium text-center text-white transition-colors bg-primary rounded-md hover:bg-primary-600"
                >
                  Compare Bikes
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