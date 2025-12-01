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
  FiArrowRight,
  FiShoppingCart
} from 'react-icons/fi';
import SimilarBikesSection from '@/components/bikes/SimilarBikesSection';
import WishlistButton from '@/components/common/WishlistButton';
import LeadFormPopup from '@/components/bikes/LeadFormPopup';
import ReviewsAndRatingsSection from '@/components/bikes/ReviewsAndRatingsSection';
import { useAuth } from '@/context/AuthContext.supabase';
import { useRouter } from 'next/navigation';

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
  similarModels?: SimilarModel[];
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
  const { slug } = useParams() as { slug: string }; // slug is now variant_id
  const { user } = useAuth();
  const router = useRouter();
  const [bike, setBike] = useState<BikeDetails | null>(null);
  const [similarModels, setSimilarModels] = useState<SimilarModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState('specs');

  const [showEMICalculator, setShowEMICalculator] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadFormType, setLeadFormType] = useState<'get_on_road_price' | 'book_test_ride'>('get_on_road_price');
  const [addingToOrders, setAddingToOrders] = useState(false);
  const [isInOrders, setIsInOrders] = useState(false);
  const [userOrderId, setUserOrderId] = useState<string | null>(null);

  // Get images for the currently selected variant
  const getCurrentVariantImages = () => {
    if (!bike || !bike.variants) return [];
    
    const currentVariant = bike.variants.find(v => v.id === bike.id) || bike.variants[0];
    const variantName = currentVariant?.name?.toLowerCase() || '';
    
    // Try to match images based on variant name patterns
    // This is a more intelligent approach until we have proper variant-image mapping
    if (bike.images && bike.images.length > 0) {
      // Look for images that might match the current variant
      const potentialMatches = bike.images.filter(img => {
        const imgAlt = (img.alt || '').toLowerCase();
        const imgUrl = (img.url || '').toLowerCase();
        
        // Check if image alt text or URL contains variant-specific terms
        return (
          imgAlt.includes(variantName) ||
          imgUrl.includes(variantName) ||
          (variantName.includes('h2 r') && (imgAlt.includes('h2') || imgUrl.includes('h2'))) ||
          (variantName.includes('h2') && (imgAlt.includes('h2') || imgUrl.includes('h2'))) ||
          (variantName.includes('300') && (imgAlt.includes('300') || imgUrl.includes('300'))) ||
          (variantName.includes('400') && (imgAlt.includes('400') || imgUrl.includes('400'))) ||
          (variantName.includes('650') && (imgAlt.includes('650') || imgUrl.includes('650'))) ||
          (variantName.includes('1000') && (imgAlt.includes('1000') || imgUrl.includes('1000'))) ||
          (variantName.includes('zx') && (imgAlt.includes('zx') || imgUrl.includes('zx')))
        );
      });
      
      // If we found specific matches, use them; otherwise use the first image
      return potentialMatches.length > 0 ? potentialMatches.slice(0, 1) : bike.images.slice(0, 1);
    }
    
    return [];
  };
  
  // Fetch bike details
  useEffect(() => {
    const fetchBikeDetails = async () => {
      try {
        const response = await fetch(`/api/bikes/${slug}`);
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

  // Check if bike is already in user's orders
  useEffect(() => {
    const checkIfInOrders = async () => {
      if (!user || !bike) return;

      try {
        const response = await fetch(`/api/user-orders?user_id=${user.id}`);
        const result = await response.json();

        if (response.ok && result.success) {
          const currentVariant = bike.variants?.find(v => v.id === bike.id);
          const existingOrder = result.orders.find((order: any) => 
            order.variant_id === parseInt(currentVariant?.id || '0')
          );

          setIsInOrders(!!existingOrder);
        } else {
          setIsInOrders(false);
        }
      } catch (error) {
        console.error('Error checking orders:', error);
        setIsInOrders(false);
      }
    };

    checkIfInOrders();
  }, [user, bike]);

  // Handle add to orders
  const handleAddToOrders = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!bike || !bike.variants || bike.variants.length === 0) {
      alert('No variant information available');
      return;
    }

    const variant = bike.variants?.find(v => v.id === bike.id) || bike.variants?.[0];

    if (!variant) {
      alert('Variant information not available');
      return;
    }
    setAddingToOrders(true);

    try {
      if (isInOrders) {
        // Remove from orders
        const response = await fetch('/api/user-orders', {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: user.id,
            variant_id: variant.id
          }),
        });

        const result = await response.json();

        if (response.ok && result.success) {
          setIsInOrders(false);
          alert('Successfully removed from your orders!');
        } else {
          alert(result.error || 'Failed to remove from orders. Please try again.');
        }
      } else {
        // Add to orders
        const variantImages = getCurrentVariantImages();
        const response = await fetch('/api/user-orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            variant_id: variant.id,
            bike_name: bike.name,
            variant_name: variant.name,
            price: variant.price,
            brand_name: bike.brand?.name || '',
            image_url: variantImages?.[0]?.url || bike.images?.[0]?.url || null,
            user_id: user.id
          }),
        });

        const result = await response.json();

        if (response.ok && result.success) {
          setIsInOrders(true);
          alert('Successfully added to your orders!');
        } else {
          alert(result.error || 'Failed to add to orders. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error handling orders:', error);
      alert('Network error. Please check your connection and try again.');
    } finally {
      setAddingToOrders(false);
    }
  };

  // Handle get on road price
  const handleGetOnRoadPrice = () => {
    setLeadFormType('get_on_road_price');
    setShowLeadForm(true);
  };

  // Handle book test ride
  const handleBookTestRide = () => {
    setLeadFormType('book_test_ride');
    setShowLeadForm(true);
  };  if (loading) {
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
            <span className="text-gray-900">{bike.variants?.find(v => v.id === bike.id)?.name || bike.name}</span>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {bike.variants?.find(v => v.id === bike.id)?.name || bike.name}
              </h1>
              {bike.variants && bike.variants.length > 1 && (
                <p className="mt-1 text-sm text-gray-500">
                  {bike.variants.length} variants available - <span className="text-primary">click below to switch</span>
                </p>
              )}
            </div>
            <WishlistButton 
              bike={{
                id: bike.id,
                name: bike.name,
                slug: bike.slug,
                image: getCurrentVariantImages()?.[0]?.url || bike.images?.[0]?.url,
                price: bike.variants?.find(v => v.id === bike.id)?.price || bike.variants?.[0]?.price,
                brand: bike.brand
              }}
              variant="button"
              showText={true}
            />
          </div>
          
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
                {(() => {
                  const currentImages = getCurrentVariantImages();
                  const currentVariant = bike.variants?.find(v => v.id === bike.id);
                  
                  return currentImages && currentImages.length > 0 ? (
                    <Image
                      src={currentImages[Math.min(activeImage, currentImages.length - 1)].url}
                      alt={`${bike.name} - ${currentVariant?.name || 'Unknown Variant'}`}
                      fill
                      className="object-contain"
                    />
                  ) : (
                    <Image
                      src="/demo.avif"
                      alt={`${bike.name} - ${currentVariant?.name || 'Unknown Variant'}`}
                      fill
                      className="object-contain"
                    />
                  );
                })()}
              </div>
              
              {/* Thumbnails - Only show if there are multiple images for current variant */}
              {(() => {
                const currentImages = getCurrentVariantImages();
                return currentImages && currentImages.length > 1 && (
                  <div className="flex p-4 space-x-2 overflow-x-auto">
                    {currentImages.map((image, index) => (
                      <button
                        key={image.id}
                        onClick={() => setActiveImage(index)}
                        className={`relative w-16 h-16 border rounded-md overflow-hidden ${
                          index === activeImage ? 'border-primary' : 'border-gray-200'
                        }`}
                      >
                        <Image
                          src={image.url}
                          alt={image.alt || `${bike.name} - ${bike.variants?.find(v => v.id === bike.id)?.name} image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                );
              })()}
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
                        !['engine', 'mileage', 'dimensions', 'transmission', 'chassis', 'general'].includes(category)
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
                  {bike.variants.map((variant, index) => {
                    const isCurrentVariant = variant.id === bike.id;
                    
                    return (
                      <div 
                        key={variant.id} 
                        className={`flex justify-between p-3 border rounded-md cursor-pointer transition-all hover:bg-gray-50 ${
                          isCurrentVariant
                            ? 'border-primary bg-primary-50 shadow-sm' 
                            : 'border-gray-200'
                        }`}
                        onClick={() => {
                          // Navigate to the specific variant page using variant ID
                          if (!isCurrentVariant) {
                            router.push(`/bikes/${variant.id}`);
                          }
                        }}
                      >
                        <span className={`font-medium ${
                          isCurrentVariant ? 'text-primary' : 'text-gray-700'
                        }`}>
                          {variant.name}
                        </span>
                        <span className={`font-bold ${
                          isCurrentVariant ? 'text-primary' : 'text-gray-900'
                        }`}>
                          ₹ {variant.price.toLocaleString('en-IN')}
                        </span>
                      </div>
                    );
                  })}
                  
                  <p className="mt-2 text-xs text-gray-500">
                    *Ex-showroom price. May vary based on location. Click to view details.
                  </p>
                </div>
              ) : (
                <p className="mt-2 text-gray-500">Price information not available</p>
              )}
              
              <div className="flex flex-col gap-2 mt-4">
                <button 
                  onClick={handleAddToOrders}
                  disabled={addingToOrders}
                  className={`flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                    isInOrders 
                      ? 'text-white bg-red-600 hover:bg-red-700' 
                      : 'text-white bg-green-600 hover:bg-green-700'
                  }`}
                >
                  <FiShoppingCart className="mr-2" size={16} />
                  {addingToOrders 
                    ? (isInOrders ? 'Removing...' : 'Adding...') 
                    : (isInOrders ? 'Remove from Orders' : 'Add to Orders')
                  }
                </button>
                <button 
                  onClick={handleGetOnRoadPrice}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-600"
                >
                  Get On Road Price
                </button>
                <button 
                  onClick={handleBookTestRide}
                  className="px-4 py-2 text-sm font-medium border border-primary text-primary rounded-md hover:bg-primary-50"
                >
                  Book Test Ride
                </button>
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
                    Calculate your monthly EMI for {bike.variants?.find(v => v.id === bike.id)?.name || bike.name}
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Ex-showroom Price:</span>
                      <span className="font-semibold">₹{(bike.variants?.find(v => v.id === bike.id)?.price || bike.variants?.[0]?.price || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimated EMI (5 years):</span>
                      <span className="font-semibold text-green-600">
                        ₹{Math.round((bike.variants?.find(v => v.id === bike.id)?.price || bike.variants?.[0]?.price || 0) / 60).toLocaleString('en-IN')}/month
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
        <ReviewsAndRatingsSection 
          bike={bike} 
          currentVariantId={bike.variants?.find(v => v.id === bike.id)?.id || bike.variants?.[0]?.id} 
        />
        
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
        
        {/* Lead Form Popup */}
        {bike && bike.variants && bike.variants.length > 0 && (
          <LeadFormPopup
            isOpen={showLeadForm}
            onClose={() => setShowLeadForm(false)}
            formType={leadFormType}
            bikeInfo={{
              bikeName: bike.name,
              variantName: bike.variants?.find(v => v.id === bike.id)?.name || '',
              variantId: parseInt(bike.variants?.find(v => v.id === bike.id)?.id || '0'),
              brandName: bike.brand?.name || ''
            }}
          />
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