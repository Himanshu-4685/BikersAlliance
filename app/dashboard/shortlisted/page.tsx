'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FiHeart, FiTrash2, FiChevronLeft, FiSettings, FiZap } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext.supabase';
import { useWishlist } from '@/context/WishlistContext';

export default function ShortlistedVehiclesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { wishlistItems, removeFromWishlist, isLoading: wishlistLoading } = useWishlist();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleRemoveFromWishlist = async (bikeSlug: string) => {
    try {
      await removeFromWishlist(bikeSlug);
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'Price not available';
    return `₹${price.toLocaleString()}`;
  };

  const cleanSlug = (slug: string) => {
    // Handle different slug patterns
    if (!slug) return slug;
    
    // If the slug starts with /bikes/, extract the last part (the variant slug)
    if (slug.startsWith('/bikes/')) {
      const pathParts = slug.split('/');
      return pathParts[pathParts.length - 1] || slug;
    }
    
    // For existing complex slugs, try to extract just the variant name
    // Handle patterns like "ducati-panigale-ducati-panigale-v4-s" where there are duplicates
    const parts = slug.split('-');
    
    if (parts.length > 4) {
      // Find the first duplicate brand/model name and take everything after it
      const seen = new Set();
      let duplicateIndex = -1;
      
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i].toLowerCase();
        if (seen.has(part) && !part.match(/^(v\d|r|s|pro|plus|bs\d|\d+)$/)) {
          duplicateIndex = i;
          break;
        }
        seen.add(part);
      }
      
      // If we found duplicates, take everything from the duplicate onwards
      if (duplicateIndex > 0) {
        return parts.slice(duplicateIndex).join('-');
      }
    }
    
    return slug;
  };

  // Show loading state while checking authentication or loading wishlist
  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-b-4 border-primary rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link 
            href="/dashboard" 
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <FiChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Shortlisted Vehicles</h1>
            <p className="text-gray-600">Your favorite bikes and scooters</p>
          </div>
        </div>

        {/* Wishlist Items */}
        {wishlistItems.length > 0 ? (
          <div className="space-y-4">
            {wishlistItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200">
                <div className="p-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Bike Image */}
                    <div className="flex-shrink-0 w-full md:w-48">
                      <Link href={`/bikes/${cleanSlug(item.bike_slug)}`}>
                        <div className="relative h-32 md:h-32 overflow-hidden bg-gray-100 rounded-lg">
                          <Image
                            src={item.bike_image_url || '/demo.avif'}
                            alt={item.bike_name}
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 768px) 100vw, 192px"
                            onError={(e) => {
                              const img = e.target as HTMLImageElement;
                              img.src = '/demo.avif';
                            }}
                          />
                        </div>
                      </Link>
                    </div>

                    {/* Bike Details */}
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <Link href={`/bikes/${cleanSlug(item.bike_slug)}`}>
                                <h3 className="font-semibold text-lg text-gray-900 hover:text-primary transition-colors">
                                  {item.bike_name}
                                </h3>
                              </Link>
                              {item.brand_name && (
                                <p className="text-sm text-gray-600">{item.brand_name}</p>
                              )}
                            </div>
                        
                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveFromWishlist(item.bike_slug)}
                          disabled={wishlistLoading}
                          className="flex items-center justify-center w-8 h-8 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
                          title="Remove from wishlist"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Price */}
                      <p className="text-lg font-bold text-gray-900 mb-3">
                        {formatPrice(item.bike_price)}
                      </p>

                      {/* Added Date */}
                      <p className="text-sm text-gray-500 mb-3">
                        Added on {new Date(item.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2">
                        <Link 
                          href={`/bikes/${cleanSlug(item.bike_slug)}`}
                          className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-dark transition-colors"
                        >
                          View Details
                        </Link>
                        <Link 
                          href={`/bikes/${cleanSlug(item.bike_slug)}#compare`}
                          className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors"
                        >
                          Compare
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-8 text-center">
              <div className="w-24 h-24 mx-auto mb-4 flex items-center justify-center bg-gray-100 rounded-full">
                <FiHeart className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Vehicles Shortlisted</h3>
              <p className="text-gray-600 mb-6">
                Start adding bikes to your wishlist to see them here. Browse our collection and click the heart icon on any bike you like.
              </p>
              <div className="space-y-3 sm:space-y-0 sm:space-x-3 sm:flex sm:justify-center">
                <Link 
                  href="/bikes"
                  className="inline-block px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary-dark transition-colors"
                >
                  Browse Bikes
                </Link>
                <Link 
                  href="/scooters"
                  className="inline-block px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors"
                >
                  Browse Scooters
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Summary Card */}
        {wishlistItems.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Wishlist Summary</h3>
                <p className="text-gray-600">
                  You have {wishlistItems.length} vehicle{wishlistItems.length !== 1 ? 's' : ''} in your wishlist
                </p>
              </div>
              <Link 
                href="/bikes"
                className="px-4 py-2 text-primary border border-primary rounded-md hover:bg-primary hover:text-white transition-colors"
              >
                Add More Vehicles
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}