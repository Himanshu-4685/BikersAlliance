import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const url = new URL(request.url);
    
    // Parse query parameters
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '12');
    const sortBy = url.searchParams.get('sortBy') || 'price';
    const sortOrder = url.searchParams.get('sortOrder') || 'asc';
    const minPrice = url.searchParams.get('minPrice') ? Number(url.searchParams.get('minPrice')) : undefined;
    const maxPrice = url.searchParams.get('maxPrice') ? Number(url.searchParams.get('maxPrice')) : undefined;
    const offset = (page - 1) * limit;

    // Initialize Supabase client
    const supabase = createServerClient();

    // Convert slug to brand name (reverse of slug generation)
    const brandName = slug.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');

    // First, fetch the brand information - search with LIKE for flexibility
    // Also handle brand names that might have whitespace/newlines
    const { data: brandData, error: brandError } = await supabase
      .from('brands')
      .select('brand_id, brand_name, logo_url, country')
      .ilike('brand_name', `%${brandName}%`)
      .single();

    if (brandError || !brandData) {
      return errorResponse('Brand not found', 404);
    }

    // TypeScript assertion: brandData is confirmed to exist at this point
    const brand = brandData as {
      brand_id: string;
      brand_name: string;
      logo_url: string;
      country: string;
    };

    // Clean the brand name for consistent display - remove any whitespace/newlines
    const cleanBrandName = brand.brand_name.trim().replace(/\s+/g, ' ');

    // Build the query for bikes/variants from this brand
    let query = supabase
      .from('variants')
      .select(`
        variant_id,
        variant_name,
        on_road_price,
        url,
        model_id,
        brand_id,
        models!inner(
          model_name
        ),
        brands!inner(
          brand_name,
          logo_url
        ),
        specs(
          displacement,
          peak_power,
          city_mileage,
          engine_type
        ),
        images(
          url,
          alt_text
        )
      `)
      .eq('brand_id', brand.brand_id);

    // Apply price filters
    if (minPrice !== undefined) {
      query = query.gte('on_road_price', minPrice);
    }
    if (maxPrice !== undefined) {
      query = query.lte('on_road_price', maxPrice);
    }

    // Apply sorting
    const sortColumn = sortBy === 'name' ? 'variant_name' : 'on_road_price';
    query = query.order(sortColumn, { ascending: sortOrder === 'asc' });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: variants, error: variantsError } = await query;

    if (variantsError) {
      throw variantsError;
    }

    // Get total count for pagination
    const { count: totalCount, error: countError } = await supabase
      .from('variants')
      .select('*', { count: 'exact', head: true })
      .eq('brand_id', brand.brand_id);

    if (countError) {
      throw countError;
    }

    // Format the bikes data
    const formattedBikes = (variants || []).map((variant: any) => {
      // Create slug from variant name if URL is missing
      const variantSlug = variant.url || variant.variant_name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();
      
      // Get the first image URL from the images array, or use default
      const imageUrl = variant.images && variant.images.length > 0 
        ? variant.images[0].url 
        : `/images/bikes/${variantSlug || 'default'}.avif`;
      
      return {
        variant_id: variant.variant_id,
        variant_name: variant.variant_name,
        on_road_price: variant.on_road_price,
        variant_url: variantSlug,
        brand_name: cleanBrandName,
        brand_logo: variant.brands.logo_url,
        model_name: variant.models.model_name,
        engine_type: variant.specs?.engine_type || 'N/A',
        bike_style: 'motorcycle', // Default since not in schema
        displacement: variant.specs?.displacement || 'N/A',
        peak_power: variant.specs?.peak_power || 'N/A',
        city_mileage: variant.specs?.city_mileage || 'N/A',
        image_url: imageUrl,
        images: variant.images || [], // Include all images for the variant
      };
    });

    // Get brand statistics
    const { data: modelCount } = await supabase
      .from('models')
      .select('*', { count: 'exact', head: true })
      .eq('brand_id', brand.brand_id);

    const brandInfo = {
      id: brand.brand_id,
      name: cleanBrandName,
      slug: slug,
      logoUrl: brand.logo_url,
      country: brand.country,
      stats: {
        totalModels: modelCount || 0,
        totalVariants: totalCount || 0,
        priceRange: formattedBikes.length > 0 ? {
          min: Math.min(...formattedBikes.map(b => b.on_road_price)),
          max: Math.max(...formattedBikes.map(b => b.on_road_price))
        } : { min: 0, max: 0 }
      }
    };

    return successResponse({
      brand: brandInfo,
      bikes: formattedBikes,
      pagination: {
        totalCount,
        currentPage: page,
        totalPages: Math.ceil((totalCount || 0) / limit),
        limit,
        hasNextPage: page * limit < (totalCount || 0),
        hasPrevPage: page > 1,
      },
    });

  } catch (error) {
    console.error('Error fetching brand bikes:', error);
    return errorResponse('Failed to fetch brand bikes', 500);
  }
}