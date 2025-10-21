'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

// Bike categories data
const bikeCategories = {
  commuter: [
    {
      id: 'hero-splendor-plus',
      name: 'Hero Splendor Plus',
      image: '/demo.avif',
      price: '72,650',
      specs: {
        engine: '97.2 cc',
        mileage: '80.6 kmpl',
        power: '7.91 PS',
      }
    },
    {
      id: 'honda-sp-125',
      name: 'Honda SP 125',
      image: '/demo.avif',
      price: '85,500',
      specs: {
        engine: '123.94 cc',
        mileage: '65 kmpl',
        power: '10.8 PS',
      }
    },
    {
      id: 'hero-passion-pro',
      name: 'Hero Passion Pro',
      image: '/demo.avif',
      price: '74,890',
      specs: {
        engine: '113.2 cc',
        mileage: '84 kmpl',
        power: '9.02 PS',
      }
    }
  ],
  sports: [
    {
      id: 'tvs-apache-rtr-160',
      name: 'TVS Apache RTR 160',
      image: '/demo.avif',
      price: '1,19,950',
      specs: {
        engine: '159.7 cc',
        mileage: '47 kmpl',
        power: '15.82 PS',
      }
    },
    {
      id: 'yamaha-mt-15',
      name: 'Yamaha MT-15',
      image: '/demo.avif',
      price: '1,64,900',
      specs: {
        engine: '155 cc',
        mileage: '48 kmpl',
        power: '18.4 PS',
      }
    },
    {
      id: 'bajaj-pulsar-ns200',
      name: 'Bajaj Pulsar NS200',
      image: '/demo.avif',
      price: '1,42,000',
      specs: {
        engine: '199.5 cc',
        mileage: '35 kmpl',
        power: '24.5 PS',
      }
    }
  ],
  cruiser: [
    {
      id: 'royal-enfield-classic-350',
      name: 'Royal Enfield Classic 350',
      image: '/demo.avif',
      price: '1,93,000',
      specs: {
        engine: '349 cc',
        mileage: '41.5 kmpl',
        power: '20.2 PS',
      }
    },
    {
      id: 'jawa-42',
      name: 'Jawa 42',
      image: '/demo.avif',
      price: '1,78,000',
      specs: {
        engine: '293 cc',
        mileage: '37 kmpl',
        power: '27 PS',
      }
    }
  ],
  mileage: [
    {
      id: 'bajaj-platina-110',
      name: 'Bajaj Platina 110',
      image: '/demo.avif',
      price: '70,000',
      specs: {
        engine: '115.45 cc',
        mileage: '84 kmpl',
        power: '8.6 PS',
      }
    },
    {
      id: 'hero-hf-deluxe',
      name: 'Hero HF Deluxe',
      image: '/demo.avif',
      price: '62,000',
      specs: {
        engine: '97.2 cc',
        mileage: '83 kmpl',
        power: '7.91 PS',
      }
    }
  ],
  electric: [
    {
      id: 'ola-s1-pro',
      name: 'Ola S1 Pro',
      image: '/demo.avif',
      price: '1,30,000',
      specs: {
        engine: 'Electric',
        mileage: '181 km',
        power: '8.5 kW',
      }
    },
    {
      id: 'ather-450x',
      name: 'Ather 450X',
      image: '/demo.avif',
      price: '1,40,000',
      specs: {
        engine: 'Electric',
        mileage: '146 km',
        power: '6.4 kW',
      }
    }
  ]
};

export default function FeaturedBikes() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState('commuter');
  
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

  const categories = [
    { key: 'commuter', label: 'Commuter Bikes' },
    { key: 'sports', label: 'Sports Bikes' },
    { key: 'cruiser', label: 'Cruiser Bikes' },
    { key: 'mileage', label: 'Best Mileage Bikes' },
    { key: 'electric', label: 'Electric Bikes' }
  ];

  const currentBikes = bikeCategories[activeCategory as keyof typeof bikeCategories];
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl text-gray-900" style={{ fontFamily: 'Lato, sans-serif, Arial', fontSize: '23px', fontWeight: 500 }}>
          <b>Bikes in Spotlight</b>
        </h2>
        <Link href="/bikes" className="px-4 py-2 text-sm text-primary border border-primary rounded-md hover:bg-primary hover:text-white transition-colors">
          View All Bikes
        </Link>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b">
        {categories.map((category) => (
          <button
            key={category.key}
            onClick={() => setActiveCategory(category.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeCategory === category.key
                ? 'text-red-600 border-red-600'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            {category.label}
          </button>
        ))}
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
        
        {/* Bikes Slider */}
        <div 
          ref={sliderRef}
          className="flex gap-4 overflow-x-hidden scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
        {currentBikes.map((bike) => (
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
                    <div className="font-medium">
                      {activeCategory === 'electric' ? 'Range' : 'Mileage'}
                    </div>
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