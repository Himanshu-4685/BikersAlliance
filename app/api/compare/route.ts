import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { successResponse, errorResponse } from '@/lib/api-response';

// Type definitions for the API response
interface Brand {
  brand_name: string;
  logo_url: string;
}

interface Model {
  model_name: string;
}

interface Variant {
  variant_id: string;
  variant_name: string;
  on_road_price: number;
  url?: string;
  brands: Brand;
  models: Model;
}

interface Spec {
  variant_id: string;
  displacement?: string;
  peak_power?: string;
  city_mileage?: string;
  engine_type?: string;
  body_type?: string;
  [key: string]: any;
}

interface VariantImage {
  variant_id: string;
  url: string;
  alt_text?: string;
}

interface Review {
  variant_id: string;
  rating: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const variantIds = searchParams.get('variants')?.split(',') || [];

    if (variantIds.length === 0) {
      return errorResponse('At least one variant ID is required', 400);
    }

    if (variantIds.length > 4) {
      return errorResponse('Maximum 4 variants can be compared', 400);
    }

    // Initialize Supabase client
    const supabase = createServerClient();

    // Get basic variant information for comparison
    const { data: variants, error: variantsError } = await supabase
      .from('variants')
      .select(`
        variant_id,
        variant_name,
        on_road_price,
        url,
        brands!inner(
          brand_name,
          logo_url
        ),
        models!inner(
          model_name
        )
      `)
      .in('variant_id', variantIds);

    if (variantsError) {
      console.error('Error fetching variants:', variantsError);
      throw variantsError;
    }

    // Get specifications for all variants
    const { data: specs, error: specsError } = await supabase
      .from('specs')
      .select('*')
      .in('variant_id', variantIds);

    if (specsError) {
      console.error('Error fetching specs:', specsError);
      // Don't throw error for specs as they might not exist for all variants
    }

    // Get images for all variants
    const { data: images, error: imagesError } = await supabase
      .from('images')
      .select(`
        variant_id,
        url,
        alt_text
      `)
      .in('variant_id', variantIds);

    if (imagesError) {
      console.error('Error fetching images:', imagesError);
      // Don't throw error for images as they might not exist for all variants
    }

    // Get reviews summary for ratings
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('variant_id, rating')
      .in('variant_id', variantIds);

    if (reviewsError) {
      console.error('Error fetching reviews:', reviewsError);
      // Don't throw error for reviews as they might not exist for all variants
    }

    // Calculate average ratings
    const ratings: { [key: string]: { total: number; count: number } } = {};
    (reviews as Review[])?.forEach(review => {
      if (!ratings[review.variant_id]) {
        ratings[review.variant_id] = { total: 0, count: 0 };
      }
      ratings[review.variant_id].total += review.rating;
      ratings[review.variant_id].count += 1;
    });

    const averageRatings: { [key: string]: number } = {};
    Object.keys(ratings).forEach(variantId => {
      averageRatings[variantId] = parseFloat(
        (ratings[variantId].total / ratings[variantId].count).toFixed(1)
      );
    });

    // Combine all data
    const comparisonData = (variants as Variant[])?.map(variant => ({
      variant_id: variant.variant_id,
      variant_name: variant.variant_name,
      brand_name: variant.brands?.brand_name || '',
      model_name: variant.models?.model_name || '',
      on_road_price: variant.on_road_price,
      brand_logo: variant.brands?.logo_url || '/demo.avif',
      image_url: (images as VariantImage[])?.find(img => img.variant_id === variant.variant_id)?.url || '/demo.avif',
      variant_url: variant.url || variant.variant_id,
      specs: (specs as Spec[])?.find(s => s.variant_id === variant.variant_id) || {},
      images: (images as VariantImage[])?.filter(img => img.variant_id === variant.variant_id) || [],
      averageRating: averageRatings[variant.variant_id] || null,
      reviewCount: (reviews as Review[])?.filter(r => r.variant_id === variant.variant_id).length || 0,
      // Extract common specs for easy access
      displacement: (specs as Spec[])?.find(s => s.variant_id === variant.variant_id)?.displacement || 'N/A',
      peak_power: (specs as Spec[])?.find(s => s.variant_id === variant.variant_id)?.peak_power || 'N/A',
      city_mileage: (specs as Spec[])?.find(s => s.variant_id === variant.variant_id)?.city_mileage || 'N/A',
      engine_type: (specs as Spec[])?.find(s => s.variant_id === variant.variant_id)?.engine_type || 'N/A',
      body_type: (specs as Spec[])?.find(s => s.variant_id === variant.variant_id)?.body_type || 'N/A'
    })) || [];

    return successResponse({
      variants: comparisonData,
      totalCount: comparisonData.length
    });

  } catch (error) {
    console.error('Comparison error:', error);
    return errorResponse('Failed to fetch comparison data', 500);
  }
}