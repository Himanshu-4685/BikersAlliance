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

    // Transform the data to match the expected format
    const formattedBrands = brands.map(brand => ({
      id: brand.brand_id,
      name: brand.brand_name,
      slug: brand.brand_name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
      logoUrl: brand.logo_url,
      country: brand.country,
      _count: {
        models: 0 // Note: You'll need to implement a separate count query if needed
      }
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