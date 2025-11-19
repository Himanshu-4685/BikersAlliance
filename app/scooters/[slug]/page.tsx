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

// Types - Same as bikes but for scooters
interface ScooterDetails {
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

export default function ScooterDetailsPage() {
  const { slug } = useParams() as { slug: string };
  const [scooter, setScooter] = useState<ScooterDetails | null>(null);
  const [similarModels, setSimilarModels] = useState<SimilarModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [showEMICalculator, setShowEMICalculator] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Fetch scooter details
  useEffect(() => {
    const fetchScooterDetails = async () => {
      try {
        const response = await fetch(`/api/models/${slug}`);
        const result = await response.json();
        
        if (result.success) {
          setScooter(result.data.model);
          setSimilarModels(result.data.similarModels || []);
        } else {
          console.error('Failed to fetch scooter details:', result.error);
          notFound();
        }
      } catch (error) {
        console.error('Error fetching scooter details:', error);
        notFound();
      } finally {
        setLoading(false);
      }
    };
    
    fetchScooterDetails();
  }, [slug]);

  // Handle image navigation
  const nextImage = () => {
    if (scooter && scooter.images.length > 0) {
      setActiveImage((prev) => (prev + 1) % scooter.images.length);
    }
  };

  const prevImage = () => {
    if (scooter && scooter.images.length > 0) {
      setActiveImage((prev) => (prev - 1 + scooter.images.length) % scooter.images.length);
    }
  };

  // Group specifications by category
  const groupedSpecs = scooter ? scooter.specifications.reduce((acc, spec) => {
    if (!acc[spec.category]) {
      acc[spec.category] = [];
    }
    acc[spec.category].push(spec);
    return acc;
  }, {} as Record<string, typeof scooter.specifications>) : {};

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return <ScooterDetailsSkeleton />;
  }

