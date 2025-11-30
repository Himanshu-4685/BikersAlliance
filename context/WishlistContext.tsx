'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext.supabase';

interface WishlistItem {
  id: string;
  bike_id: string;
  bike_name: string;
  bike_image_url?: string;
  bike_price?: number;
  bike_slug: string;
  brand_name?: string;
  created_at: string;
}

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  addToWishlist: (item: Omit<WishlistItem, 'id' | 'created_at'>) => Promise<boolean>;
  removeFromWishlist: (bikeSlug: string) => Promise<boolean>;
  isInWishlist: (bikeSlug: string) => boolean;
  isLoading: boolean;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

// Local storage key for wishlist items
const WISHLIST_STORAGE_KEY = 'bikers-alliance-wishlist';

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Load wishlist from database/localStorage on component mount
  useEffect(() => {
    const loadWishlist = async () => {
      if (!user) {
        setWishlistItems([]);
        return;
      }

      setIsLoading(true);
      try {
        console.log('Loading wishlist for user:', user.email);
        
        // First try to fetch from database
        const response = await fetch('/api/wishlist');
        const data = await response.json();
        
        console.log('Wishlist API response:', data);
        
        if (response.ok && data.success) {
          setWishlistItems(data.data || []);
          console.log('Loaded wishlist items from database:', data.data?.length || 0);
          return;
        } else {
          console.log('Database fetch failed:', data.error);
        }
        
        // Fallback to localStorage
        const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          const userWishlist = parsed.filter((item: WishlistItem) => item.id.includes(user.email || user.id));
          setWishlistItems(userWishlist);
          console.log('Loaded wishlist items from localStorage:', userWishlist.length);
        } else {
          setWishlistItems([]);
        }
      } catch (error) {
        console.error('Error loading wishlist:', error);
        setWishlistItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadWishlist();
  }, [user]);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistItems));
    } catch (error) {
      console.error('Error saving wishlist to localStorage:', error);
    }
  }, [wishlistItems]);

  const addToWishlist = async (item: Omit<WishlistItem, 'id' | 'created_at'>): Promise<boolean> => {
    if (!user) {
      return false;
    }

    try {
      setIsLoading(true);

      // Check if item already exists
      const exists = wishlistItems.some(wishlistItem => wishlistItem.bike_slug === item.bike_slug);
      if (exists) {
        console.log('Item already exists in wishlist');
        return false;
      }

      console.log('Adding to wishlist:', item);

      // Try to add to database first
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });

      const data = await response.json();
      console.log('Add to wishlist response:', data);

      if (response.ok && data.success) {
        // Add to local state with proper formatting
        const newItem: WishlistItem = {
          id: data.data.id,
          bike_id: data.data.bike_id,
          bike_name: data.data.bike_name,
          bike_slug: data.data.bike_slug,
          bike_image_url: data.data.bike_image_url,
          bike_price: data.data.bike_price,
          brand_name: data.data.brand_name,
          created_at: data.data.created_at
        };
        
        setWishlistItems(prev => [...prev, newItem]);
        console.log('Successfully added to wishlist');
        return true;
      }

      // Fallback to localStorage
      const newItem: WishlistItem = {
        ...item,
        id: `${user.email || user.id}-${item.bike_slug}-${Date.now()}`,
        created_at: new Date().toISOString()
      };

      setWishlistItems(prev => [...prev, newItem]);
      console.log('Added to localStorage fallback');
      return true;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWishlist = async (bikeSlug: string): Promise<boolean> => {
    if (!user) {
      return false;
    }

    try {
      setIsLoading(true);

      // Find the item to get bike_id for API call
      const item = wishlistItems.find(item => item.bike_slug === bikeSlug);
      
      console.log('Removing from wishlist:', bikeSlug, item);
      
      // Try to remove from database first
      const response = await fetch(`/api/wishlist?bike_slug=${bikeSlug}&bike_id=${item?.bike_id || ''}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      console.log('Remove from wishlist response:', data);

      // Remove from local state regardless of API success (optimistic update)
      setWishlistItems(prev => prev.filter(item => item.bike_slug !== bikeSlug));

      if (!response.ok) {
        console.log('API call failed, but removed from local state');
      } else {
        console.log('Successfully removed from database');
      }

      return true;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      // Still remove from local state even if API fails
      setWishlistItems(prev => prev.filter(item => item.bike_slug !== bikeSlug));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const isInWishlist = (bikeSlug: string): boolean => {
    return wishlistItems.some(item => item.bike_slug === bikeSlug);
  };

  const value = {
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    isLoading,
    wishlistCount: wishlistItems.length
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}

export type { WishlistItem, WishlistContextType };