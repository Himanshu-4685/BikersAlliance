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
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          <Link href="/bikes/budget/under-50000" className="flex flex-col items-center p-3 text-sm transition-all bg-white border border-gray-100 rounded-lg hover:shadow-md group">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 group-hover:text-primary mb-1">₹50K</div>
              <div className="text-xs text-gray-600">Under ₹50,000</div>
            </div>
          </Link>
          <Link href="/bikes/budget/50000-70000" className="flex flex-col items-center p-3 text-sm transition-all bg-white border border-gray-100 rounded-lg hover:shadow-md group">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 group-hover:text-primary mb-1">₹50-70K</div>
              <div className="text-xs text-gray-600">₹50,000 - ₹70,000</div>
            </div>
          </Link>
          <Link href="/bikes/budget/70000-100000" className="flex flex-col items-center p-3 text-sm transition-all bg-white border border-gray-100 rounded-lg hover:shadow-md group">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 group-hover:text-primary mb-1">₹70K-1L</div>
              <div className="text-xs text-gray-600">₹70,000 - ₹1 Lakh</div>
            </div>
          </Link>
          <Link href="/bikes/budget/100000-125000" className="flex flex-col items-center p-3 text-sm transition-all bg-white border border-gray-100 rounded-lg hover:shadow-md group">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 group-hover:text-primary mb-1">₹1-1.25L</div>
              <div className="text-xs text-gray-600">₹1 Lakh - ₹1.25 Lakh</div>
            </div>
          </Link>
          <Link href="/bikes/budget/125000-150000" className="flex flex-col items-center p-3 text-sm transition-all bg-white border border-gray-100 rounded-lg hover:shadow-md group">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 group-hover:text-primary mb-1">₹1.25-1.5L</div>
              <div className="text-xs text-gray-600">₹1.25 Lakh - ₹1.5 Lakh</div>
            </div>
          </Link>
          <Link href="/bikes/budget/150000-200000" className="flex flex-col items-center p-3 text-sm transition-all bg-white border border-gray-100 rounded-lg hover:shadow-md group">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 group-hover:text-primary mb-1">₹1.5-2L</div>
              <div className="text-xs text-gray-600">₹1.5 Lakh - ₹2 Lakh</div>
            </div>
          </Link>
          <Link href="/bikes/budget/200000-250000" className="flex flex-col items-center p-3 text-sm transition-all bg-white border border-gray-100 rounded-lg hover:shadow-md group">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 group-hover:text-primary mb-1">₹2-2.5L</div>
              <div className="text-xs text-gray-600">₹2 Lakh - ₹2.5 Lakh</div>
            </div>
          </Link>
          <Link href="/bikes/budget/above-250000" className="flex flex-col items-center p-3 text-sm transition-all bg-white border border-gray-100 rounded-lg hover:shadow-md group">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 group-hover:text-primary mb-1">₹2.5L+</div>
              <div className="text-xs text-gray-600">Above ₹2.5 Lakh</div>
            </div>
          </Link>
        </div>
      )}
      
      {/* Bike Type List */}
      {activeTab === 'type' && (
        <div className="grid grid-cols-5 gap-4 sm:grid-cols-7 md:grid-cols-8 lg:grid-cols-10">
          <Link href="/bikes/type/commuter" className="flex flex-col items-center p-3 text-xs transition-all bg-white border border-gray-100 rounded-lg hover:shadow-md group">
            <div className="w-8 h-8 mb-1 flex items-center justify-center">
              <Image 
                src="/images/Body_style/commuter.svg" 
                alt="Commuter bikes" 
                width={32} 
                height={32}
                className="transition-transform duration-200 group-hover:scale-110"
              />
            </div>
            <span className="text-center text-gray-700 group-hover:text-primary">Commuter</span>
          </Link>
          <Link href="/bikes/type/sports" className="flex flex-col items-center p-3 text-xs transition-all bg-white border border-gray-100 rounded-lg hover:shadow-md group">
            <div className="w-8 h-8 mb-1 flex items-center justify-center">
              <Image 
                src="/images/Body_style/sports.svg" 
                alt="Sports bikes" 
                width={32} 
                height={32}
                className="transition-transform duration-200 group-hover:scale-110"
              />
            </div>
            <span className="text-center text-gray-700 group-hover:text-primary">Sports</span>
          </Link>
          <Link href="/bikes/type/cruiser" className="flex flex-col items-center p-3 text-xs transition-all bg-white border border-gray-100 rounded-lg hover:shadow-md group">
            <div className="w-8 h-8 mb-1 flex items-center justify-center">
              <Image 
                src="/images/Body_style/cruiser.svg" 
                alt="Cruiser bikes" 
                width={32} 
                height={32}
                className="transition-transform duration-200 group-hover:scale-110"
              />
            </div>
            <span className="text-center text-gray-700 group-hover:text-primary">Cruiser</span>
          </Link>
          <Link href="/bikes/type/adventure" className="flex flex-col items-center p-3 text-xs transition-all bg-white border border-gray-100 rounded-lg hover:shadow-md group">
            <div className="w-8 h-8 mb-1 flex items-center justify-center">
              <Image 
                src="/images/Body_style/adventure-tourer.svg" 
                alt="Adventure & Touring bikes" 
                width={32} 
                height={32}
                className="transition-transform duration-200 group-hover:scale-110"
              />
            </div>
            <span className="text-center text-gray-700 group-hover:text-primary">Adventure</span>
          </Link>
          <Link href="/bikes/type/scooter" className="flex flex-col items-center p-3 text-xs transition-all bg-white border border-gray-100 rounded-lg hover:shadow-md group">
            <div className="w-8 h-8 mb-1 flex items-center justify-center">
              <Image 
                src="/images/Body_style/scooters.svg" 
                alt="Scooters" 
                width={32} 
                height={32}
                className="transition-transform duration-200 group-hover:scale-110"
              />
            </div>
            <span className="text-center text-gray-700 group-hover:text-primary">Scooter</span>
          </Link>
          <Link href="/bikes/type/off-road" className="flex flex-col items-center p-3 text-xs transition-all bg-white border border-gray-100 rounded-lg hover:shadow-md group">
            <div className="w-8 h-8 mb-1 flex items-center justify-center">
              <Image 
                src="/images/Body_style/off-road.svg" 
                alt="Off-Road bikes" 
                width={32} 
                height={32}
                className="transition-transform duration-200 group-hover:scale-110"
              />
            </div>
            <span className="text-center text-gray-700 group-hover:text-primary">Off-Road</span>
          </Link>
          <Link href="/bikes/type/electric" className="flex flex-col items-center p-3 text-xs transition-all bg-white border border-gray-100 rounded-lg hover:shadow-md group">
            <div className="w-8 h-8 mb-1 flex items-center justify-center">
              <Image 
                src="/images/Body_style/electric-bikes.svg" 
                alt="Electric bikes" 
                width={32} 
                height={32}
                className="transition-transform duration-200 group-hover:scale-110"
              />
            </div>
            <span className="text-center text-gray-700 group-hover:text-primary">Electric</span>
          </Link>
          <Link href="/bikes/type/moped" className="flex flex-col items-center p-3 text-xs transition-all bg-white border border-gray-100 rounded-lg hover:shadow-md group">
            <div className="w-8 h-8 mb-1 flex items-center justify-center">
              <Image 
                src="/images/Body_style/moped.svg" 
                alt="Moped bikes" 
                width={32} 
                height={32}
                className="transition-transform duration-200 group-hover:scale-110"
              />
            </div>
            <span className="text-center text-gray-700 group-hover:text-primary">Moped</span>
          </Link>
          <Link href="/bikes/type/sports-naked" className="flex flex-col items-center p-3 text-xs transition-all bg-white border border-gray-100 rounded-lg hover:shadow-md group">
            <div className="w-8 h-8 mb-1 flex items-center justify-center">
              <Image 
                src="/images/Body_style/sports-naked.svg" 
                alt="Sports Naked bikes" 
                width={32} 
                height={32}
                className="transition-transform duration-200 group-hover:scale-110"
              />
            </div>
            <span className="text-center text-gray-700 group-hover:text-primary">Naked</span>
          </Link>
          <Link href="/bikes/type/super" className="flex flex-col items-center p-3 text-xs transition-all bg-white border border-gray-100 rounded-lg hover:shadow-md group">
            <div className="w-8 h-8 mb-1 flex items-center justify-center">
              <Image 
                src="/images/Body_style/super.svg" 
                alt="Super bikes" 
                width={32} 
                height={32}
                className="transition-transform duration-200 group-hover:scale-110"
              />
            </div>
            <span className="text-center text-gray-700 group-hover:text-primary">Super</span>
          </Link>
          <Link href="/bikes/type/tourer" className="flex flex-col items-center p-3 text-xs transition-all bg-white border border-gray-100 rounded-lg hover:shadow-md group">
            <div className="w-8 h-8 mb-1 flex items-center justify-center">
              <Image 
                src="/images/Body_style/tourer.svg" 
                alt="Tourer bikes" 
                width={32} 
                height={32}
                className="transition-transform duration-200 group-hover:scale-110"
              />
            </div>
            <span className="text-center text-gray-700 group-hover:text-primary">Tourer</span>
          </Link>
          <Link href="/bikes/type/sports-tourer" className="flex flex-col items-center p-3 text-xs transition-all bg-white border border-gray-100 rounded-lg hover:shadow-md group">
            <div className="w-8 h-8 mb-1 flex items-center justify-center">
              <Image 
                src="/images/Body_style/sports-tourer.svg" 
                alt="Sports Tourer bikes" 
                width={32} 
                height={32}
                className="transition-transform duration-200 group-hover:scale-110"
              />
            </div>
            <span className="text-center text-gray-700 group-hover:text-primary">Touring</span>
          </Link>
          <Link href="/bikes/type/scrambler" className="flex flex-col items-center p-3 text-xs transition-all bg-white border border-gray-100 rounded-lg hover:shadow-md group">
            <div className="w-8 h-8 mb-1 flex items-center justify-center">
              <Image 
                src="/images/Body_style/scrambler.svg" 
                alt="Scrambler bikes" 
                width={32} 
                height={32}
                className="transition-transform duration-200 group-hover:scale-110"
              />
            </div>
            <span className="text-center text-gray-700 group-hover:text-primary">Scrambler</span>
          </Link>
          <Link href="/bikes/type/street" className="flex flex-col items-center p-3 text-xs transition-all bg-white border border-gray-100 rounded-lg hover:shadow-md group">
            <div className="w-8 h-8 mb-1 flex items-center justify-center">
              <Image 
                src="/images/Body_style/street.svg" 
                alt="Street bikes" 
                width={32} 
                height={32}
                className="transition-transform duration-200 group-hover:scale-110"
              />
            </div>
            <span className="text-center text-gray-700 group-hover:text-primary">Street</span>
          </Link>
          <Link href="/bikes/type/cafe-racer" className="flex flex-col items-center p-3 text-xs transition-all bg-white border border-gray-100 rounded-lg hover:shadow-md group">
            <div className="w-8 h-8 mb-1 flex items-center justify-center">
              <Image 
                src="/images/Body_style/cafe-racer.svg" 
                alt="Cafe Racer bikes" 
                width={32} 
                height={32}
                className="transition-transform duration-200 group-hover:scale-110"
              />
            </div>
            <span className="text-center text-gray-700 group-hover:text-primary">Cafe Racer</span>
          </Link>
          <Link href="/bikes/type/dirt" className="flex flex-col items-center p-3 text-xs transition-all bg-white border border-gray-100 rounded-lg hover:shadow-md group">
            <div className="w-8 h-8 mb-1 flex items-center justify-center">
              <Image 
                src="/images/Body_style/dirt.svg" 
                alt="Dirt bikes" 
                width={32} 
                height={32}
                className="transition-transform duration-200 group-hover:scale-110"
              />
            </div>
            <span className="text-center text-gray-700 group-hover:text-primary">Dirt</span>
          </Link>
          <Link href="/bikes/type/roadster" className="flex flex-col items-center p-3 text-xs transition-all bg-white border border-gray-100 rounded-lg hover:shadow-md group">
            <div className="w-8 h-8 mb-1 flex items-center justify-center">
              <Image 
                src="/images/Body_style/roadster.svg" 
                alt="Roadster bikes" 
                width={32} 
                height={32}
                className="transition-transform duration-200 group-hover:scale-110"
              />
            </div>
            <span className="text-center text-gray-700 group-hover:text-primary">Roadster</span>
          </Link>
        </div>
      )}
      
      {/* Mileage List */}
      {activeTab === 'mileage' && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          <Link href="/bikes/mileage/under-30" className="flex flex-col items-center p-3 text-sm transition-all bg-white border border-gray-100 rounded-lg hover:shadow-md group">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 group-hover:text-primary mb-1">&lt;30</div>
              <div className="text-xs text-gray-600">Under 30 kmpl</div>
            </div>
          </Link>
          <Link href="/bikes/mileage/30-40" className="flex flex-col items-center p-3 text-sm transition-all bg-white border border-gray-100 rounded-lg hover:shadow-md group">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 group-hover:text-primary mb-1">30-40</div>
              <div className="text-xs text-gray-600">30 - 40 kmpl</div>
            </div>
          </Link>
          <Link href="/bikes/mileage/40-50" className="flex flex-col items-center p-3 text-sm transition-all bg-white border border-gray-100 rounded-lg hover:shadow-md group">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 group-hover:text-primary mb-1">40-50</div>
              <div className="text-xs text-gray-600">40 - 50 kmpl</div>
            </div>
          </Link>
          <Link href="/bikes/mileage/50-60" className="flex flex-col items-center p-3 text-sm transition-all bg-white border border-gray-100 rounded-lg hover:shadow-md group">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 group-hover:text-primary mb-1">50-60</div>
              <div className="text-xs text-gray-600">50 - 60 kmpl</div>
            </div>
          </Link>
          <Link href="/bikes/mileage/above-60" className="flex flex-col items-center p-3 text-sm transition-all bg-white border border-gray-100 rounded-lg hover:shadow-md group">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 group-hover:text-primary mb-1">60+</div>
              <div className="text-xs text-gray-600">Above 60 kmpl</div>
            </div>
          </Link>
        </div>
      )}
      
      {/* Engine Displacement List */}
      {activeTab === 'displacement' && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          <Link href="/bikes/displacement/under-125cc" className="flex flex-col items-center p-3 text-sm transition-all bg-white border border-gray-100 rounded-lg hover:shadow-md group">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 group-hover:text-primary mb-1">&lt;125cc</div>
              <div className="text-xs text-gray-600">Under 125cc</div>
            </div>
          </Link>
          <Link href="/bikes/displacement/125cc-150cc" className="flex flex-col items-center p-3 text-sm transition-all bg-white border border-gray-100 rounded-lg hover:shadow-md group">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 group-hover:text-primary mb-1">125-150cc</div>
              <div className="text-xs text-gray-600">125cc - 150cc</div>
            </div>
          </Link>
          <Link href="/bikes/displacement/150cc-200cc" className="flex flex-col items-center p-3 text-sm transition-all bg-white border border-gray-100 rounded-lg hover:shadow-md group">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 group-hover:text-primary mb-1">150-200cc</div>
              <div className="text-xs text-gray-600">150cc - 200cc</div>
            </div>
          </Link>
          <Link href="/bikes/displacement/200cc-250cc" className="flex flex-col items-center p-3 text-sm transition-all bg-white border border-gray-100 rounded-lg hover:shadow-md group">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 group-hover:text-primary mb-1">200-250cc</div>
              <div className="text-xs text-gray-600">200cc - 250cc</div>
            </div>
          </Link>
          <Link href="/bikes/displacement/250cc-300cc" className="flex flex-col items-center p-3 text-sm transition-all bg-white border border-gray-100 rounded-lg hover:shadow-md group">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 group-hover:text-primary mb-1">250-300cc</div>
              <div className="text-xs text-gray-600">250cc - 300cc</div>
            </div>
          </Link>
          <Link href="/bikes/displacement/300cc-500cc" className="flex flex-col items-center p-3 text-sm transition-all bg-white border border-gray-100 rounded-lg hover:shadow-md group">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 group-hover:text-primary mb-1">300-500cc</div>
              <div className="text-xs text-gray-600">300cc - 500cc</div>
            </div>
          </Link>
          <Link href="/bikes/displacement/above-500cc" className="flex flex-col items-center p-3 text-sm transition-all bg-white border border-gray-100 rounded-lg hover:shadow-md group">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 group-hover:text-primary mb-1">500cc+</div>
              <div className="text-xs text-gray-600">Above 500cc</div>
            </div>
          </Link>
        </div>
      )}
      
      {/* Engine Type List */}
      {activeTab === 'engine' && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          <Link href="/bikes/engine/4-stroke" className="flex flex-col items-center p-3 text-sm transition-all bg-white border border-gray-100 rounded-lg hover:shadow-md group">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 group-hover:text-primary mb-1">4S</div>
              <div className="text-xs text-gray-600">4-Stroke</div>
            </div>
          </Link>
          <Link href="/bikes/engine/2-stroke" className="flex flex-col items-center p-3 text-sm transition-all bg-white border border-gray-100 rounded-lg hover:shadow-md group">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 group-hover:text-primary mb-1">2S</div>
              <div className="text-xs text-gray-600">2-Stroke</div>
            </div>
          </Link>
          <Link href="/bikes/engine/electric" className="flex flex-col items-center p-3 text-sm transition-all bg-white border border-gray-100 rounded-lg hover:shadow-md group">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 group-hover:text-primary mb-1">⚡</div>
              <div className="text-xs text-gray-600">Electric</div>
            </div>
          </Link>
          <Link href="/bikes/engine/fuel-injection" className="flex flex-col items-center p-3 text-sm transition-all bg-white border border-gray-100 rounded-lg hover:shadow-md group">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 group-hover:text-primary mb-1">FI</div>
              <div className="text-xs text-gray-600">Fuel Injection</div>
            </div>
          </Link>
          <Link href="/bikes/engine/carburetor" className="flex flex-col items-center p-3 text-sm transition-all bg-white border border-gray-100 rounded-lg hover:shadow-md group">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 group-hover:text-primary mb-1">CARB</div>
              <div className="text-xs text-gray-600">Carburetor</div>
            </div>
          </Link>
          <Link href="/bikes/engine/single-cylinder" className="flex flex-col items-center p-3 text-sm transition-all bg-white border border-gray-100 rounded-lg hover:shadow-md group">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 group-hover:text-primary mb-1">1-CYL</div>
              <div className="text-xs text-gray-600">Single Cylinder</div>
            </div>
          </Link>
          <Link href="/bikes/engine/multi-cylinder" className="flex flex-col items-center p-3 text-sm transition-all bg-white border border-gray-100 rounded-lg hover:shadow-md group">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 group-hover:text-primary mb-1">MULTI</div>
              <div className="text-xs text-gray-600">Multi Cylinder</div>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}