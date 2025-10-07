'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

// Brand data
const brands = [
  { id: 'honda', name: 'Honda', logo: '/images/brands/honda.avif' },
  { id: 'hero', name: 'Hero', logo: '/images/brands/hero.avif' },
  { id: 'bajaj', name: 'Bajaj', logo: '/images/brands/bajaj.avif' },
  { id: 'tvs', name: 'TVS', logo: '/images/brands/tvs.avif' },
  { id: 'yamaha', name: 'Yamaha', logo: '/images/brands/yamaha.avif' },
  { id: 'suzuki', name: 'Suzuki', logo: '/images/brands/suzuki.avif' },
  { id: 'royal-enfield', name: 'Royal Enfield', logo: '/images/brands/royal-enfield.avif' },
  { id: 'ktm', name: 'KTM', logo: '/images/brands/ktm.avif' },
  { id: 'bmw', name: 'BMW', logo: '/images/brands/bmw.avif' },
  { id: 'jawa-motorcycles', name: 'Jawa', logo: '/images/brands/jawa-motorcycles.avif' },
  { id: 'harley-davidson', name: 'Harley Davidson', logo: '/images/brands/harley-davidson.avif' },
  { id: 'kawasaki', name: 'Kawasaki', logo: '/images/brands/kawasaki.avif' },
  { id: 'husqvarna', name: 'Husqvarna', logo: '/images/brands/husqvarna.avif' },
  { id: 'ola-electric', name: 'Ola Electric', logo: '/images/brands/ola-electric.avif' },
  { id: 'ather', name: 'Ather', logo: '/images/brands/ather.avif' }, // Not found in brand-images, using .png as fallback
  // Adding more brands from your brand-images folder
  { id: 'aprilia', name: 'Aprilia', logo: '/images/brands/aprilia.avif' },
  { id: 'ducati', name: 'Ducati', logo: '/images/brands/ducati.avif' },
  { id: 'triumph', name: 'Triumph', logo: '/images/brands/triumph.avif' },
  { id: 'benelli', name: 'Benelli', logo: '/images/brands/benelli.avif' },
  { id: 'revolt', name: 'Revolt', logo: '/images/brands/revolt.avif' },
];

// Categories for the tabs
const categories = [
  { id: 'brand', label: 'Brand' },
  { id: 'budget', label: 'Budget' },
  { id: 'type', label: 'Type' },
  { id: 'mileage', label: 'Mileage' },
  { id: 'displacement', label: 'Displacement' },
  { id: 'engine', label: 'Engine Type' },
];

