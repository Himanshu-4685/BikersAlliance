'use client';

import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useComparison } from '@/context/ComparisonContext';

interface Bike {
  id: number;
  name: string;
  slug: string;
  price: number;
  image: string;
  brand: {
    id: string;
    name: string;
    slug: string;
    logo: string;
  };
  model: {
    id: number;
    name: string;
  };
  specs: {
    engine: string;
    mileage: string;
    power: string;
    displacement: string;
    engineType: string;
  };
}

interface Comparison {
  id: string;
  bikes: {
    id: number;
    name: string;
    image: string;
    price: number;
    slug: string;
    brand: { name: string; slug: string };
  }[];
}

// Popular Comparisons Data - these will be dynamically populated from API
const defaultComparisons: Comparison[] = [
  {
    id: 'hero-hf-vs-honda-shine',
    bikes: [
      {
        id: 150,
        name: 'Hero HF 100 STD',
        image: 'https://csvzysxiuuzcsmpknehi.supabase.co/storage/v1/object/public/Bikeralliance/Image/Variant_image/136.avif',
        price: 70653,
        slug: 'hero-hf-100-std',
        brand: { name: 'Hero', slug: 'hero' }
      },
      {
        id: 1,
        name: 'Honda Shine 100 STD',
        image: 'https://csvzysxiuuzcsmpknehi.supabase.co/storage/v1/object/public/Bikeralliance/Image/Variant_image/1.avif',
        price: 77969,
        slug: 'honda-shine-100-std',
        brand: { name: 'Honda', slug: 'honda' }
      }
    ]
  },
  {
    id: 'bajaj-pulsar-vs-yamaha-fz',
    bikes: [
      {
        id: 2,
        name: 'Bajaj Pulsar NS 125 STD',
        image: 'https://csvzysxiuuzcsmpknehi.supabase.co/storage/v1/object/public/Bikeralliance/Image/Variant_image/2.avif',
        price: 124723,
        slug: 'bajaj-pulsar-ns-125-std',
        brand: { name: 'Bajaj', slug: 'bajaj' }
      },
      {
        id: 3,
        name: 'Yamaha FZ-Fi Version 3.0 BS6',
        image: 'https://csvzysxiuuzcsmpknehi.supabase.co/storage/v1/object/public/Bikeralliance/Image/Variant_image/3.avif',
        price: 137001,
        slug: 'yamaha-fz-fi-version-3-bs6',
        brand: { name: 'Yamaha', slug: 'yamaha' }
      }
    ]
  },
  {
    id: 'hero-maestro-vs-honda-dio',
    bikes: [
      {
        id: 4,
        name: 'Hero Maestro Edge 110 BS6',
        image: 'https://csvzysxiuuzcsmpknehi.supabase.co/storage/v1/object/public/Bikeralliance/Image/Variant_image/4.avif',
        price: 80330,
        slug: 'hero-maestro-edge-110-bs6-alloy-wheel-fi',
        brand: { name: 'Hero', slug: 'hero' }
      },
      {
        id: 5,
        name: 'Honda Dio DLX OBD2',
        image: 'https://csvzysxiuuzcsmpknehi.supabase.co/storage/v1/object/public/Bikeralliance/Image/Variant_image/5.avif',
        price: 82263,
        slug: 'honda-dio-dlx-obd2',
        brand: { name: 'Honda', slug: 'honda' }
      }
    ]
  },
  {
    id: 'bajaj-platina-vs-honda-cd110',
    bikes: [
      {
        id: 6,
        name: 'Bajaj Platina 100 ES Drum BS6',
        image: 'https://csvzysxiuuzcsmpknehi.supabase.co/storage/v1/object/public/Bikeralliance/Image/Variant_image/6.avif',
        price: 81970,
        slug: 'bajaj-platina-100-es-drum-bs6',
        brand: { name: 'Bajaj', slug: 'bajaj' }
      },
      {
        id: 7,
        name: 'Honda CD 110 Dream DLX New',
        image: 'https://csvzysxiuuzcsmpknehi.supabase.co/storage/v1/object/public/Bikeralliance/Image/Variant_image/7.avif',
        price: 85379,
        slug: 'honda-cd-110-dream-dlx-new',
        brand: { name: 'Honda', slug: 'honda' }
      }
    ]
  }
];

