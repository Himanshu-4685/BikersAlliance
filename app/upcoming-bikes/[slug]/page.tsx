'use client';

import { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FiChevronRight, FiClock, FiTag, FiSettings, FiBarChart, FiInfo, FiCalendar } from 'react-icons/fi';

// Types
interface UpcomingBikeDetail {
  id: string;
  name: string;
  image: string;
  images: string[];
  expectedPrice: string;
  expectedLaunch: string;
  brand: string;
  category: string;
  description: string;
  keyFeatures: string[];
  specifications: {
    engine: string;
    power: string;
    torque: string;
    fuelCapacity: string;
    seatHeight: string;
    weight: string;
  };
  competitors: {
    id: string;
    name: string;
    price: string;
  }[];
}

// Sample upcoming bike details (in a real app, this would come from your API)
const upcomingBikeDetails: Record<string, UpcomingBikeDetail> = {
  'ktm-rc-390': {
    id: 'ktm-rc-390',
    name: 'KTM RC 390',
    image: '/demo.avif',
    images: ['/demo.avif', '/demo.avif', '/demo.avif'],
    expectedPrice: '2.77 - 3.20 Lakh',
    expectedLaunch: 'Nov 2024',
    brand: 'KTM',
    category: 'Sports',
    description: 'The new KTM RC 390 promises to deliver enhanced performance with updated styling and improved ergonomics. Built on KTM\'s proven platform, this supersport motorcycle will feature advanced electronics and modern design elements.',
    keyFeatures: [
      'Updated design language',
      'Advanced TFT display',
      'Ride-by-wire technology',
      'Improved aerodynamics',
      'Enhanced suspension setup',
      'LED lighting all around'
    ],
    specifications: {
      engine: '373.2 cc, Single Cylinder',
      power: '44 PS @ 9,000 rpm',
      torque: '37 Nm @ 7,000 rpm',
      fuelCapacity: '13.5 liters',
      seatHeight: '820 mm',
      weight: '172 kg'
    },
    competitors: [
      { id: 'yamaha-r3', name: 'Yamaha R3', price: '3.60 Lakh' },
      { id: 'kawasaki-ninja-300', name: 'Kawasaki Ninja 300', price: '3.18 Lakh' },
      { id: 'tvs-apache-rr-310', name: 'TVS Apache RR 310', price: '2.65 Lakh' }
    ]
  },
  // Add more bike details as needed...
};

export default function UpcomingBikeDetailPage() {
  const params = useParams();
  const [bike, setBike] = useState<UpcomingBikeDetail | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.slug) {
      // In a real app, you would fetch from your API
      const bikeData = upcomingBikeDetails[params.slug as string];
      if (bikeData) {
        setBike(bikeData);
      }
      setLoading(false);
    }
  }, [params.slug]);

  if (loading) {
    return <BikeDetailsSkeleton />;
  }

  if (!bike) {
    notFound();
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container py-4">
          <div className="flex items-center text-sm text-gray-500">
            <Link href="/" className="hover:text-primary">Home</Link>
            <FiChevronRight className="mx-2" />
            <Link href="/upcoming-bikes" className="hover:text-primary">Upcoming Bikes</Link>
            <FiChevronRight className="mx-2" />
            <span className="text-gray-900">{bike.name}</span>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bike Header */}
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{bike.name}</h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <FiTag className="mr-1" />
                      {bike.category}
                    </span>
                    <span>{bike.brand}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary mb-1">₹ {bike.expectedPrice}</div>
                  <div className="text-sm text-gray-500">Expected Price</div>
                  <div className="flex items-center mt-2 text-sm text-orange-600">
                    <FiClock className="mr-1" />
                    Launch: {bike.expectedLaunch}
                  </div>
                </div>
              </div>

              {/* Upcoming Badge */}
              <div className="inline-flex items-center px-3 py-1 text-sm font-medium text-white bg-primary rounded-full">
                <FiCalendar className="mr-1 w-4 h-4" />
                Upcoming Launch
              </div>
            </div>

            {/* Image Gallery */}
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Gallery</h2>
              
              {/* Main Image */}
              <div className="relative h-80 bg-gray-100 rounded-lg overflow-hidden mb-4">
                <Image
                  src={bike.images[selectedImageIndex]}
                  alt={bike.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 66vw"
                />
              </div>

              {/* Thumbnail Images */}
              <div className="flex space-x-2 overflow-x-auto">
                {bike.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      selectedImageIndex === index ? 'border-primary' : 'border-gray-200'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${bike.name} ${index + 1}`}
                      width={80}
                      height={80}
                      className="object-cover w-full h-full"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">About {bike.name}</h2>
              <p className="text-gray-700 leading-relaxed">{bike.description}</p>
            </div>

            {/* Key Features */}
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Expected Key Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {bike.keyFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <FiInfo className="mr-2 text-primary flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Expected Specifications */}
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Expected Specifications</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Engine</span>
                    <span className="font-medium">{bike.specifications.engine}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Power</span>
                    <span className="font-medium">{bike.specifications.power}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Torque</span>
                    <span className="font-medium">{bike.specifications.torque}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Fuel Capacity</span>
                    <span className="font-medium">{bike.specifications.fuelCapacity}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Seat Height</span>
                    <span className="font-medium">{bike.specifications.seatHeight}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Weight</span>
                    <span className="font-medium">{bike.specifications.weight}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Action Card */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">Get Notified</h3>
              <p className="text-gray-600 mb-4 text-sm">
                Be the first to know when the {bike.name} launches in India.
              </p>
              <button className="w-full px-4 py-3 text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors mb-3">
                Notify Me on Launch
              </button>
              <button className="w-full px-4 py-3 text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-colors">
                Get Price Alert
              </button>
            </div>

            {/* Expected Competitors */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">Expected Competitors</h3>
              <div className="space-y-3">
                {bike.competitors.map((competitor) => (
                  <div key={competitor.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">{competitor.name}</span>
                    <span className="font-medium text-primary">₹ {competitor.price}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Info */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Info</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <FiCalendar className="mr-2 text-gray-400" />
                  <span className="text-sm text-gray-600">Expected Launch: {bike.expectedLaunch}</span>
                </div>
                <div className="flex items-center">
                  <FiTag className="mr-2 text-gray-400" />
                  <span className="text-sm text-gray-600">Category: {bike.category}</span>
                </div>
                <div className="flex items-center">
                  <FiSettings className="mr-2 text-gray-400" />
                  <span className="text-sm text-gray-600">Brand: {bike.brand}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BikeDetailsSkeleton() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Header Skeleton */}
            <div className="bg-white rounded-lg border p-6">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
            
            {/* Image Skeleton */}
            <div className="bg-white rounded-lg border p-6">
              <div className="animate-pulse">
                <div className="h-80 bg-gray-200 rounded-lg mb-4"></div>
                <div className="flex space-x-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-20 h-20 bg-gray-200 rounded-lg"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-1 space-y-6">
            {/* Sidebar Skeleton */}
            <div className="bg-white rounded-lg border p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                <div className="h-10 bg-gray-200 rounded w-full mb-3"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}