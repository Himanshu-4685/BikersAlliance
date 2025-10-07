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
  image: string;
}

interface Todo {
  id: string;
  title: string;
  completed: boolean;
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
  const cookieStore = cookies();
  
  // Mock todos for development (replace with actual API call)
  const todos: Todo[] = [
    { id: '1', title: 'Check used bike inventory', completed: true },
    { id: '2', title: 'Update pricing model', completed: false },
    { id: '3', title: 'Contact potential sellers', completed: false }
  ];
  
  // In a real app, you would fetch bikes based on the city slug
  const cityName = params.slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Mock data - would be replaced with API call
  const usedBikes: UsedBike[] = [
    {
      id: '1',
      title: 'Royal Enfield Classic 350',
      price: 110000,
      year: 2020,
      kilometers: 15000,
      city: cityName,
      image: '/images/bikes/royal-enfield-classic-350.jpg'
    },
    {
      id: '2',
      title: 'Bajaj Pulsar 150',
      price: 55000,
      year: 2019,
      kilometers: 25000,
      city: cityName,
      image: '/images/bikes/bajaj-pulsar-150.jpg'
    },
    {
      id: '3',
      title: 'Honda CB Shine',
      price: 45000,
      year: 2018,
      kilometers: 30000,
      city: cityName,
      image: '/images/bikes/honda-cb-shine.jpg'
    },
    {
      id: '4',
      title: 'TVS Apache RTR 160',
      price: 65000,
      year: 2020,
      kilometers: 18000,
      city: cityName,
      image: '/images/bikes/tvs-apache-rtr-160.jpg'
    }
  ];

  return (
    <div className="container py-8">
      {/* Todo List */}
      <div className="p-4 mb-6 bg-white border rounded-lg shadow-sm">
        <h3 className="mb-3 text-lg font-medium">Todo List</h3>
        <ul className="pl-5 list-disc">
          {todos?.map((todo) => (
            <li key={todo.id} className="mb-2">
              {todo.title}
            </li>
          ))}
          {(!todos || todos.length === 0) && (
            <li className="text-gray-500">No todos found</li>
          )}
        </ul>
      </div>
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
          {usedBikes.length} verified used bikes available in {cityName}
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {usedBikes.map((bike) => (
          <div key={bike.id} className="overflow-hidden bg-white border rounded-lg shadow-sm">
            <div className="relative w-full pt-[75%]">
              <div className="absolute inset-0 bg-gray-200">
                {/* In a real app, use real images */}
                <div className="flex items-center justify-center w-full h-full text-gray-400">
                  Bike Image
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="mb-2 text-lg font-medium">{bike.title}</h3>
              <div className="flex justify-between mb-4">
                <span className="text-xl font-bold text-primary">₹{bike.price.toLocaleString()}</span>
                <span className="text-sm text-gray-500">{bike.year}</span>
              </div>
              
              <div className="flex justify-between text-sm text-gray-600">
                <span>{bike.kilometers.toLocaleString()} km</span>
                <span>{bike.city}</span>
              </div>
              
              <button className="w-full py-2 mt-4 text-white bg-primary rounded-md hover:bg-primary-dark">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}