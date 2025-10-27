import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    // Get the query parameters
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // Initialize Supabase client
    const supabase = createServerClient();

    // Fetch the brands with pagination
    const { data: brands, error } = await supabase
      .from('brands')
      .select('brand_id, brand_name, logo_url, country')
      .order('brand_name', { ascending: true })
      .range(offset, offset + Math.min(limit, 100) - 1);

    if (error) {
      throw error;
    }

    // Get total count for pagination
    const { count: totalCount, error: countError } = await supabase
      .from('brands')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      throw countError;
    }

    // Transform the data to match the expected format with actual model counts
    const formattedBrands = await Promise.all((brands || []).map(async (brand: any) => {
      // Get model count for each brand
      const { count: modelCount } = await supabase
        .from('models')
        .select('*', { count: 'exact', head: true })
        .eq('brand_id', brand.brand_id);

      // Clean brand name and generate proper slug
      const cleanBrandName = brand.brand_name.trim();
      const slug = cleanBrandName.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens

      return {
        id: brand.brand_id,
        name: cleanBrandName,
        slug: slug,
        logoUrl: brand.logo_url,
        country: brand.country,
        _count: {
          models: modelCount || 0
        }
      };
    }));

    // Return the response
    return successResponse({
      brands: formattedBrands,
      pagination: {
        totalCount,
        offset,
        limit,
      },
    });
  } catch (error) {
    console.error('Error fetching brands:', error);
    return errorResponse('Failed to fetch brands', 500);
  }
}