  if (!scooter) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumbs */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center text-sm text-gray-500">
            <Link href="/" className="hover:text-primary">Home</Link>
            <FiChevronRight className="mx-2" />
            <Link href="/scooters" className="hover:text-primary">Scooters</Link>
            <FiChevronRight className="mx-2" />
            {scooter.brand && (
              <>
                <Link href={`/scooters?brand=${scooter.brand.slug}`} className="hover:text-primary">
                  {scooter.brand.name}
                </Link>
                <FiChevronRight className="mx-2" />
              </>
            )}
            <span className="text-gray-900">{scooter.name}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{scooter.name}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                {scooter.rating && scooter.rating.count > 0 && (
                  <div className="flex items-center">
                    <div className="flex items-center mr-1">
                      {[...Array(5)].map((_, i) => (
                        <FiStar
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(scooter.rating!.average)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-medium">{scooter.rating.average}</span>
                    <span className="text-gray-500">({scooter.rating.count} reviews)</span>
                  </div>
                )}
                {scooter.launchDate && (
                  <div className="flex items-center">
                    <FiCalendar className="w-4 h-4 mr-1" />
                    <span>Launched: {new Date(scooter.launchDate).toLocaleDateString('en-US', { 
                      month: 'long', 
                      year: 'numeric' 
                    })}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-3 mt-6 lg:mt-0">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`p-2 rounded-full border ${
                  isFavorite 
                    ? 'bg-red-50 border-red-200 text-red-600' 
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <FiHeart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
              <button className="p-2 rounded-full border bg-white border-gray-200 text-gray-600 hover:bg-gray-50">
                <FiShare2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Details */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
              <div className="relative aspect-video">
                <Image
                  src={scooter.images[activeImage]?.url || '/images/placeholder-scooter.jpg'}
                  alt={scooter.images[activeImage]?.alt || scooter.name}
                  fill
                  className="object-cover"
                />
                
                {scooter.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                    >
                      <FiChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                    >
                      <FiChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
              
              {/* Image Thumbnails */}
              {scooter.images.length > 1 && (
                <div className="flex p-4 space-x-2 overflow-x-auto">
                  {scooter.images.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setActiveImage(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 ${
                        activeImage === index ? 'border-primary' : 'border-gray-200'
                      }`}
                    >
                      <Image
                        src={image.url}
                        alt={image.alt || scooter.name}
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tab Navigation */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="flex border-b">
                {[
                  { id: 'overview', label: 'Overview', icon: FiInfo },
                  { id: 'specs', label: 'Specifications', icon: FiSettings },
                  { id: 'features', label: 'Features', icon: FiTag },
                  { id: 'reviews', label: 'Reviews', icon: FiStar }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-6 py-3 text-sm font-medium ${
                      activeTab === tab.id
                        ? 'text-primary border-b-2 border-primary bg-primary/5'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <tab.icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Overview</h2>
                    <div className="prose max-w-none">
                      <p className="text-gray-600 mb-6">
                        {scooter.description || `The ${scooter.name} is a premium scooter from ${scooter.brand.name}, offering exceptional performance, comfort, and style for urban commuting.`}
                      </p>
                      
                      {/* Key Highlights */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {scooter.specifications.slice(0, 6).map((spec, index) => (
                          <div key={index} className="bg-gray-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-500">{spec.name}</div>
                            <div className="text-lg font-semibold text-gray-900">{spec.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Specifications Tab */}
                {activeTab === 'specs' && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Detailed Specifications</h2>
                    <div className="space-y-6">
                      {Object.entries(groupedSpecs).map(([category, specs]) => (
                        <div key={category} className="border rounded-lg overflow-hidden">
                          <div className="bg-gray-50 px-4 py-3 border-b">
                            <h3 className="text-lg font-medium text-gray-900 capitalize">
                              {category.replace(/([A-Z])/g, ' $1').trim()}
                            </h3>
                          </div>
                          <div className="divide-y divide-gray-200">
                            {specs.map((spec, index) => (
                              <div key={index} className="flex justify-between py-3 px-4">
                                <dt className="text-gray-600">{spec.name}</dt>
                                <dd className="text-gray-900 font-medium">{spec.value}</dd>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Features Tab */}
                {activeTab === 'features' && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Features</h2>
                    {scooter.features && scooter.features.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {scooter.features.map(feature => (
                          <div key={feature.id} className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center mb-2">
                              <FiCheck className="w-5 h-5 text-green-500 mr-2" />
                              <h3 className="text-lg font-medium text-gray-900">{feature.name}</h3>
                            </div>
                            {feature.description && (
                              <p className="text-gray-600">{feature.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FiInfo className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Detailed features information will be available soon.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">User Reviews</h2>
                    {scooter.reviews && scooter.reviews.length > 0 ? (
                      <div className="space-y-6">
                        {scooter.reviews.map(review => (
                          <div key={review.id} className="border-b pb-6 last:border-b-0">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-medium text-gray-900">{review.title}</h4>
                                <p className="text-sm text-gray-500">by {review.user.name}</p>
                              </div>
                              <div className="flex items-center">
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
                            <p className="text-gray-600">{review.content}</p>
                            <p className="text-xs text-gray-400 mt-2">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FiStar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No reviews yet. Be the first to review!</p>
                        <button className="mt-4 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark">
                          Write a Review
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Pricing and Actions */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Pricing</h2>
              
              {scooter.variants && scooter.variants.length > 0 ? (
                <div className="space-y-4">
                  {/* Variant Selection */}
                  {scooter.variants.length > 1 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Variant
                      </label>
                      <select
                        value={selectedVariant}
                        onChange={(e) => setSelectedVariant(Number(e.target.value))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        {scooter.variants.map((variant, index) => (
                          <option key={variant.id} value={index}>
                            {variant.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  {/* Price Display */}
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Starting Price</div>
                    <div className="text-3xl font-bold text-primary">
                      {formatPrice(scooter.variants[selectedVariant]?.price || scooter.variants[0]?.price || 0)}
                    </div>
                    <div className="text-sm text-gray-500">*On-road price</div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <button className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-dark">
                      Get On Road Price
                    </button>
                    <button
                      onClick={() => setShowEMICalculator(true)}
                      className="w-full border border-primary text-primary py-3 px-4 rounded-lg font-medium hover:bg-primary/5"
                    >
                      Calculate EMI
                    </button>
                    <button className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50">
                      Compare
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500">Price information not available</p>
                  <button className="mt-3 text-primary hover:underline">
                    Request Quote
                  </button>
                </div>
              )}
            </div>

            {/* Quick Facts */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Facts</h3>
              <div className="space-y-3">
                {scooter.brand && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Brand</span>
                    <span className="font-medium text-gray-900">{scooter.brand.name}</span>
                  </div>
                )}
                {scooter.specifications.filter(spec => 
                  ['displacement', 'engine type', 'max power', 'mileage'].includes(spec.name.toLowerCase())
                ).slice(0, 4).map((spec, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-gray-600">{spec.name}</span>
                    <span className="font-medium text-gray-900">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dealer Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Find Dealer</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center">
                    <FiMapPin className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-700">Locate Dealers</span>
                  </div>
                  <FiArrowRight className="w-4 h-4 text-gray-400" />
                </button>
                <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center">
                    <FiClock className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-700">Book Test Ride</span>
                  </div>
                  <FiArrowRight className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Models Section */}
        {similarModels.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Scooters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarModels.slice(0, 6).map(model => (
                <Link key={model.id} href={`/scooters/${model.slug}`}>
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="aspect-video relative">
                      <Image
                        src={model.image}
                        alt={model.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1">{model.name}</h3>
                      <p className="text-sm text-gray-500 mb-2">{model.brand.name}</p>
                      <div className="text-lg font-bold text-primary">
                        {formatPrice(model.price)}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* EMI Calculator Modal */}
      {showEMICalculator && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">EMI Calculator</h3>
              <button
                onClick={() => setShowEMICalculator(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="text-center py-8">
              <p className="text-gray-500">EMI calculator coming soon!</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ScooterDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center text-sm">
            <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="mx-2">›</div>
            <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="mx-2">›</div>
            <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="w-3/4 h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="w-1/2 h-4 bg-gray-200 rounded animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
              <div className="aspect-video bg-gray-200 animate-pulse"></div>
              <div className="flex p-4 space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-16 h-16 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm">
              <div className="flex border-b">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-24 h-12 bg-gray-200 animate-pulse mx-2 my-2"></div>
                ))}
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="w-full h-4 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="w-24 h-6 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="w-full h-20 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="space-y-3">
                <div className="w-full h-12 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-full h-12 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-full h-12 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}