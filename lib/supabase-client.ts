import { createClient as createClientBrowser } from '@/utils/supabase/client';
import { SupabaseClient } from '@supabase/supabase-js';

// Types for your database schema
export type Database = {
  public: {
    tables: {
      bikes: {
        Row: {
          id: string;
          name: string;
          brand_id: string;
          category_id: string;
          engine_capacity: number | null;
          price: number;
          mileage: number | null;
          description: string;
          specs: any;
          created_at: string;
          updated_at: string;
          slug: string;
          is_electric: boolean;
          image_url: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          brand_id: string;
          category_id: string;
          engine_capacity?: number | null;
          price: number;
          mileage?: number | null;
          description: string;
          specs?: any;
          created_at?: string;
          updated_at?: string;
          slug: string;
          is_electric: boolean;
          image_url?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          brand_id?: string;
          category_id?: string;
          engine_capacity?: number | null;
          price?: number;
          mileage?: number | null;
          description?: string;
          specs?: any;
          created_at?: string;
          updated_at?: string;
          slug?: string;
          is_electric?: boolean;
          image_url?: string | null;
        };
      };
      brands: {
        Row: {
          brand_id: string;
          brand_name: string;
          logo_url: string | null;
          country: string | null;
          description: string | null;
          created_at: string;
        };
        Insert: {
          brand_id?: string;
          brand_name: string;
          logo_url?: string | null;
          country?: string | null;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          brand_id?: string;
          brand_name?: string;
          logo_url?: string | null;
          country?: string | null;
          description?: string | null;
          created_at?: string;
        };
      };
      models: {
        Row: {
          model_id: number;
          brand_id: string;
          model_name: string | null;
        };
        Insert: {
          model_id?: number;
          brand_id: string;
          model_name?: string | null;
        };
        Update: {
          model_id?: number;
          brand_id?: string;
          model_name?: string | null;
        };
      };
      variants: {
        Row: {
          variant_id: number;
          model_id: number;
          brand_id: string;
          variant_name: string;
          on_road_price: number | null;
          created_at: string;
          url: string | null;
        };
        Insert: {
          variant_id?: number;
          model_id: number;
          brand_id: string;
          variant_name: string;
          on_road_price?: number | null;
          created_at?: string;
          url?: string | null;
        };
        Update: {
          variant_id?: number;
          model_id?: number;
          brand_id?: string;
          variant_name?: string;
          on_road_price?: number | null;
          created_at?: string;
          url?: string | null;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          created_at: string;
          updated_at: string;
          slug: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
          updated_at?: string;
          slug: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
          slug?: string;
        };
      };
      newsletter_subscriptions: {
        Row: {
          id: string;
          email: string;
          subscribed_at: string;
          status: 'active' | 'unsubscribed';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          subscribed_at?: string;
          status?: 'active' | 'unsubscribed';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          subscribed_at?: string;
          status?: 'active' | 'unsubscribed';
          created_at?: string;
          updated_at?: string;
        };
      };
      users: {
        Row: {
          user_id: string;
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id?: string;
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_orders: {
        Row: {
          id: string;
          user_id: string;
          variant_id: number;
          bike_name: string;
          variant_name: string;
          price: number;
          brand_name: string;
          image_url: string | null;
          status: 'pending' | 'confirmed' | 'cancelled';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          variant_id: number;
          bike_name: string;
          variant_name: string;
          price: number;
          brand_name: string;
          image_url?: string | null;
          status?: 'pending' | 'confirmed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          variant_id?: number;
          bike_name?: string;
          variant_name?: string;
          price?: number;
          brand_name?: string;
          image_url?: string | null;
          status?: 'pending' | 'confirmed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
      };
      leads: {
        Row: {
          id: string;
          name: string;
          phone: string;
          email: string;
          address: string;
          pincode: string;
          variant_id: number;
          bike_name: string;
          variant_name: string;
          brand_name: string;
          lead_type: 'get_on_road_price' | 'book_test_ride';
          status: 'new' | 'contacted' | 'qualified' | 'closed';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          phone: string;
          email: string;
          address: string;
          pincode: string;
          variant_id: number;
          bike_name: string;
          variant_name: string;
          brand_name: string;
          lead_type: 'get_on_road_price' | 'book_test_ride';
          status?: 'new' | 'contacted' | 'qualified' | 'closed';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          phone?: string;
          email?: string;
          address?: string;
          pincode?: string;
          variant_id?: number;
          bike_name?: string;
          variant_name?: string;
          brand_name?: string;
          lead_type?: 'get_on_road_price' | 'book_test_ride';
          status?: 'new' | 'contacted' | 'qualified' | 'closed';
          created_at?: string;
          updated_at?: string;
        };
      };
      news: {
        Row: {
          id: string;
          title: string;
          slug: string;
          excerpt: string | null;
          content: string | null;
          cover_image_url: string | null;
          author: string | null;
          published_at: string | null;
          created_at: string;
          updated_at: string;
          is_published: boolean;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          excerpt?: string | null;
          content?: string | null;
          cover_image_url?: string | null;
          author?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
          is_published?: boolean;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          excerpt?: string | null;
          content?: string | null;
          cover_image_url?: string | null;
          author?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
          is_published?: boolean;
        };
      };
      videos: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string | null;
          video_url: string | null;
          thumbnail_url: string | null;
          source: string | null;
          published_at: string | null;
          created_at: string;
          updated_at: string;
          is_published: boolean;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          description?: string | null;
          video_url?: string | null;
          thumbnail_url?: string | null;
          source?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
          is_published?: boolean;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          description?: string | null;
          video_url?: string | null;
          thumbnail_url?: string | null;
          source?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
          is_published?: boolean;
        };
      };
      web_stories: {
        Row: {
          id: string;
          title: string;
          slug: string;
          cover_image_url: string | null;
          pages: any;
          author: string | null;
          published_at: string | null;
          created_at: string;
          updated_at: string;
          is_published: boolean;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          cover_image_url?: string | null;
          pages?: any;
          author?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
          is_published?: boolean;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          cover_image_url?: string | null;
          pages?: any;
          author?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
          is_published?: boolean;
        };
      };
      reviews: {
        Row: {
          review_id: number;
          variant_id: number;
          user_id: string;
          rating: number;
          title: string | null;
          body: string;
          created_at: string;
        };
        Insert: {
          review_id?: number;
          variant_id: number;
          user_id: string;
          rating: number;
          title?: string | null;
          body: string;
          created_at?: string;
        };
        Update: {
          review_id?: number;
          variant_id?: number;
          user_id?: string;
          rating?: number;
          title?: string | null;
          body?: string;
          created_at?: string;
        };
      };
      admin: {
        Row: {
          id: number;
          email: string;
          name: string;
          password_hash: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          email: string;
          name: string;
          password_hash: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          email?: string;
          name?: string;
          password_hash?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    views: {
      [_ in never]: never;
    };
    functions: {
      [_ in never]: never;
    };
    enums: {
      [_ in never]: never;
    };
  };
};

// Export typed Supabase client
export type TypedSupabaseClient = SupabaseClient<Database>;

// Client-side Supabase instance (for use in browser)
export const createClient = () => {
  return createClientBrowser() as TypedSupabaseClient;
};

// Storage helpers
export const storage = {
  // Upload a file to Supabase Storage
  uploadFile: async (bucket: string, filePath: string, file: File) => {
    const supabase = createClient();
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });
    
    if (error) throw error;
    return data;
  },

  // Get a public URL for a file
  getPublicUrl: (bucket: string, filePath: string) => {
    const supabase = createClient();
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
  },

  // Delete a file
  deleteFile: async (bucket: string, filePath: string) => {
    const supabase = createClient();
    const { error } = await supabase.storage.from(bucket).remove([filePath]);
    if (error) throw error;
    return true;
  },
};