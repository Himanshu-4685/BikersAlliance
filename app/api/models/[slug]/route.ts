import { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/client';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api-response';

interface RouteContext {
  params: {
    slug: string;
  };
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { slug } = context.params;
    const supabase = createClient();

    // Get city for price information (optional)
    const url = new URL(request.url);
    const cityId = url.searchParams.get('cityId');

    // Find the model by slug (assuming we need to search by model_name as slug)
    const { data: model, error: modelError } = await supabase
      .from('models')
      .select(`
        model_id,
        model_name,
        brand_id
      `)
      .eq('model_name', slug)
      .single();

    if (modelError || !model) {
      return notFoundResponse('Model not found');
    }

    // Get brand information
    const { data: brand, error: brandError } = await supabase
      .from('brands')
      .select('brand_id, brand_name, logo_url')
      .eq('brand_id', model.brand_id)
      .single();

    if (brandError) {
      console.error('Error fetching brand:', brandError);
    }

    // Get variants for this model
    const { data: variants, error: variantsError } = await supabase
      .from('variants')
      .select(`
        variant_id,
        variant_name,
        on_road_price,
        created_at
      `)
      .eq('model_id', model.model_id);

    if (variantsError) {
      console.error('Error fetching variants:', variantsError);
    }

    // Get similar models from the same brand
    const { data: similarModels, error: similarError } = await supabase
      .from('models')
      .select(`
        model_id,
        model_name,
        brand_id,
        brands!inner(
          brand_name
        )
      `)
      .eq('brand_id', model.brand_id)
      .neq('model_id', model.model_id)
      .limit(4);

    if (similarError) {
      console.error('Error fetching similar models:', similarError);
    }

    // Return the response with all the data
    return successResponse({
      model: {
        id: model.model_id,
        name: model.model_name,
        slug: model.model_name,
        brand: brand ? {
          id: brand.brand_id,
          name: brand.brand_name,
          logoUrl: brand.logo_url,
        } : null,
        variants: variants || [],
        // Note: Add more fields as needed based on your database schema
        rating: {
          average: null, // You can implement reviews later
          count: 0,
        },
      },
      similarModels: similarModels || [],
    });
  } catch (error: any) {
    console.error('Error fetching model details:', error);
    return errorResponse('Failed to fetch model details', 500);
  }
}