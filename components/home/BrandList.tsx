'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getBrands, Brand } from '@/utils/api/brands';

// Fallback brand data (in case database is unavailable)
const fallbackBrands = [
  { brand_id: 'honda', brand_name: 'Honda', logo_url: '/images/brands/honda.avif' },
  { brand_id: 'hero', brand_name: 'Hero', logo_url: '/images/brands/hero.avif' },
  { brand_id: 'bajaj', brand_name: 'Bajaj', logo_url: '/images/brands/bajaj.avif' },
  { brand_id: 'tvs', brand_name: 'TVS', logo_url: '/images/brands/tvs.avif' },
  { brand_id: 'yamaha', brand_name: 'Yamaha', logo_url: '/images/brands/yamaha.avif' },
  { brand_id: 'suzuki', brand_name: 'Suzuki', logo_url: '/images/brands/suzuki.avif' },
];

// Helper function to convert brand name to slug for URL and image path
function brandNameToSlug(brandName: string): string {
  return brandName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
}

// Helper function to get fallback image path
function getFallbackImagePath(brandName: string): string {
  const slug = brandNameToSlug(brandName);
  return `/brand-images/${slug}.avif`;
}

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
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch brands from database on component mount
  useEffect(() => {
    async function fetchBrands() {
      const timeoutId = setTimeout(() => {
        console.log('🏍️ BrandList: Fetch timeout, using fallback brands');
        setLoading(false);
        setError('Connection timeout');
        setBrands(fallbackBrands);
      }, 5000); // 5 second timeout

      try {
        console.log('🏍️ BrandList: Starting to fetch brands...');
        setLoading(true);
        setError(null);
        
        const fetchedBrands = await getBrands();
        console.log('🏍️ BrandList: Fetched brands:', fetchedBrands.length);
        
        clearTimeout(timeoutId);
        setBrands(fetchedBrands);
      } catch (err) {
        console.error('🏍️ BrandList: Failed to fetch brands:', err);
        clearTimeout(timeoutId);
        setError(err instanceof Error ? err.message : 'Failed to load brands');
        
        // Use fallback brands if database fetch fails
        console.log('🏍️ BrandList: Using fallback brands');
        setBrands(fallbackBrands);
      } finally {
        setLoading(false);
        console.log('🏍️ BrandList: Finished loading');
      }
    }

    fetchBrands();
  }, []);
  
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
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <Image
                  src="/images/Loading/loading-red.svg"
                  alt="Loading..."
                  width={40}
                  height={40}
                />
                <div className="text-gray-500 text-sm">Loading brands...</div>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-red-500">Error: {error}</div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-11 gap-4 mb-4">
                {brands.slice(0, 22).map((brand) => {
                  const brandSlug = brandNameToSlug(brand.brand_name);
                  // Use database logo_url if available, otherwise use local brand images
                  const imageUrl = brand.logo_url && brand.logo_url.trim() !== '' 
                    ? brand.logo_url 
                    : getFallbackImagePath(brand.brand_name);
                  
                  return (
                    <Link
                      href={`/brands/${brandSlug}`}
                      key={brand.brand_id}
                      className="flex flex-col items-center p-3 transition-all bg-white border border-gray-100 rounded-lg hover:shadow-md group"
                    >
                      <div className="relative w-12 h-12 mb-2">
                        <Image
                          src={imageUrl}
                          alt={brand.brand_name}
                          fill
                          className="object-contain"
                          onError={(e) => {
                            // Fallback to default image if brand image fails to load
                            const target = e.target as HTMLImageElement;
                            if (target.src !== '/logo-fallback.svg') {
                              target.src = '/logo-fallback.svg';
                            }
                          }}
                        />
                      </div>
                      <span className="text-xs text-center text-gray-700 group-hover:text-primary">
                        {brand.brand_name}
                      </span>
                    </Link>
                  );
                })}
              </div>
              <div className="mt-4 text-center">
                <Link href="/brands" className="text-sm text-primary hover:underline">
                  View All Brands ({brands.length} total)
                </Link>
              </div>
            </>
          )}
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