'use client';

import { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FiChevronRight, FiTag, FiSettings, FiBarChart, FiCalendar, FiInfo } from 'react-icons/fi';

// Custom components
import ReviewsSection from '@/components/bikes/ReviewsSection';
import SimilarBikesSection from '@/components/bikes/SimilarBikesSection';
import EMICalculator from '@/components/bikes/EMICalculator';
import DealersSection from '@/components/bikes/DealersSection';

// Types
interface BikeDetails {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  launchDate: string | null;
  brand: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  images: {
    id: string;
    url: string;
    alt: string | null;
  }[];
  variants: {
    id: string;
    name: string;
    price: number;
  }[];
  specifications: {
    id: string;
    name: string;
    value: string;
  }[];
  features: {
    id: string;
    name: string;
    description: string | null;
  }[];
  rating?: {
    average: number;
    count: number;
  };
  reviews?: {
    id: string;
    title: string;
    content: string;
    rating: number;
    pros: string | null;
    cons: string | null;
    createdAt: string;
    user: {
      name: string;
      image: string | null;
    };
  }[];
  similarModels?: {
    id: string;
    name: string;
    slug: string;
    image: string;
    price: number;
    category?: string;
    brand?: {
      name: string;
      slug: string;
    };
  }[];
}

export default function BikeDetailsPage() {
  const { slug } = useParams() as { slug: string };
  const [bike, setBike] = useState<BikeDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState('specs');
  
  // Fetch bike details
  useEffect(() => {
    const fetchBikeDetails = async () => {
      try {
        const response = await fetch(`/api/models/${slug}`);
        const result = await response.json();
        
        if (result.success) {
          setBike(result.data.model);
        } else {
          console.error('Failed to fetch bike details:', result.error);
          notFound();
        }
      } catch (error) {
        console.error('Error fetching bike details:', error);
        notFound();
      } finally {
        setLoading(false);
      }
    };
    
    fetchBikeDetails();
  }, [slug]);
  
  if (loading) {
    return <BikeDetailsSkeleton />;
  }
  
  if (!bike) {
    return notFound();
  }
  
  // Group specifications by category
  const groupedSpecs: Record<string, { name: string; value: string }[]> = {};
  
  bike.specifications.forEach(spec => {
    const category = spec.name.split(' ')[0].toLowerCase();
    
    if (!groupedSpecs[category]) {
      groupedSpecs[category] = [];
    }
    
    groupedSpecs[category].push({
      name: spec.name,
      value: spec.value
    });
  });
  
  return (
    <div className="bg-gray-50">
      {/* Breadcrumbs */}
      <div className="bg-white border-b">
        <div className="container py-6">
          <div className="flex items-center text-sm text-gray-500">
            <Link href="/" className="hover:text-primary">Home</Link>
            <FiChevronRight className="mx-2" />
            <Link href="/bikes" className="hover:text-primary">Bikes</Link>
            <FiChevronRight className="mx-2" />
            {bike.brand && (
              <>
                <Link href={`/bikes?brand=${bike.brand.slug}`} className="hover:text-primary">
                  {bike.brand.name}
                </Link>
                <FiChevronRight className="mx-2" />
              </>
            )}
            <span className="text-gray-900">{bike.name}</span>
          </div>
          
          <h1 className="mt-4 text-3xl font-bold text-gray-900">{bike.name}</h1>
          
          {/* Launch date */}
          {bike.launchDate && (
            <p className="flex items-center mt-2 text-sm text-gray-500">
              <FiCalendar className="mr-1" /> 
              Launched: {new Date(bike.launchDate).toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric' 
              })}
            </p>
          )}
        </div>
      </div>
      
      <div className="container py-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left column: Images and Gallery */}
          <div className="lg:col-span-2">
            <div className="overflow-hidden bg-white border rounded-lg shadow-sm">
              {/* Main Image */}
              <div className="relative h-[400px] bg-gray-100">
                {bike.images && bike.images.length > 0 ? (
                  <Image
                    src={bike.images[activeImage].url}
                    alt={bike.images[activeImage].alt || bike.name}
                    fill
                    className="object-contain"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full">
                    <p className="text-gray-400">No image available</p>
                  </div>
                )}
              </div>
              
              {/* Thumbnails */}
              {bike.images && bike.images.length > 1 && (
                <div className="flex p-4 space-x-2 overflow-x-auto">
                  {bike.images.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setActiveImage(index)}
                      className={`relative w-16 h-16 border rounded-md overflow-hidden ${
                        index === activeImage ? 'border-primary' : 'border-gray-200'
                      }`}
                    >
                      <Image
                        src={image.url}
                        alt={image.alt || `${bike.name} image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Tabs */}
            <div className="mt-8">
              <div className="flex border-b">
                <button
                  onClick={() => setActiveTab('specs')}
                  className={`px-6 py-2 text-sm font-medium ${
                    activeTab === 'specs'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Specifications
                </button>
                <button
                  onClick={() => setActiveTab('features')}
                  className={`px-6 py-2 text-sm font-medium ${
                    activeTab === 'features'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Features
                </button>
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-6 py-2 text-sm font-medium ${
                    activeTab === 'overview'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Overview
                </button>
              </div>
              
              <div className="p-4 mt-4 bg-white border rounded-lg">
                {activeTab === 'specs' && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Specifications</h2>
                    
                    {Object.entries(groupedSpecs).map(([category, specs]) => (
                      <div key={category} className="mt-4">
                        <h3 className="text-md font-medium text-gray-900 capitalize">
                          {category} Specifications
                        </h3>
                        
                        <div className="mt-2 border rounded-md">
                          <table className="w-full text-sm">
                            <tbody>
                              {specs.map((spec, index) => (
                                <tr 
                                  key={spec.name}
                                  className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                                >
                                  <td className="px-4 py-2 font-medium text-gray-700">{spec.name}</td>
                                  <td className="px-4 py-2 text-gray-600">{spec.value}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {activeTab === 'features' && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Key Features</h2>
                    
                    {bike.features && bike.features.length > 0 ? (
                      <div className="mt-4 space-y-4">
                        {bike.features.map(feature => (
                          <div key={feature.id} className="p-3 border rounded-md">
                            <h3 className="text-md font-medium text-gray-900">{feature.name}</h3>
                            {feature.description && (
                              <p className="mt-1 text-sm text-gray-600">{feature.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-4 text-gray-500">No features information available.</p>
                    )}
                  </div>
                )}
                
                {activeTab === 'overview' && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Overview</h2>
                    
                    {bike.description ? (
                      <div className="mt-4 prose max-w-none">
                        <p className="text-gray-600">{bike.description}</p>
                      </div>
                    ) : (
                      <p className="mt-4 text-gray-500">No description available.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Right column: Pricing and key info */}
          <div>
            {/* Pricing Card */}
            <div className="p-4 bg-white border rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Price</h2>
              
              {bike.variants && bike.variants.length > 0 ? (
                <div className="mt-2 space-y-2">
                  {bike.variants.map(variant => (
                    <div key={variant.id} className="flex justify-between p-3 border rounded-md">
                      <span className="font-medium text-gray-700">{variant.name}</span>
                      <span className="font-bold text-gray-900">₹ {variant.price.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                  
                  <p className="mt-2 text-xs text-gray-500">
                    *Ex-showroom price. May vary based on location.
                  </p>
                </div>
              ) : (
                <p className="mt-2 text-gray-500">Price information not available</p>
              )}
              
              <div className="flex flex-col gap-2 mt-4">
                <button className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-600">
                  Get On Road Price
                </button>
                <button className="px-4 py-2 text-sm font-medium border border-primary text-primary rounded-md hover:bg-primary-50">
                  Book Test Ride
                </button>
              </div>
            </div>
            
            {/* Key Highlights */}
            <div className="p-4 mt-4 bg-white border rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Key Highlights</h2>
              
              <div className="mt-3 space-y-3">
                {bike.specifications.filter(spec => 
                  ['Engine', 'Mileage', 'Power', 'Torque', 'Fuel Capacity', 'Weight'].includes(spec.name)
                ).map(spec => (
                  <div key={spec.id} className="flex items-start">
                    <div className="p-2 mr-3 text-primary bg-primary-50 rounded-md">
                      {spec.name === 'Engine' && <FiSettings />}
                      {spec.name === 'Mileage' && <FiBarChart />}
                      {spec.name === 'Power' || spec.name === 'Torque' && <FiBarChart />}
                      {spec.name === 'Fuel Capacity' && <FiInfo />}
                      {spec.name === 'Weight' && <FiTag />}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{spec.name}</p>
                      <p className="font-medium text-gray-900">{spec.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Brand Info */}
            {bike.brand && (
              <div className="p-4 mt-4 bg-white border rounded-lg shadow-sm">
                <div className="flex items-center">
                  {bike.brand.logo && (
                    <div className="relative w-10 h-10 mr-3">
                      <Image
                        src={bike.brand.logo}
                        alt={bike.brand.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{bike.brand.name}</h2>
                    <Link href={`/brands/${bike.brand.slug}`} className="text-sm text-primary hover:underline">
                      View all {bike.brand.name} bikes
                    </Link>
                  </div>
                </div>
              </div>
            )}
            
            {/* EMI Calculator */}
            {bike.variants && bike.variants.length > 0 && (
              <div className="mt-4">
                <EMICalculator 
                  bikePrice={bike.variants[0].price} 
                />
              </div>
            )}
          </div>
        </div>
        
        {/* Similar Bikes */}
        {bike.similarModels && bike.similarModels.length > 0 && (
          <SimilarBikesSection 
            bikes={bike.similarModels}
            title={`Similar ${bike.category?.name || ''} Bikes`}
          />
        )}
        
        {/* Reviews Section */}
        {bike.rating && (
          <ReviewsSection 
            reviews={bike.reviews || []}
            averageRating={bike.rating.average || 0}
            totalReviews={bike.rating.count || 0}
          />
        )}
        
        {/* Dealers Section */}
        {bike.brand && (
          <DealersSection brandId={bike.brand.id} />
        )}
      </div>
    </div>
  );
}

function BikeDetailsSkeleton() {
  return (
    <div className="bg-gray-50">
      <div className="bg-white border-b">
        <div className="container py-6">
          <div className="flex items-center text-sm text-gray-500">
            <div className="w-10 h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="mx-2">›</div>
            <div className="w-10 h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="mx-2">›</div>
            <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
          
          <div className="w-3/4 h-8 mt-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-48 h-4 mt-2 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
      
      <div className="container py-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="bg-white border rounded-lg shadow-sm">
              <div className="h-[400px] bg-gray-200 animate-pulse"></div>
              <div className="flex p-4 space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-16 h-16 bg-gray-200 border rounded-md animate-pulse"></div>
                ))}
              </div>
            </div>
            
            <div className="mt-8">
              <div className="flex border-b">
                <div className="w-24 h-8 bg-gray-200 rounded animate-pulse mx-2"></div>
                <div className="w-24 h-8 bg-gray-200 rounded animate-pulse mx-2"></div>
                <div className="w-24 h-8 bg-gray-200 rounded animate-pulse mx-2"></div>
              </div>
              
              <div className="p-4 mt-4 bg-white border rounded-lg">
                <div className="w-48 h-6 bg-gray-200 rounded animate-pulse"></div>
                
                <div className="mt-4">
                  <div className="w-36 h-5 bg-gray-200 rounded animate-pulse"></div>
                  
                  <div className="mt-2 border rounded-md">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className={`flex justify-between p-3 ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                        <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <div className="p-4 bg-white border rounded-lg shadow-sm">
              <div className="w-24 h-6 bg-gray-200 rounded animate-pulse"></div>
              
              <div className="mt-2 space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex justify-between p-3 border rounded-md">
                    <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col gap-2 mt-4">
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
            
            <div className="p-4 mt-4 bg-white border rounded-lg shadow-sm">
              <div className="w-36 h-6 bg-gray-200 rounded animate-pulse"></div>
              
              <div className="mt-3 space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-start">
                    <div className="w-8 h-8 p-2 mr-3 bg-gray-200 rounded-md animate-pulse"></div>
                    <div>
                      <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="w-24 h-5 mt-1 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}