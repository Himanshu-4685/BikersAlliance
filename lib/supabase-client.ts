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
          id: string;
          name: string;
          logo_url: string | null;
          created_at: string;
          updated_at: string;
          slug: string;
        };
        Insert: {
          id?: string;
          name: string;
          logo_url?: string | null;
          created_at?: string;
          updated_at?: string;
          slug: string;
        };
        Update: {
          id?: string;
          name?: string;
          logo_url?: string | null;
          created_at?: string;
          updated_at?: string;
          slug?: string;
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
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
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