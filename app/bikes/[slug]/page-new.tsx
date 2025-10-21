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
  FiHeart,
  FiShare2,
  FiMapPin,
  FiPhone,
  FiStar
} from 'react-icons/fi';

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
    type: string;
  } | null;
  images: {
    id: string;
    url: string;
    defaultUrl: string;
    alt: string | null;
  }[];
  variants: {
    id: string;
    name: string;
    price: number;
    exShowroomPrice: number | null;
    imageUrl: string;
    defaultImageUrl: string;
    specifications: Record<string, Array<{ name: string; value: string }>>;
  }[];
  similarBikes: {
    id: string;
    name: string;
    slug: string;
    price: number;
    imageUrl: string;
    defaultImageUrl: string;
  }[];
  specifications: Record<string, Array<{ name: string; value: string }>>;
  rating?: {
    average: number | null;
    count: number;
  };
}

// Loading skeleton component
const BikeDetailsSkeleton = () => (
  <div className="bg-gray-50">
    <div className="container py-6">
      <div className="animate-pulse">
        <div className="h-4 bg-gray-300 rounded w-1/3 mb-6"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="h-96 bg-gray-300 rounded-lg mb-6"></div>
            <div className="h-8 bg-gray-300 rounded w-2/3 mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          </div>
          <div>
            <div className="h-64 bg-gray-300 rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function BikeDetailsPage() {
  const params = useParams();
  const slug = params?.slug as string;
  
  const [bike, setBike] = useState<BikeDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [imageError, setImageError] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchBikeDetails = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/bikes/${slug}`);
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch bike details');
        }
        
        if (result.success && result.data) {
          setBike(result.data);
          // Set default variant and image
          if (result.data.variants && result.data.variants.length > 0) {
            setSelectedVariant(result.data.variants[0].id);
            setSelectedImage(result.data.variants[0].imageUrl);
          }
        } else {
          throw new Error('Bike not found');
        }
      } catch (err) {
        console.error('Error fetching bike details:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchBikeDetails();
  }, [slug]);

  const handleImageError = (imageUrl: string) => {
    setImageError(prev => ({ ...prev, [imageUrl]: true }));
  };

  const getImageSrc = (imageUrl: string, defaultUrl: string) => {
    return imageError[imageUrl] ? defaultUrl : imageUrl;
  };

  if (loading) {
    return <BikeDetailsSkeleton />;
  }
  
  if (error || !bike) {
    return notFound();
  }

  const selectedVariantData = bike.variants.find(v => v.id === selectedVariant) || bike.variants[0];
  const currentImage = selectedImage || selectedVariantData?.imageUrl || '';

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Breadcrumbs */}
      <div className="bg-white border-b">
        <div className="container py-4">
          <div className="flex items-center text-sm text-gray-500">
            <Link href="/" className="hover:text-primary">Home</Link>
            <FiChevronRight className="mx-2" />
            <Link href="/bikes" className="hover:text-primary">Bikes</Link>
            <FiChevronRight className="mx-2" />
            <Link href={`/brands/${bike.brand.slug}`} className="hover:text-primary">
              {bike.brand.name}
            </Link>
            <FiChevronRight className="mx-2" />
            <span className="text-gray-900">{bike.name}</span>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column: Images and details */}
          <div className="lg:col-span-2">
            {/* Hero Image Section */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
              <div className="relative">
                {/* Main Image */}
                <div className="aspect-video bg-gray-100 relative">
                  <Image
                    src={getImageSrc(currentImage, selectedVariantData?.defaultImageUrl || '/images/bikes/default-bike.jpg')}
                    alt={bike.name}
                    fill
                    className="object-contain"
                    onError={() => handleImageError(currentImage)}
                    priority
                  />
                  
                  {/* Action buttons */}
                  <div className="absolute top-4 right-4 flex space-x-2">
                    <button className="p-2 bg-white/90 rounded-full hover:bg-white shadow-sm">
                      <FiHeart className="w-5 h-5 text-gray-600" />
                    </button>
                    <button className="p-2 bg-white/90 rounded-full hover:bg-white shadow-sm">
                      <FiShare2 className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Image thumbnails */}
                {bike.variants.length > 1 && (
                  <div className="p-4 border-t bg-gray-50">
                    <div className="flex space-x-2 overflow-x-auto">
                      {bike.variants.map((variant) => (
                        <button
                          key={variant.id}
                          onClick={() => {
                            setSelectedVariant(variant.id);
                            setSelectedImage(variant.imageUrl);
                          }}
                          className={`relative w-16 h-16 border-2 rounded-lg overflow-hidden flex-shrink-0 ${
                            selectedVariant === variant.id ? 'border-primary' : 'border-gray-200'
                          }`}
                        >
                          <Image
                            src={getImageSrc(variant.imageUrl, variant.defaultImageUrl)}
                            alt={variant.name}
                            fill
                            className="object-cover"
                            onError={() => handleImageError(variant.imageUrl)}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bike Details */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{bike.name}</h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    {bike.launchDate && (
                      <div className="flex items-center">
                        <FiCalendar className="w-4 h-4 mr-1" />
                        <span>Launched {new Date(bike.launchDate).getFullYear()}</span>
                      </div>
                    )}
                    {bike.category && (
                      <div className="flex items-center">
                        <FiTag className="w-4 h-4 mr-1" />
                        <span>{bike.category.name}</span>
                      </div>
                    )}
                  </div>
                </div>
                {bike.brand.logo && (
                  <div className="w-16 h-16 relative">
                    <Image
                      src={bike.brand.logo}
                      alt={bike.brand.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
              </div>

              {bike.description && (
                <div className="mb-6">
                  <p className="text-gray-600 leading-relaxed">{bike.description}</p>
                </div>
              )}

              {/* Key Specifications */}
              {selectedVariantData?.specifications && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Specifications</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(selectedVariantData.specifications).slice(0, 8).map(([category, specs]) => 
                      specs.slice(0, 2).map((spec, index) => (
                        <div key={`${category}-${index}`} className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-lg font-semibold text-gray-900">{spec.value}</div>
                          <div className="text-sm text-gray-600">{spec.name}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Detailed Specifications */}
            {bike.specifications && Object.keys(bike.specifications).length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Complete Specifications</h2>
                
                {Object.entries(bike.specifications).map(([category, specs]) => (
                  <div key={category} className="mb-6 last:mb-0">
                    <h3 className="text-lg font-medium text-gray-900 capitalize mb-4 pb-2 border-b">
                      {category} Specifications
                    </h3>
                    
                    <div className="overflow-hidden border rounded-lg">
                      <table className="w-full">
                        <tbody>
                          {specs.map((spec, index) => (
                            <tr 
                              key={spec.name}
                              className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                            >
                              <td className="px-4 py-3 font-medium text-gray-700 w-1/2">{spec.name}</td>
                              <td className="px-4 py-3 text-gray-600">{spec.value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right column: Pricing and actions */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Price & Variants</h2>
              
              {bike.variants && bike.variants.length > 0 && (
                <div className="space-y-3">
                  {bike.variants.map(variant => (
                    <div 
                      key={variant.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedVariant === variant.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedVariant(variant.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{variant.name}</h4>
                          {variant.exShowroomPrice && (
                            <p className="text-sm text-gray-500">
                              Ex-showroom: ₹{variant.exShowroomPrice.toLocaleString()}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">
                            ₹{variant.price.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">On-road price</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                <button className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-600 transition-colors">
                  Get On Road Price
                </button>
                <button className="w-full border border-primary text-primary py-3 px-4 rounded-lg font-medium hover:bg-primary/5 transition-colors">
                  Book Test Ride
                </button>
                <button className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                  Compare Bikes
                </button>
              </div>
            </div>

            {/* EMI Calculator */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">EMI Calculator</h3>
              <EMICalculator bikePrice={selectedVariantData?.price || 0} />
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Available Variants</span>
                  <span className="font-medium">{bike.variants.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Brand</span>
                  <span className="font-medium">{bike.brand.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Category</span>
                  <span className="font-medium">{bike.category?.name || 'N/A'}</span>
                </div>
                {bike.rating && bike.rating.count > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">User Rating</span>
                    <div className="flex items-center">
                      <FiStar className="w-4 h-4 text-yellow-400 mr-1" />
                      <span className="font-medium">{bike.rating.average}/5</span>
                      <span className="text-gray-500 text-sm ml-1">({bike.rating.count})</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Similar Bikes Section */}
        {bike.similarBikes && bike.similarBikes.length > 0 && (
          <div className="mt-12">
            <SimilarBikesSection 
              bikes={bike.similarBikes.map(similarBike => ({
                id: similarBike.id,
                name: similarBike.name,
                slug: similarBike.slug,
                price: similarBike.price,
                image: getImageSrc(similarBike.imageUrl, similarBike.defaultImageUrl)
              }))} 
            />
          </div>
        )}

        {/* Reviews Section */}
        <div className="mt-12">
          <ReviewsSection 
            reviews={[]} 
            averageRating={bike.rating?.average || 0} 
            totalReviews={bike.rating?.count || 0} 
          />
        </div>

        {/* Dealers Section */}
        <div className="mt-12">
          <DealersSection brandId={bike.brand.id} />
        </div>
      </div>
    </div>
  );
}