import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    // Get the query parameters
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const bodyType = url.searchParams.get('bodyType');

    // Initialize Supabase client
    const supabase = createServerClient();

    let brandsQuery;
    
    if (bodyType) {
      // Convert slug back to body type name (handle various cases)
      let bodyTypeName = bodyType.replace(/-/g, ' ');
      
      // Handle specific cases that might not match exactly
      const typeMapping: { [key: string]: string } = {
        'sports': 'Sports Bikes',
        'commuter': 'Commuter Bikes',
        'cruiser': 'Cruiser Bikes',
        'adventure': 'Adventure Tourer Bikes',
        'scooter': 'Scooter',  
        'electric': 'Electric Bikes',
        'off road': 'Off Road Bikes',
        'off-road': 'Off Road Bikes',
        'naked': 'Naked Bikes',
        'super': 'Super Sports Bikes',
        'touring': 'Tourer Bikes',
        'tourer': 'Tourer Bikes',
        'sports naked': 'Sports Naked Bikes',
        'sports-naked': 'Sports Naked Bikes',
        'sports tourer': 'Sports Tourer Bikes',
        'sports-tourer': 'Sports Tourer Bikes',
        'scrambler': 'Scrambler Bikes',
        'street': 'Street Bikes',
        'cafe racer': 'Cafe Racer Bikes',
        'cafe-racer': 'Cafe Racer Bikes',
        'dirt': 'Dirt Bikes',
        'roadster': 'Roadster Bikes',
        'moped': 'Moped Bikes'
      };

      const normalizedType = bodyType.toLowerCase().replace(/-/g, ' ');
      bodyTypeName = typeMapping[normalizedType] || 
                     typeMapping[bodyType.toLowerCase()] || 
                     bodyType.charAt(0).toUpperCase() + bodyType.slice(1).replace(/-/g, ' ');

      // First get all distinct brand IDs that have this body type
      const { data: brandIds } = await supabase
        .from('variants')
        .select('models!inner(brand_id), specs!inner(body_type)')
        .ilike('specs.body_type', `%${bodyTypeName}%`);

      const uniqueBrandIds = Array.from(new Set(brandIds?.map((item: any) => item.models.brand_id) || []));

      if (uniqueBrandIds.length > 0) {
        // Fetch brands that have bikes of this body type
        brandsQuery = supabase
          .from('brands')
          .select('brand_id, brand_name, logo_url, country')
          .in('brand_id', uniqueBrandIds)
          .order('brand_name', { ascending: true });
      } else {
        // No brands found for this body type
        brandsQuery = supabase
          .from('brands')
          .select('brand_id, brand_name, logo_url, country')
          .eq('brand_id', 'no-brands-found'); // This will return empty result
      }
    } else {
      // Fetch all brands with pagination
      brandsQuery = supabase
        .from('brands')
        .select('brand_id, brand_name, logo_url, country')
        .order('brand_name', { ascending: true })
        .range(offset, offset + Math.min(limit, 100) - 1);
    }

    const { data: brands, error } = await brandsQuery;

    if (error) {
      throw error;
    }

    // Get total count for pagination
    let totalCount;
    if (bodyType) {
      // Count brands that have bikes of this body type
      const { count, error: countError } = await supabase
        .from('brands')
        .select('brand_id', { count: 'exact', head: true })
        .eq('models.variants.specs.body_type', bodyType);
      
      if (countError) {
        console.warn('Error counting brands for body type:', countError);
        totalCount = brands?.length || 0;
      } else {
        totalCount = count || 0;
      }
    } else {
      const { count, error: countError } = await supabase
        .from('brands')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        throw countError;
      }
      totalCount = count;
    }

    // Transform the data to match the expected format with actual model counts
    const formattedBrands = await Promise.all((brands || []).map(async (brand: any) => {
      let modelCount = 0;
      
      if (bodyType) {
        // Convert slug back to body type name for counting
        let bodyTypeName = bodyType.replace(/-/g, ' ');
        const typeMapping: { [key: string]: string } = {
          'sports': 'Sports Bikes',
          'commuter': 'Commuter Bikes',
          'cruiser': 'Cruiser Bikes',
          'adventure': 'Adventure Tourer Bikes',
          'scooter': 'Scooter',  
          'electric': 'Electric Bikes',
          'off road': 'Off Road Bikes',
          'off-road': 'Off Road Bikes',
          'naked': 'Naked Bikes',
          'super': 'Super Sports Bikes',
          'touring': 'Tourer Bikes',
          'tourer': 'Tourer Bikes',
          'sports naked': 'Sports Naked Bikes',
          'sports-naked': 'Sports Naked Bikes',
          'sports tourer': 'Sports Tourer Bikes',
          'sports-tourer': 'Sports Tourer Bikes',
          'scrambler': 'Scrambler Bikes',
          'street': 'Street Bikes',
          'cafe racer': 'Cafe Racer Bikes',
          'cafe-racer': 'Cafe Racer Bikes',
          'dirt': 'Dirt Bikes',
          'roadster': 'Roadster Bikes',
          'moped': 'Moped Bikes'
        };

        const normalizedType = bodyType.toLowerCase().replace(/-/g, ' ');
        bodyTypeName = typeMapping[normalizedType] || 
                       typeMapping[bodyType.toLowerCase()] || 
                       bodyType.charAt(0).toUpperCase() + bodyType.slice(1).replace(/-/g, ' ');

        // Count variants of this body type for this brand
        const { count } = await supabase
          .from('variants')
          .select('variant_id, models!inner(brand_id), specs!inner(body_type)', { count: 'exact', head: true })
          .eq('models.brand_id', brand.brand_id)
          .ilike('specs.body_type', `%${bodyTypeName}%`);
        
        modelCount = count || 0;
      } else {
        // Get model count for each brand
        const { count } = await supabase
          .from('models')
          .select('*', { count: 'exact', head: true })
          .eq('brand_id', brand.brand_id);
        
        modelCount = count || 0;
      }

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
        logo: brand.logo_url,
        count: modelCount || 0
      };
    }));

    // Filter out brands with 0 count when filtering by body type
    const filteredBrands = bodyType 
      ? formattedBrands.filter(brand => brand.count > 0)
      : formattedBrands;

    // Return the response
    return successResponse({
      brands: filteredBrands,
      pagination: {
        totalCount: filteredBrands.length,
        offset,
        limit,
      },
    });
  } catch (error) {
    console.error('Error fetching brands:', error);
    return errorResponse('Failed to fetch brands', 500);
  }
}