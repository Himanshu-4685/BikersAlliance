"use server";

import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(
  request: Request,
  { params }: { params: { displacement: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const displacementSlug = params.displacement;

    // Parse filter parameters
    const search = searchParams.get('search');
    const brand = searchParams.get('brand');
    const bodyType = searchParams.get('bodyType');
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
    const sortBy = searchParams.get('sortBy') || 'price';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 12;
    const offset = (page - 1) * limit;

    // Define displacement ranges based on the slug
    const displacementRanges: { [key: string]: { min: number; max: number; label: string; description: string } } = {
      'under-100cc': { 
        min: 0, 
        max: 100, 
        label: 'Under 100cc', 
        description: 'Under 100cc' 
      },
      'under-125cc': { 
        min: 0, 
        max: 125, 
        label: 'Under 125cc', 
        description: 'Under 125cc' 
      },
      '100cc-125cc': { 
        min: 100, 
        max: 125, 
        label: '100-125cc', 
        description: '100cc - 125cc' 
      },
      '125cc-150cc': { 
        min: 125, 
        max: 150, 
        label: '125-150cc', 
        description: '125cc - 150cc' 
      },
      '150cc-200cc': { 
        min: 150, 
        max: 200, 
        label: '150-200cc', 
        description: '150cc - 200cc' 
      },
      '200cc-250cc': { 
        min: 200, 
        max: 250, 
        label: '200-250cc', 
        description: '200cc - 250cc' 
      },
      '250cc-300cc': { 
        min: 250, 
        max: 300, 
        label: '250-300cc', 
        description: '250cc - 300cc' 
      },
      '300cc-400cc': { 
        min: 300, 
        max: 400, 
        label: '300-400cc', 
        description: '300cc - 400cc' 
      },
      '300cc-500cc': { 
        min: 300, 
        max: 500, 
        label: '300-500cc', 
        description: '300cc - 500cc' 
      },
      '400cc-500cc': { 
        min: 400, 
        max: 500, 
        label: '400-500cc', 
        description: '400cc - 500cc' 
      },
      '500cc-750cc': { 
        min: 500, 
        max: 750, 
        label: '500-750cc', 
        description: '500cc - 750cc' 
      },
      'above-500cc': { 
        min: 500, 
        max: 10000, 
        label: 'Above 500cc', 
        description: 'Above 500cc' 
      },
      '750cc-1000cc': { 
        min: 750, 
        max: 1000, 
        label: '750-1000cc', 
        description: '750cc - 1000cc' 
      },
      'above-1000cc': { 
        min: 1000, 
        max: 10000, // Very high number for "above"
        label: 'Above 1000cc', 
        description: 'Above 1000cc' 
      },
      // Additional common displacement format support
      'under-100': { 
        min: 0, 
        max: 100, 
        label: 'Under 100cc', 
        description: 'Under 100cc' 
      },
      'under-125': { 
        min: 0, 
        max: 125, 
        label: 'Under 125cc', 
        description: 'Under 125cc' 
      },
      '100-125': { 
        min: 100, 
        max: 125, 
        label: '100-125cc', 
        description: '100cc - 125cc' 
      },
      '125-150': { 
        min: 125, 
        max: 150, 
        label: '125-150cc', 
        description: '125cc - 150cc' 
      },
      '150-200': { 
        min: 150, 
        max: 200, 
        label: '150-200cc', 
        description: '150cc - 200cc' 
      },
      '200-250': { 
        min: 200, 
        max: 250, 
        label: '200-250cc', 
        description: '200cc - 250cc' 
      },
      '250-300': { 
        min: 250, 
        max: 300, 
        label: '250-300cc', 
        description: '250cc - 300cc' 
      },
      '300-400': { 
        min: 300, 
        max: 400, 
        label: '300-400cc', 
        description: '300cc - 400cc' 
      },
      '300-500': { 
        min: 300, 
        max: 500, 
        label: '300-500cc', 
        description: '300cc - 500cc' 
      },
      '400-500': { 
        min: 400, 
        max: 500, 
        label: '400-500cc', 
        description: '400cc - 500cc' 
      },
      '500-750': { 
        min: 500, 
        max: 750, 
        label: '500-750cc', 
        description: '500cc - 750cc' 
      },
      'above-500': { 
        min: 500, 
        max: 10000, 
        label: 'Above 500cc', 
        description: 'Above 500cc' 
      },
      '750-1000': { 
        min: 750, 
        max: 1000, 
        label: '750-1000cc', 
        description: '750cc - 1000cc' 
      },
      'above-1000': { 
        min: 1000, 
        max: 10000, 
        label: 'Above 1000cc', 
        description: 'Above 1000cc' 
      }
    };

    const displacementRange = displacementRanges[displacementSlug];
    if (!displacementRange) {
      return NextResponse.json(
        { error: `Invalid displacement range: ${displacementSlug}` },
        { status: 400 }
      );
    }

    console.log('Searching for displacement range:', displacementRange);

    const supabase = createServerClient();
    console.log('Supabase client created successfully');

    // First, let's try to get all data and filter in JavaScript to debug
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
      `);

    // For debugging, let's first get all data without displacement filter
    console.log(`Displacement filter: ${displacementRange.min} <= displacement < ${displacementRange.max}`);

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

    // Apply sorting
    const sortField = sortBy === 'name' ? 'variant_name' : 'on_road_price';
    query = query.order(sortField, { ascending: sortOrder === 'asc' });

    // Remove pagination limit initially to get all results for filtering
    // We'll apply pagination after JavaScript filtering
    const { data: allVariants, error } = await query;

    console.log('Total variants retrieved:', allVariants?.length);

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    // Log some displacement values to see the format
    if (allVariants && allVariants.length > 0) {
      console.log('Sample displacement values:');
      allVariants.slice(0, 5).forEach((variant: any, index) => {
        const displacement = variant.specs?.displacement;
        console.log(`${index + 1}. ${variant.variant_name}: displacement = "${displacement}" (type: ${typeof displacement})`);
      });
    }

    // Filter by displacement in JavaScript to handle string/number conversion
    const allFilteredVariants = allVariants?.filter((variant: any) => {
      const displacement = variant.specs?.displacement;
      if (!displacement) return false;
      
      // Convert displacement to number for comparison
      let numericDisplacement = 0;
      if (typeof displacement === 'number') {
        numericDisplacement = displacement;
      } else if (typeof displacement === 'string') {
        // Extract numeric value from string like "999.5 cc" or "999 cc" or "999"
        const match = displacement.match(/(\d+(?:\.\d+)?)/);
        if (match) {
          numericDisplacement = parseFloat(match[1]);
        }
      }
      
      // Apply displacement filter
      if (displacementRange.max >= 10000) {
        // For "above" queries
        return numericDisplacement >= displacementRange.min;
      } else {
        // For range queries
        return numericDisplacement >= displacementRange.min && numericDisplacement < displacementRange.max;
      }
    }) || [];

    console.log('Variants after displacement filtering:', allFilteredVariants.length);

    // Apply pagination to filtered results
    const totalCount = allFilteredVariants.length;
    const variants = allFilteredVariants.slice(offset, offset + limit);

    console.log(`Returning ${variants.length} variants from ${totalCount} total matches (page ${page})`);

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
      displacement: {
        slug: displacementSlug,
        label: displacementRange.label,
        description: displacementRange.description,
        min: displacementRange.min,
        max: displacementRange.max
      },
      pagination: {
        total: totalCount || 0,
        page,
        limit,
        totalPages: Math.ceil((totalCount || 0) / limit)
      }
    });

  } catch (error) {
    console.error(`Error fetching bikes for displacement ${params.displacement}:`, error);
    return NextResponse.json(
      { error: `Failed to fetch bikes for displacement: ${params.displacement}` },
      { status: 500 }
    );
  }
}