"use server";

import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse filter parameters
    const search = searchParams.get('search');
    const brand = searchParams.get('brand');
    const model = searchParams.get('model'); // Add model filter
    const engineType = searchParams.get('engineType');
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
    const sortBy = searchParams.get('sortBy') || 'price';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 12;
    const offset = (page - 1) * limit;

    // Initialize Supabase client
    const supabase = createServerClient();

    // Query variants with model and brand information
    let query = supabase
      .from('variants')
      .select(`
        variant_id,
        variant_name,
        on_road_price,
        model_id,
        brand_id,
        models!inner(model_name),
        brands!inner(brand_name),
        specs!inner(engine_type)
      `);

    // Apply search filter
    if (search) {
      query = query.or(`variant_name.ilike.%${search}%,models.model_name.ilike.%${search}%,brands.brand_name.ilike.%${search}%`);
    }

    // Apply brand filter
    if (brand) {
      // Look up brand by name
      const { data: brandData } = await supabase
        .from('brands')
        .select('brand_id')
        .eq('brand_name', brand)
        .single();
        
      if (brandData) {
        query = query.eq('brand_id', (brandData as any).brand_id);
      }
    }

    // Apply model filter
    if (model) {
      console.log('Filtering by model:', model);
      // Filter by model_id directly if it's a UUID or number, otherwise filter by model name
      if (model.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) || !isNaN(Number(model))) {
        // It's a UUID or number, filter by model_id
        console.log('Filtering by model_id:', model);
        query = query.eq('model_id', model);
      } else {
        // It's a model name, look up model by name
        console.log('Looking up model by name:', model);
        const { data: modelData } = await supabase
          .from('models')
          .select('model_id')
          .eq('model_name', model)
          .single();
          
        if (modelData) {
          console.log('Found model ID:', (modelData as any).model_id);
          query = query.eq('model_id', (modelData as any).model_id);
        } else {
          console.log('Model not found:', model);
        }
      }
    }

    // Price filters
    if (minPrice !== undefined) {
      query = query.gte('on_road_price', minPrice);
    }
    if (maxPrice !== undefined) {
      query = query.lte('on_road_price', maxPrice);
    }

    // Engine type filter
    if (engineType) {
      // Map the engine type slug to the pattern to search for
      const engineTypeMapping: { [key: string]: string } = {
        '4-stroke': '4-stroke',
        '2-stroke': '2-stroke',
        'electric': 'Electric',
        'single-cylinder': 'Single cylinder',
        'multi-cylinder': 'Multi'
      };
      
      const searchPattern = engineTypeMapping[engineType];
      if (searchPattern) {
        query = query.ilike('specs.engine_type', `%${searchPattern}%`);
      }
    }

    // Sorting
    const ascending = sortOrder === 'asc';
    switch (sortBy) {
      case 'price':
        query = query.order('on_road_price', { ascending });
        break;
      case 'name':
        query = query.order('variant_name', { ascending });
        break;
      default:
        query = query.order('on_road_price', { ascending: true });
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    // Execute the query
    const { data: variants, error } = await query;

    if (error) {
      throw error;
    }

    // Get total count for pagination
    const { count: totalCount, error: countError } = await supabase
      .from('variants')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      throw countError;
    }

    // Format the response to match expected "bikes" structure
    const formattedBikes = (variants || []).map((variant: any) => ({
      id: variant.variant_id,
      name: `${variant.models?.model_name || 'Unknown'} ${variant.variant_name}`,
      slug: `${variant.models?.model_name || 'unknown'}-${variant.variant_name}`.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
      price: variant.on_road_price,
      brand: {
        id: variant.brand_id,
        name: variant.brands?.brand_name || 'Unknown',
        slug: variant.brands?.brand_name?.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-') || 'unknown'
      },
      model: {
        id: variant.model_id,
        name: variant.models?.model_name || 'Unknown'
      }
    }));

    return successResponse({
      bikes: formattedBikes,
      pagination: {
        total: totalCount || 0,
        page,
        limit,
        totalPages: Math.ceil((totalCount || 0) / limit),
        hasNextPage: page * limit < (totalCount || 0),
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching bikes:', error);
    return errorResponse('Failed to fetch bikes', 500);
  }
}