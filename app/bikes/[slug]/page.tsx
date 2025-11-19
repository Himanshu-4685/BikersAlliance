'use client';

import { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  FiChevronRight, 
  FiTag, 
  FiSettings, 
  FiBarChart, 
  FiCalendar, 
  FiInfo, 
  FiStar,
  FiHeart,
  FiShare2,
  FiChevronLeft,
  FiMapPin,
  FiPhone,
  FiMail,
  FiClock,
  FiCheck,
  FiX,
  FiArrowRight
} from 'react-icons/fi';

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
    country?: string;
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
    name: string;
    value: string;
    category: string;
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
    createdAt: string;
    user: {
      name: string;
      image: string | null;
    };
  }[];
}

interface SimilarModel {
  id: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  brand: {
    name: string;
    slug: string;
  };
}

export default function BikeDetailsPage() {
  const { slug } = useParams() as { slug: string };
  const [bike, setBike] = useState<BikeDetails | null>(null);
  const [similarModels, setSimilarModels] = useState<SimilarModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [showEMICalculator, setShowEMICalculator] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Fetch bike details
  useEffect(() => {
    const fetchBikeDetails = async () => {
      try {
        const response = await fetch(`/api/models/${slug}`);
        const result = await response.json();
        
        if (result.success) {
          setBike(result.data.model);
          setSimilarModels(result.data.similarModels || []);
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
  
  // Group specifications by category with better categorization
  const groupedSpecs: Record<string, { name: string; value: string }[]> = {};
  
  bike.specifications.forEach(spec => {
    let category = 'general';
    
    // Better categorization based on spec name
    const specName = spec.name.toLowerCase();
    if (specName.includes('engine') || specName.includes('displacement') || 
        specName.includes('power') || specName.includes('torque') || 
        specName.includes('cylinder')) {
      category = 'engine';
    } else if (specName.includes('mileage') || specName.includes('fuel')) {
      category = 'mileage';
    } else if (specName.includes('transmission') || specName.includes('gear') || 
               specName.includes('clutch')) {
      category = 'transmission';
    } else if (specName.includes('body') || specName.includes('weight') || 
               specName.includes('dimension') || specName.includes('length') || 
               specName.includes('width') || specName.includes('height')) {
      category = 'dimensions';
    } else if (specName.includes('brake') || specName.includes('suspension') || 
               specName.includes('tyre') || specName.includes('wheel')) {
      category = 'chassis';
    }
    
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
                  <Image
                    src="/demo.avif"
                    alt={bike.name}
                    fill
                    className="object-contain"
                  />
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
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Technical Specifications</h2>
                    
                    <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                      {/* Engine Specifications */}
                      {groupedSpecs.engine && (
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                          <div className="flex items-center mb-4">
                            <div className="p-2 bg-blue-500 rounded-lg">
                              <FiSettings className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="ml-3 text-lg font-semibold text-blue-900">Engine</h3>
                          </div>
                          <div className="space-y-3">
                            {groupedSpecs.engine.map((spec) => (
                              <div key={spec.name} className="flex justify-between items-center py-2 border-b border-blue-100 last:border-b-0">
                                <span className="text-sm font-medium text-blue-700">{spec.name}</span>
                                <span className="text-sm font-bold text-blue-900">{spec.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Mileage Specifications */}
                      {groupedSpecs.mileage && (
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
                          <div className="flex items-center mb-4">
                            <div className="p-2 bg-green-500 rounded-lg">
                              <FiBarChart className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="ml-3 text-lg font-semibold text-green-900">Fuel Efficiency</h3>
                          </div>
                          <div className="space-y-3">
                            {groupedSpecs.mileage.map((spec) => (
                              <div key={spec.name} className="flex justify-between items-center py-2 border-b border-green-100 last:border-b-0">
                                <span className="text-sm font-medium text-green-700">{spec.name}</span>
                                <span className="text-sm font-bold text-green-900">{spec.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Dimensions Specifications */}
                      {groupedSpecs.dimensions && (
                        <div className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 rounded-lg p-6">
                          <div className="flex items-center mb-4">
                            <div className="p-2 bg-purple-500 rounded-lg">
                              <FiInfo className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="ml-3 text-lg font-semibold text-purple-900">Dimensions</h3>
                          </div>
                          <div className="space-y-3">
                            {groupedSpecs.dimensions.map((spec) => (
                              <div key={spec.name} className="flex justify-between items-center py-2 border-b border-purple-100 last:border-b-0">
                                <span className="text-sm font-medium text-purple-700">{spec.name}</span>
                                <span className="text-sm font-bold text-purple-900">{spec.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Transmission Specifications */}
                      {groupedSpecs.transmission && (
                        <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-lg p-6">
                          <div className="flex items-center mb-4">
                            <div className="p-2 bg-orange-500 rounded-lg">
                              <FiSettings className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="ml-3 text-lg font-semibold text-orange-900">Transmission</h3>
                          </div>
                          <div className="space-y-3">
                            {groupedSpecs.transmission.map((spec) => (
                              <div key={spec.name} className="flex justify-between items-center py-2 border-b border-orange-100 last:border-b-0">
                                <span className="text-sm font-medium text-orange-700">{spec.name}</span>
                                <span className="text-sm font-bold text-orange-900">{spec.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Chassis Specifications */}
                      {groupedSpecs.chassis && (
                        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200 rounded-lg p-6">
                          <div className="flex items-center mb-4">
                            <div className="p-2 bg-teal-500 rounded-lg">
                              <FiSettings className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="ml-3 text-lg font-semibold text-teal-900">Chassis & Suspension</h3>
                          </div>
                          <div className="space-y-3">
                            {groupedSpecs.chassis.map((spec) => (
                              <div key={spec.name} className="flex justify-between items-center py-2 border-b border-teal-100 last:border-b-0">
                                <span className="text-sm font-medium text-teal-700">{spec.name}</span>
                                <span className="text-sm font-bold text-teal-900">{spec.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* All Other Specifications */}
                      {Object.entries(groupedSpecs).filter(([category]) => 
                        !['engine', 'mileage', 'dimensions', 'transmission', 'chassis'].includes(category)
                      ).map(([category, specs]) => (
                        <div key={category} className="bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200 rounded-lg p-6">
                          <div className="flex items-center mb-4">
                            <div className="p-2 bg-gray-500 rounded-lg">
                              <FiTag className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="ml-3 text-lg font-semibold text-gray-900 capitalize">{category}</h3>
                          </div>
                          <div className="space-y-3">
                            {specs.map((spec) => (
                              <div key={spec.name} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                                <span className="text-sm font-medium text-gray-700">{spec.name}</span>
                                <span className="text-sm font-bold text-gray-900">{spec.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Key Highlights Section */}
                    <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
                      <h3 className="text-xl font-bold mb-4">Key Performance Highlights</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {bike.specifications.slice(0, 4).map((spec) => (
                          <div key={spec.name} className="text-center">
                            <div className="text-2xl font-bold">{spec.value}</div>
                            <div className="text-sm opacity-90">{spec.name}</div>
                          </div>
                        ))}
                      </div>
                    </div>
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
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">EMI Calculator</h4>
                  <p className="text-sm text-blue-700 mb-3">
                    Calculate your monthly EMI for {bike.name}
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Ex-showroom Price:</span>
                      <span className="font-semibold">₹{bike.variants[0].price?.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimated EMI (5 years):</span>
                      <span className="font-semibold text-green-600">
                        ₹{Math.round((bike.variants[0].price || 0) / 60).toLocaleString('en-IN')}/month
                      </span>
                    </div>
                  </div>
                  <Link href="/finance/emi-calculator" className="mt-3 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors block text-center">
                    Calculate Detailed EMI
                  </Link>
                </div>
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
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Reviews & Ratings</h2>
              <div className="flex items-center space-x-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      className={`w-5 h-5 ${
                        i < (bike.rating.average || 0)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-semibold">{bike.rating.average}/5</span>
                <span className="text-gray-500">({bike.rating.count} reviews)</span>
              </div>
            </div>
            
            {bike.reviews && bike.reviews.length > 0 ? (
              <div className="space-y-4">
                {bike.reviews.slice(0, 3).map((review: any, index: number) => (
                  <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{review.userName}</h4>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <FiStar
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-600">{review.content}</p>
                  </div>
                ))}
                <button className="w-full mt-4 bg-gray-100 text-gray-700 py-2 rounded-md hover:bg-gray-200 transition-colors">
                  View All Reviews
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <FiStar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No reviews yet. Be the first to review!</p>
                <button className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700">
                  Write a Review
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Dealers Section */}
        {bike.brand && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold mb-6">Authorized Dealers</h2>
            <div className="text-center py-8">
              <FiMapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Find {bike.brand.name} dealers near you</p>
              <div className="space-y-3">
                <div className="flex items-center justify-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <FiMapPin className="w-5 h-5 text-red-600" />
                    <span className="text-gray-700">Select your city</span>
                  </div>
                  <select className="border border-gray-300 rounded-md px-3 py-2 bg-white">
                    <option>Choose city...</option>
                    <option>Delhi</option>
                    <option>Mumbai</option>
                    <option>Bangalore</option>
                    <option>Chennai</option>
                    <option>Hyderabad</option>
                    <option>Pune</option>
                  </select>
                </div>
                <button className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors">
                  Find Dealers
                </button>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <FiPhone className="w-4 h-4" />
                    <span>Call: 1800-XXX-XXXX</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FiMail className="w-4 h-4" />
                    <span>Email: dealers@{bike.brand.slug}.com</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
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