export default function PopularComparisons() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const { addToComparison, addMultipleToComparison, clearComparison } = useComparison();
  const router = useRouter();
  const [comparisons, setComparisons] = useState<Comparison[]>(defaultComparisons);
  const [loading, setLoading] = useState(false);

  // Fetch popular comparisons from API
  useEffect(() => {
    async function fetchPopularComparisons() {
      try {
        setLoading(true);
        
        // Fetch bikes from different price segments for realistic comparisons
        const [budgetResponse, midResponse, scooterResponse] = await Promise.all([
          fetch('/api/bikes?minPrice=70000&maxPrice=90000&limit=10'),
          fetch('/api/bikes?minPrice=120000&maxPrice=150000&limit=10'),
          fetch('/api/bikes?minPrice=80000&maxPrice=110000&limit=10')
        ]);

        const [budgetData, midData, scooterData] = await Promise.all([
          budgetResponse.json(),
          midResponse.json(),
          scooterResponse.json()
        ]);

        if (budgetData.success && midData.success && scooterData.success) {
          const popularComparisons: Comparison[] = [];

          // Budget comparison (Hero vs Honda)
          const budgetBikes = budgetData.data.bikes;
          const heroBike = budgetBikes.find((bike: Bike) => bike.brand.name === 'Hero');
          const hondaBike = budgetBikes.find((bike: Bike) => bike.brand.name === 'Honda');
          
          if (heroBike && hondaBike) {
            popularComparisons.push({
              id: `${heroBike.slug}-vs-${hondaBike.slug}`,
              bikes: [
                {
                  id: heroBike.id,
                  name: heroBike.name,
                  image: heroBike.image,
                  price: heroBike.price,
                  slug: heroBike.slug,
                  brand: { name: heroBike.brand.name, slug: heroBike.brand.slug }
                },
                {
                  id: hondaBike.id,
                  name: hondaBike.name,
                  image: hondaBike.image,
                  price: hondaBike.price,
                  slug: hondaBike.slug,
                  brand: { name: hondaBike.brand.name, slug: hondaBike.brand.slug }
                }
              ]
            });
          }

          // Mid-range comparison (Bajaj vs Yamaha)
          const midBikes = midData.data.bikes;
          const bajajBike = midBikes.find((bike: Bike) => bike.brand.name === 'Bajaj');
          const yamahaBike = midBikes.find((bike: Bike) => bike.brand.name === 'Yamaha');
          
          if (bajajBike && yamahaBike) {
            popularComparisons.push({
              id: `${bajajBike.slug}-vs-${yamahaBike.slug}`,
              bikes: [
                {
                  id: bajajBike.id,
                  name: bajajBike.name,
                  image: bajajBike.image,
                  price: bajajBike.price,
                  slug: bajajBike.slug,
                  brand: { name: bajajBike.brand.name, slug: bajajBike.brand.slug }
                },
                {
                  id: yamahaBike.id,
                  name: yamahaBike.name,
                  image: yamahaBike.image,
                  price: yamahaBike.price,
                  slug: yamahaBike.slug,
                  brand: { name: yamahaBike.brand.name, slug: yamahaBike.brand.slug }
                }
              ]
            });
          }

          // Scooter comparison (available scooters in price range)
          const scooterBikes = scooterData.data.bikes.slice(0, 4);
          if (scooterBikes.length >= 2) {
            popularComparisons.push({
              id: `${scooterBikes[0].slug}-vs-${scooterBikes[1].slug}`,
              bikes: [
                {
                  id: scooterBikes[0].id,
                  name: scooterBikes[0].name,
                  image: scooterBikes[0].image,
                  price: scooterBikes[0].price,
                  slug: scooterBikes[0].slug,
                  brand: { name: scooterBikes[0].brand.name, slug: scooterBikes[0].brand.slug }
                },
                {
                  id: scooterBikes[1].id,
                  name: scooterBikes[1].name,
                  image: scooterBikes[1].image,
                  price: scooterBikes[1].price,
                  slug: scooterBikes[1].slug,
                  brand: { name: scooterBikes[1].brand.name, slug: scooterBikes[1].brand.slug }
                }
              ]
            });
          }

          // Add another comparison if we have more bikes
          if (scooterBikes.length >= 4) {
            popularComparisons.push({
              id: `${scooterBikes[2].slug}-vs-${scooterBikes[3].slug}`,
              bikes: [
                {
                  id: scooterBikes[2].id,
                  name: scooterBikes[2].name,
                  image: scooterBikes[2].image,
                  price: scooterBikes[2].price,
                  slug: scooterBikes[2].slug,
                  brand: { name: scooterBikes[2].brand.name, slug: scooterBikes[2].brand.slug }
                },
                {
                  id: scooterBikes[3].id,
                  name: scooterBikes[3].name,
                  image: scooterBikes[3].image,
                  price: scooterBikes[3].price,
                  slug: scooterBikes[3].slug,
                  brand: { name: scooterBikes[3].brand.name, slug: scooterBikes[3].brand.slug }
                }
              ]
            });
          }

          // Only update if we got valid comparisons, otherwise keep defaults
          if (popularComparisons.length > 0) {
            setComparisons(popularComparisons);
          }
        }
      } catch (error) {
        console.error('Error fetching popular comparisons:', error);
        // Keep default comparisons on error
      } finally {
        setLoading(false);
      }
    }

    fetchPopularComparisons();
  }, []);
  
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

  const handleCompareClick = async (comparison: Comparison) => {
    try {
      // Clear existing comparison first
      clearComparison();
      
      // Prepare both bikes for comparison with proper data structure
      const bikesForComparison = comparison.bikes.map(bike => ({
        id: bike.id.toString(), // Convert number ID to string as expected by ComparisonContext
        name: bike.name,
        slug: bike.slug,
        image: bike.image,
        price: bike.price,
        brand: {
          name: bike.brand.name,
          slug: bike.brand.slug
        }
      }));
      
      console.log('Prepared bikes for comparison:', bikesForComparison); // Debug log
      
      // Wait a moment to ensure clearing is complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Add both bikes at once using the new method
      addMultipleToComparison(bikesForComparison);
      
      console.log('Added multiple bikes to comparison'); // Debug log
      
      // Wait a moment to ensure bikes are added before navigation
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Navigate to compare page
      router.push('/compare');
    } catch (error) {
      console.error('Error in handleCompareClick:', error);
    }
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
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        /* Carousel with side arrows */
        <div className="relative flex items-center">
          {/* Left Arrow */}
          <button 
            onClick={scrollLeft}
            className="absolute -left-4 z-10 flex items-center justify-center w-10 h-10 transition-colors bg-white border border-gray-200 rounded-full shadow hover:bg-gray-50"
            aria-label="Scroll left"
          >
            <FiChevronLeft className="w-6 h-6" />
          </button>
          
          {/* Comparison Slider */}
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
                              src={bike.image || '/demo.avif'}
                              alt={bike.name}
                              fill
                              className="object-cover"
                              sizes="128px"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/demo.avif';
                              }}
                            />
                          </div>
                          <h4 className="mb-1 text-sm font-medium text-center text-gray-900 line-clamp-2">
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
      )}
    </div>
  );
}