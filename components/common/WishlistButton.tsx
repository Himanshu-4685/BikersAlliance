'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiHeart } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext.supabase';
import { useWishlist } from '@/context/WishlistContext';

interface WishlistButtonProps {
  bike: {
    id: string;
    name: string;
    slug?: string;
    image?: string;
    price?: number | string;
    brand?: {
      name: string;
    };
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  variant?: 'icon' | 'button';
}

export default function WishlistButton({ 
  bike, 
  className = '', 
  size = 'md',
  showText = false,
  variant = 'icon'
}: WishlistButtonProps) {
  const { user } = useAuth();
  const { addToWishlist, removeFromWishlist, isInWishlist, isLoading } = useWishlist();
  const [isAnimating, setIsAnimating] = useState(false);
  const router = useRouter();

  const bikeSlug = bike.slug || bike.id;
  const isWishlisted = isInWishlist(bikeSlug);

  // Size configurations
  const sizeClasses = {
    sm: 'w-6 h-6 text-sm',
    md: 'w-8 h-8 text-base',
    lg: 'w-10 h-10 text-lg'
  };

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 22
  };

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Redirect to login if not authenticated
    if (!user) {
      router.push('/login');
      return;
    }

    if (isLoading) return;

    setIsAnimating(true);

    try {
      if (isWishlisted) {
        await removeFromWishlist(bikeSlug);
      } else {
        const success = await addToWishlist({
          bike_id: bike.id,
          bike_name: bike.name,
          bike_slug: bikeSlug,
          bike_image_url: bike.image,
          bike_price: typeof bike.price === 'string' 
            ? parseFloat(bike.price.replace(/[^0-9.]/g, '')) 
            : bike.price,
          brand_name: bike.brand?.name
        });

        if (!success) {
          console.log('Item already in wishlist or failed to add');
        }
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }

    // Animation effect
    setTimeout(() => setIsAnimating(false), 300);
  };

  if (variant === 'button') {
    return (
      <button
        onClick={handleWishlistClick}
        disabled={isLoading}
        className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
          isWishlisted 
            ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100' 
            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      >
        <FiHeart 
          size={iconSizes[size]} 
          className={`transition-all duration-200 ${
            isWishlisted ? 'fill-current text-red-600' : ''
          } ${isAnimating ? 'scale-125' : ''}`}
        />
        {showText && (
          <span className="text-sm font-medium">
            {isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
          </span>
        )}
      </button>
    );
  }

  // Icon variant (default)
  return (
    <button
      onClick={handleWishlistClick}
      disabled={isLoading}
      className={`
        ${sizeClasses[size]}
        flex items-center justify-center rounded-full transition-all duration-200 
        ${isWishlisted 
          ? 'bg-red-50 text-red-600 hover:bg-red-100' 
          : 'bg-white bg-opacity-90 text-gray-600 hover:bg-opacity-100 hover:text-red-600'
        }
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
        shadow-sm border border-white border-opacity-50
        ${className}
      `}
      title={user ? (isWishlisted ? 'Remove from wishlist' : 'Add to wishlist') : 'Login to add to wishlist'}
    >
      <FiHeart 
        size={iconSizes[size]} 
        className={`transition-all duration-200 ${
          isWishlisted ? 'fill-current' : ''
        } ${isAnimating ? 'scale-125' : ''}`}
      />
      {showText && (
        <span className="ml-1 text-xs">
          {isLoading ? '...' : isWishlisted ? '❤️' : '🤍'}
        </span>
      )}
    </button>
  );
}