export default function BrandList() {
  const [activeTab, setActiveTab] = useState('brand');
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <h2 className="mb-6 text-2xl text-gray-900" style={{ fontFamily: 'Lato, sans-serif, Arial', fontSize: '23px', fontWeight: 500 }}><b>Browse Bikes By</b></h2>
      
      {/* Category Tabs */}
      <div className="flex overflow-x-auto pb-2 mb-6 border-b scrollbar-hide">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveTab(category.id)}
            className={`px-4 py-2 -mb-px text-sm font-medium whitespace-nowrap ${
              activeTab === category.id
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>
      
      {/* Brands Grid */}
      {activeTab === 'brand' && (
        <div>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-11 gap-4 mb-4">
            {brands.slice(0, 22).map((brand) => (
              <Link
                href={`/brands/${brand.id}`}
                key={brand.id}
                className="flex flex-col items-center p-3 transition-all bg-white border border-gray-100 rounded-lg hover:shadow-md group"
              >
                <div className="relative w-12 h-12 mb-2">
                  <Image
                    src={brand.logo}
                    alt={brand.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-xs text-center text-gray-700 group-hover:text-primary">
                  {brand.name}
                </span>
              </Link>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Link href="/brands" className="text-sm text-primary hover:underline">
              View All Brands
            </Link>
          </div>
        </div>
      )}
      
      {/* Budget List */}
      {activeTab === 'budget' && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          <Link href="/bikes/budget/under-50000" className="p-3 text-sm transition-colors bg-white rounded-lg hover:bg-gray-50 hover:text-primary">
            Under ₹50,000
          </Link>
          <Link href="/bikes/budget/50000-70000" className="p-3 text-sm transition-colors bg-white rounded-lg hover:bg-gray-50 hover:text-primary">
            ₹50,000 - ₹70,000
          </Link>
          <Link href="/bikes/budget/70000-100000" className="p-3 text-sm transition-colors bg-white rounded-lg hover:bg-gray-50 hover:text-primary">
            ₹70,000 - ₹1 Lakh
          </Link>
          <Link href="/bikes/budget/100000-125000" className="p-3 text-sm transition-colors bg-white rounded-lg hover:bg-gray-50 hover:text-primary">
            ₹1 Lakh - ₹1.25 Lakh
          </Link>
          <Link href="/bikes/budget/125000-150000" className="p-3 text-sm transition-colors bg-white rounded-lg hover:bg-gray-50 hover:text-primary">
            ₹1.25 Lakh - ₹1.5 Lakh
          </Link>
          <Link href="/bikes/budget/150000-200000" className="p-3 text-sm transition-colors bg-white rounded-lg hover:bg-gray-50 hover:text-primary">
            ₹1.5 Lakh - ₹2 Lakh
          </Link>
          <Link href="/bikes/budget/200000-250000" className="p-3 text-sm transition-colors bg-white rounded-lg hover:bg-gray-50 hover:text-primary">
            ₹2 Lakh - ₹2.5 Lakh
          </Link>
          <Link href="/bikes/budget/above-250000" className="p-3 text-sm transition-colors bg-white rounded-lg hover:bg-gray-50 hover:text-primary">
            Above ₹2.5 Lakh
          </Link>
        </div>
      )}
      
      {/* Bike Type List */}
      {activeTab === 'type' && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          <Link href="/bikes/type/commuter" className="p-3 text-sm transition-colors bg-white rounded-lg hover:bg-gray-50 hover:text-primary">
            Commuter
          </Link>
          <Link href="/bikes/type/sports" className="p-3 text-sm transition-colors bg-white rounded-lg hover:bg-gray-50 hover:text-primary">
            Sports
          </Link>
          <Link href="/bikes/type/cruiser" className="p-3 text-sm transition-colors bg-white rounded-lg hover:bg-gray-50 hover:text-primary">
            Cruiser
          </Link>
          <Link href="/bikes/type/adventure" className="p-3 text-sm transition-colors bg-white rounded-lg hover:bg-gray-50 hover:text-primary">
            Adventure & Touring
          </Link>
          <Link href="/bikes/type/scooter" className="p-3 text-sm transition-colors bg-white rounded-lg hover:bg-gray-50 hover:text-primary">
            Scooter
          </Link>
          <Link href="/bikes/type/off-road" className="p-3 text-sm transition-colors bg-white rounded-lg hover:bg-gray-50 hover:text-primary">
            Off-Road
          </Link>
          <Link href="/bikes/type/electric" className="p-3 text-sm transition-colors bg-white rounded-lg hover:bg-gray-50 hover:text-primary">
            Electric
          </Link>
          <Link href="/bikes/type/moped" className="p-3 text-sm transition-colors bg-white rounded-lg hover:bg-gray-50 hover:text-primary">
            Moped
          </Link>
        </div>
      )}
      
      {/* Mileage List */}
      {activeTab === 'mileage' && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          <Link href="/bikes/mileage/under-30" className="p-3 text-sm transition-colors bg-white rounded-lg hover:bg-gray-50 hover:text-primary">
            Under 30 kmpl
          </Link>
          <Link href="/bikes/mileage/30-40" className="p-3 text-sm transition-colors bg-white rounded-lg hover:bg-gray-50 hover:text-primary">
            30 - 40 kmpl
          </Link>
          <Link href="/bikes/mileage/40-50" className="p-3 text-sm transition-colors bg-white rounded-lg hover:bg-gray-50 hover:text-primary">
            40 - 50 kmpl
          </Link>
          <Link href="/bikes/mileage/50-60" className="p-3 text-sm transition-colors bg-white rounded-lg hover:bg-gray-50 hover:text-primary">
            50 - 60 kmpl
          </Link>
          <Link href="/bikes/mileage/above-60" className="p-3 text-sm transition-colors bg-white rounded-lg hover:bg-gray-50 hover:text-primary">
            Above 60 kmpl
          </Link>
        </div>
      )}
      
      {/* Engine Displacement List */}
      {activeTab === 'displacement' && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          <Link href="/bikes/displacement/under-125cc" className="p-3 text-sm transition-colors bg-white rounded-lg hover:bg-gray-50 hover:text-primary">
            Under 125cc
          </Link>
          <Link href="/bikes/displacement/125cc-150cc" className="p-3 text-sm transition-colors bg-white rounded-lg hover:bg-gray-50 hover:text-primary">
            125cc - 150cc
          </Link>
          <Link href="/bikes/displacement/150cc-200cc" className="p-3 text-sm transition-colors bg-white rounded-lg hover:bg-gray-50 hover:text-primary">
            150cc - 200cc
          </Link>
          <Link href="/bikes/displacement/200cc-250cc" className="p-3 text-sm transition-colors bg-white rounded-lg hover:bg-gray-50 hover:text-primary">
            200cc - 250cc
          </Link>
          <Link href="/bikes/displacement/250cc-300cc" className="p-3 text-sm transition-colors bg-white rounded-lg hover:bg-gray-50 hover:text-primary">
            250cc - 300cc
          </Link>
          <Link href="/bikes/displacement/300cc-500cc" className="p-3 text-sm transition-colors bg-white rounded-lg hover:bg-gray-50 hover:text-primary">
            300cc - 500cc
          </Link>
          <Link href="/bikes/displacement/above-500cc" className="p-3 text-sm transition-colors bg-white rounded-lg hover:bg-gray-50 hover:text-primary">
            Above 500cc
          </Link>
        </div>
      )}
      
      {/* Engine Type List */}
      {activeTab === 'engine' && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          <Link href="/bikes/engine/4-stroke" className="p-3 text-sm transition-colors bg-white rounded-lg hover:bg-gray-50 hover:text-primary">
            4-Stroke
          </Link>
          <Link href="/bikes/engine/2-stroke" className="p-3 text-sm transition-colors bg-white rounded-lg hover:bg-gray-50 hover:text-primary">
            2-Stroke
          </Link>
          <Link href="/bikes/engine/electric" className="p-3 text-sm transition-colors bg-white rounded-lg hover:bg-gray-50 hover:text-primary">
            Electric
          </Link>
          <Link href="/bikes/engine/fuel-injection" className="p-3 text-sm transition-colors bg-white rounded-lg hover:bg-gray-50 hover:text-primary">
            Fuel Injection
          </Link>
          <Link href="/bikes/engine/carburetor" className="p-3 text-sm transition-colors bg-white rounded-lg hover:bg-gray-50 hover:text-primary">
            Carburetor
          </Link>
          <Link href="/bikes/engine/single-cylinder" className="p-3 text-sm transition-colors bg-white rounded-lg hover:bg-gray-50 hover:text-primary">
            Single Cylinder
          </Link>
          <Link href="/bikes/engine/multi-cylinder" className="p-3 text-sm transition-colors bg-white rounded-lg hover:bg-gray-50 hover:text-primary">
            Multi Cylinder
          </Link>
        </div>
      )}
    </div>
  );
}