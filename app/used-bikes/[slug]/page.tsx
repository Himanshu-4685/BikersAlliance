import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Types
interface UsedBike {
  id: string;
  title: string;
  price: number;
  year: number;
  kilometers: number;
  city: string;
  state: string;
  condition: string;
  fuelType: string;
  transmission: string;
  ownership: string;
  image: string;
  photos: string[];
  createdAt: string;
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const cityName = params.slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    title: `Used Bikes in ${cityName} | Bikers Alliance`,
    description: `Find trusted used bikes in ${cityName} at great prices. All bikes verified by Bikers Alliance experts.`,
  };
}

export default async function CityUsedBikesPage({ params }: { params: { slug: string } }) {
  // Fetch used bikes directly from Supabase
  let usedBikes: UsedBike[] = [];
  let cityName = '';
  let totalCount = 0;
  
  try {
    const { createServerClient } = await import('@/lib/supabase-server');
    const supabase = createServerClient();
    
    // Convert slug back to city name
    cityName = params.slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    // Get used bikes for the specific city (case-insensitive)
    const { data: bikes, error } = await supabase
      .from('used_bikes')
      .select(`
        id,
        brand,
        model,
        variant,
        year,
        expected_price,
        km_driven,
        city,
        state,
        condition,
        photos,
        created_at,
        fuel_type,
        transmission,
        ownership
      `)
      .eq('status', 'approved')
      .ilike('city', cityName) // Use case-insensitive matching
      .is('sold_at', null) // Only show unsold bikes
      .order('created_at', { ascending: false })
      .limit(12);

    if (!error && bikes) {
      // Format the used bikes data
      usedBikes = bikes.map((bike: any) => ({
        id: bike.id,
        title: `${bike.brand} ${bike.model}${bike.variant ? ` ${bike.variant}` : ''}`,
        price: bike.expected_price,
        year: bike.year,
        kilometers: bike.km_driven,
        city: bike.city,
        state: bike.state,
        condition: bike.condition,
        fuelType: bike.fuel_type,
        transmission: bike.transmission,
        ownership: bike.ownership,
        image: bike.photos && bike.photos.length > 0 ? bike.photos[0] : '/images/bikes/default-bike.svg',
        photos: bike.photos || [],
        createdAt: bike.created_at
      }));
      
      totalCount = bikes.length;
    } else if (error) {
      console.error('Error fetching used bikes:', error);
    }
  } catch (error) {
    console.error('Error fetching used bikes:', error);
  }

  // Fallback if no data
  if (!cityName) {
    cityName = params.slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }



  return (
    <div className="container py-8">
      <div className="flex items-center mb-6">
        <Link href="/used-bikes" className="mr-2 text-primary hover:underline">
          Used Bikes
        </Link>
        <span className="mx-2 text-gray-400">›</span>
        <h1 className="text-2xl font-bold">{cityName}</h1>
      </div>
      
      <div className="p-4 mb-6 bg-white border rounded-lg">
        <h2 className="mb-2 text-xl font-semibold">Used Bikes in {cityName}</h2>
        <p className="text-gray-600">
          {totalCount} verified used bikes available in {cityName}
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {usedBikes.map((bike) => (
          <div key={bike.id} className="overflow-hidden bg-white border rounded-lg shadow-sm">
            <div className="relative w-full pt-[75%] bg-gray-100 rounded-t-lg overflow-hidden">
              {bike.image && !bike.image.includes('default-bike.svg') ? (
                <Image
                  src={bike.image}
                  alt={bike.title}
                  fill
                  className="absolute inset-0 object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Image
                    src="/images/bikes/default-bike.svg"
                    alt="Default bike placeholder"
                    width={100}
                    height={80}
                    className="opacity-40"
                  />
                </div>
              )}
            </div>
            
            <div className="p-4">
              <h3 className="mb-2 text-lg font-medium">{bike.title}</h3>
              <div className="flex justify-between mb-2">
                <span className="text-xl font-bold text-primary">₹{bike.price.toLocaleString()}</span>
                <span className="text-sm text-gray-500">{bike.year}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-gray-600">
                <span>{bike.kilometers.toLocaleString()} km</span>
                <span>{bike.condition}</span>
                <span>{bike.fuelType}</span>
                <span>{bike.ownership}</span>
              </div>
              
              <div className="flex justify-between text-sm text-gray-600 mb-3">
                <span>{bike.city}, {bike.state}</span>
              </div>
              
              <button className="w-full py-2 text-white bg-primary rounded-md hover:bg-primary-dark transition-colors">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}