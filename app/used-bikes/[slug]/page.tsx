import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cookies } from 'next/headers';

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
  // Fetch used bikes from API
  let usedBikes: UsedBike[] = [];
  let cityName = '';
  let totalCount = 0;
  
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/used-bikes/cities/${params.slug}`, {
      next: { revalidate: 3600 } // Revalidate every hour
    });
    
    if (response.ok) {
      const result = await response.json();
      if (result.success) {
        usedBikes = result.data.bikes;
        cityName = result.data.city.name;
        totalCount = result.data.pagination.total;
      }
    }
  } catch (error) {
    console.error('Error fetching used bikes:', error);
  }

  // Fallback if no data from API
  if (!cityName) {
    cityName = params.slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Mock fallback data if API returns empty
  if (usedBikes.length === 0) {
    usedBikes = [
      {
        id: '1',
        title: 'Royal Enfield Classic 350',
        price: 110000,
        year: 2020,
        kilometers: 15000,
        city: cityName,
        state: 'Unknown',
        condition: 'Good',
        fuelType: 'Petrol',
        transmission: 'Manual',
        ownership: 'First Owner',
        image: '/images/bikes/royal-enfield-classic-350.jpg',
        photos: [],
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Bajaj Pulsar 150',
        price: 55000,
        year: 2019,
        kilometers: 25000,
        city: cityName,
        state: 'Unknown',
        condition: 'Good',
        fuelType: 'Petrol',
        transmission: 'Manual',
        ownership: 'Second Owner',
        image: '/images/bikes/bajaj-pulsar-150.jpg',
        photos: [],
        createdAt: new Date().toISOString()
      }
    ];
    totalCount = usedBikes.length;
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