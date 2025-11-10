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
    const bodyType = searchParams.get('bodyType');
    const engineType = searchParams.get('engineType');
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
    const minDisplacement = searchParams.get('minDisplacement') ? Number(searchParams.get('minDisplacement')) : undefined;
    const maxDisplacement = searchParams.get('maxDisplacement') ? Number(searchParams.get('maxDisplacement')) : undefined;
    const minMileage = searchParams.get('minMileage') ? Number(searchParams.get('minMileage')) : undefined;
    const sortBy = searchParams.get('sortBy') || 'price';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 12;
    const offset = (page - 1) * limit;

    // Initialize Supabase client
    const supabase = createServerClient();

    // Query variants with model, brand, and specs information
    let query = supabase
      .from('variants')
      .select(`
        variant_id,
        variant_name,
        on_road_price,
        model_id,
        brand_id,
        models!inner(model_name),
        brands!inner(brand_name, logo_url),
        specs!inner(engine_type, displacement, peak_power, city_mileage, body_type),
        images!left(url)
      `);

    // Apply search filter
    if (search) {
      query = query.or(`variant_name.ilike.%${search}%,models.model_name.ilike.%${search}%,brands.brand_name.ilike.%${search}%`);
    }

    // Apply brand filter
    if (brand) {
      // Look up brand by name or use directly if it's already a brand name
      const { data: brandData } = await supabase
        .from('brands')
        .select('brand_id')
        .ilike('brand_name', brand)
        .single();
        
      if (brandData) {
        console.log('Filtering by brand_id:', (brandData as any).brand_id);
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
          .ilike('model_name', model)
          .single();
          
        if (modelData) {
          console.log('Found model ID:', (modelData as any).model_id);
          query = query.eq('model_id', (modelData as any).model_id);
        } else {
          console.log('Model not found:', model);
        }
      }
    }

    // Apply body type filter
    if (bodyType) {
      console.log('Filtering by body type:', bodyType);
      
      // Simple approach - use the main pattern for each body type
      const bodyTypePatterns: Record<string, string> = {
        'commuter': 'commuter',
        'sports': 'sport',
        'cruiser': 'cruiser',
        'adventure': 'adventure',
        'scooter': 'scooter',
        'off-road': 'off',
        'electric': 'electric',
        'moped': 'moped',
        'naked': 'naked',
        'super': 'super',
        'tourer': 'tour',
        'touring': 'tour',
        'scrambler': 'scrambler',
        'street': 'street',
        'cafe-racer': 'cafe',
        'dirt': 'dirt',
        'roadster': 'roadster'
      };
      
      const pattern = bodyTypePatterns[bodyType.toLowerCase()] || bodyType;
      query = query.ilike('specs.body_type', `%${pattern}%`);
    }

    // Displacement filters
    if (minDisplacement !== undefined) {
      console.log('Filtering by min displacement:', minDisplacement);
      query = query.gte('specs.displacement', minDisplacement);
    }
    if (maxDisplacement !== undefined) {
      console.log('Filtering by max displacement:', maxDisplacement);
      query = query.lte('specs.displacement', maxDisplacement);
    }

    // Mileage filter
    if (minMileage !== undefined) {
      console.log('Filtering by min mileage:', minMileage);
      query = query.gte('specs.city_mileage', minMileage);
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

    // Get total count for pagination (apply same filters)
    let countQuery = supabase
      .from('variants')
      .select('variant_id', { count: 'exact', head: true });
      
    // Apply the same filters for counting
    if (search) {
      countQuery = countQuery.or(`variant_name.ilike.%${search}%,models.model_name.ilike.%${search}%,brands.brand_name.ilike.%${search}%`);
    }
    if (brand) {
      const { data: brandData } = await supabase
        .from('brands')
        .select('brand_id')
        .ilike('brand_name', brand)
        .single();
      if (brandData) {
        countQuery = countQuery.eq('brand_id', (brandData as any).brand_id);
      }
    }
    if (model) {
      if (model.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) || !isNaN(Number(model))) {
        countQuery = countQuery.eq('model_id', model);
      } else {
        const { data: modelData } = await supabase
          .from('models')
          .select('model_id')
          .ilike('model_name', model)
          .single();
        if (modelData) {
          countQuery = countQuery.eq('model_id', (modelData as any).model_id);
        }
      }
    }

    const { count: totalCount, error: countError } = await countQuery;

    if (countError) {
      throw countError;
    }

    // Helper function to format values with units
    const cleanAndFormatValue = (value: any, unit: string): string => {
      if (!value) return 'N/A';
      const stringValue = String(value).trim();
      if (!stringValue || stringValue === '0' || stringValue.toLowerCase() === 'n/a') return 'N/A';
      
      // If the value already contains the unit, return it as is
      if (stringValue.toLowerCase().includes(unit.toLowerCase())) {
        return stringValue;
      }
      
      // If it's just a number, add the unit
      const numericValue = parseFloat(stringValue);
      if (!isNaN(numericValue)) {
        return `${numericValue} ${unit}`;
      }
      
      // Fallback: return the value as is
      return stringValue;
    };

    // Format the response to match expected "bikes" structure
    const formattedBikes = (variants || []).map((variant: any) => {
      const isElectric = variant.specs?.engine_type === 'electric' || variant.specs?.body_type?.toLowerCase().includes('electric');
      
      return {
        id: variant.variant_id,
        name: `${variant.models?.model_name || 'Unknown'} ${variant.variant_name}`,
        slug: `${variant.models?.model_name || 'unknown'}-${variant.variant_name}`.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
        price: variant.on_road_price,
        image: variant.images?.[0]?.url || '/demo.avif',
        brand: {
          id: variant.brand_id,
          name: variant.brands?.brand_name || 'Unknown',
          slug: variant.brands?.brand_name?.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-') || 'unknown',
          logo: variant.brands?.logo_url
        },
        model: {
          id: variant.model_id,
          name: variant.models?.model_name || 'Unknown'
        },
        specs: {
          engine: isElectric ? 'Electric' : cleanAndFormatValue(variant.specs?.displacement, 'cc'),
          mileage: isElectric ? cleanAndFormatValue(variant.specs?.city_mileage, 'km') : cleanAndFormatValue(variant.specs?.city_mileage, 'kmpl'),
          power: isElectric ? cleanAndFormatValue(variant.specs?.peak_power, 'kW') : cleanAndFormatValue(variant.specs?.peak_power, 'PS'),
          displacement: cleanAndFormatValue(variant.specs?.displacement, 'cc'),
          engineType: variant.specs?.engine_type
        }
      };
    });

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