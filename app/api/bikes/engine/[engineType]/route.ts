"use server";

import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(
  request: Request,
  { params }: { params: { engineType: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const engineTypeSlug = params.engineType;

    // Parse filter parameters
    const search = searchParams.get('search');
    const brand = searchParams.get('brand');
    const bodyType = searchParams.get('bodyType');
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
    const minDisplacement = searchParams.get('minDisplacement') ? Number(searchParams.get('minDisplacement')) : undefined;
    const maxDisplacement = searchParams.get('maxDisplacement') ? Number(searchParams.get('maxDisplacement')) : undefined;
    const sortBy = searchParams.get('sortBy') || 'price';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 12;
    const offset = (page - 1) * limit;

    // Define engine types based on the slug
    const engineTypes: { [key: string]: { type: string; label: string; description: string } } = {
      '4-stroke': { 
        type: '4-stroke', 
        label: '4-Stroke Bikes', 
        description: '4-Stroke Engine Motorcycles' 
      },
      '2-stroke': { 
        type: '2-stroke', 
        label: '2-Stroke Bikes', 
        description: '2-Stroke Engine Motorcycles' 
      },
      'electric': { 
        type: 'Electric', 
        label: 'Electric Bikes', 
        description: 'Electric Motorcycles & Scooters' 
      },
      'single-cylinder': { 
        type: 'Single cylinder', 
        label: 'Single Cylinder Bikes', 
        description: 'Single Cylinder Engine Motorcycles' 
      },
      'multi-cylinder': { 
        type: 'Multi', 
        label: 'Multi Cylinder Bikes', 
        description: 'Multi Cylinder Engine Motorcycles' 
      }
    };

    const engineTypeConfig = engineTypes[engineTypeSlug];
    if (!engineTypeConfig) {
      return NextResponse.json(
        { error: `Invalid engine type: ${engineTypeSlug}` },
        { status: 400 }
      );
    }

    console.log('Searching for engine type:', engineTypeConfig);

    const supabase = createServerClient();
    console.log('Supabase client created successfully');

    // Build query with engine type filters
    let query = supabase
      .from('variants')
      .select(`
        variant_id,
        variant_name,
        on_road_price,
        url,
        models!inner(model_name),
        brands!inner(brand_name, logo_url),
        specs!inner(
          body_type,
          engine_type,
          displacement,
          peak_power,
          city_mileage,
          highway_mileage
        ),
        images(url, alt_text)
      `)
      .ilike('specs.engine_type', `%${engineTypeConfig.type}%`);

    // Apply additional filters
    if (search) {
      query = query.or(`variant_name.ilike.%${search}%,models.model_name.ilike.%${search}%,brands.brand_name.ilike.%${search}%`);
    }

    if (brand) {
      query = query.eq('brands.brand_name', brand);
    }

    if (bodyType) {
      query = query.ilike('specs.body_type', `%${bodyType}%`);
    }

    // Apply price filters
    if (minPrice !== undefined) {
      query = query.gte('on_road_price', minPrice);
    }
    if (maxPrice !== undefined) {
      query = query.lte('on_road_price', maxPrice);
    }

    // Apply displacement filters
    if (minDisplacement !== undefined) {
      query = query.gte('specs.displacement', minDisplacement);
    }
    if (maxDisplacement !== undefined) {
      query = query.lte('specs.displacement', maxDisplacement);
    }

    // Apply sorting
    const sortField = sortBy === 'name' ? 'variant_name' : 'on_road_price';
    query = query.order(sortField, { ascending: sortOrder === 'asc' });

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('variants')
      .select('*', { count: 'exact', head: true })
      .ilike('specs.engine_type', `%${engineTypeConfig.type}%`);

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: variants, error } = await query;

    console.log('Engine type filter query result:', { variants: variants?.length, error, engineTypeConfig });

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    console.log('Variants found:', variants?.length);

    // Format the response
    const formattedBikes = (variants || []).map((variant: any) => ({
      id: variant.variant_id,
      name: variant.variant_name,
      slug: variant.url || variant.variant_name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
      brand: {
        name: variant.brands?.brand_name || 'Unknown Brand',
        logo: variant.brands?.logo_url || null
      },
      model: variant.models?.model_name || 'Unknown Model',
      image: variant.images?.[0]?.url || null,
      price: variant.on_road_price,
      specs: {
        bodyType: variant.specs?.body_type || 'Unknown Type',
        engine: variant.specs?.engine_type || 'Unknown Engine',
        displacement: variant.specs?.displacement || 'Unknown Displacement',
        power: variant.specs?.peak_power || 'Unknown Power',
        mileage: variant.specs?.city_mileage || variant.specs?.highway_mileage || 'Unknown Mileage'
      }
    }));

    return NextResponse.json({
      bikes: formattedBikes,
      engineType: {
        slug: engineTypeSlug,
        type: engineTypeConfig.type,
        label: engineTypeConfig.label,
        description: engineTypeConfig.description
      },
      pagination: {
        total: totalCount || 0,
        page,
        limit,
        totalPages: Math.ceil((totalCount || 0) / limit)
      }
    });

  } catch (error) {
    console.error(`Error fetching bikes for engine type ${params.engineType}:`, error);
    return NextResponse.json(
      { error: `Failed to fetch bikes for engine type: ${params.engineType}` },
      { status: 500 }
    );
  }
}