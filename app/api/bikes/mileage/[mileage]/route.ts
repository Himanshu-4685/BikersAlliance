"use server";

import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(
  request: Request,
  { params }: { params: { mileage: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const mileageSlug = params.mileage;

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

    // Define mileage ranges based on the slug
    const mileageRanges: { [key: string]: { min: number; max: number; label: string; description: string } } = {
      'under-30': { 
        min: 0, 
        max: 30, 
        label: 'Under 30 kmpl', 
        description: 'Under 30 kmpl' 
      },
      '30-40': { 
        min: 30, 
        max: 40, 
        label: '30-40 kmpl', 
        description: '30-40 kmpl' 
      },
      '40-50': { 
        min: 40, 
        max: 50, 
        label: '40-50 kmpl', 
        description: '40-50 kmpl' 
      },
      '50-60': { 
        min: 50, 
        max: 60, 
        label: '50-60 kmpl', 
        description: '50-60 kmpl' 
      },
      'above-60': { 
        min: 60, 
        max: 10000, 
        label: 'Above 60 kmpl', 
        description: 'Above 60 kmpl' 
      }
    };

    const mileageRange = mileageRanges[mileageSlug];
    if (!mileageRange) {
      return NextResponse.json(
        { error: `Invalid mileage range: ${mileageSlug}` },
        { status: 400 }
      );
    }

    console.log('Searching for mileage range:', mileageRange);

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

    // For debugging, let's first get all data without mileage filter
    console.log(`Mileage filter: ${mileageRange.min} <= mileage < ${mileageRange.max}`);

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

    // Log some mileage values to see the format
    if (allVariants && allVariants.length > 0) {
      console.log('Sample mileage values:');
      allVariants.slice(0, 5).forEach((variant: any, index) => {
        const cityMileage = variant.specs?.city_mileage;
        const hwMileage = variant.specs?.highway_mileage;
        console.log(`${index + 1}. ${variant.variant_name}: city_mileage = "${cityMileage}" (type: ${typeof cityMileage}), highway_mileage = "${hwMileage}" (type: ${typeof hwMileage})`);
      });
    }

    // Filter by mileage in JavaScript to handle string/number conversion
    const allFilteredVariants = allVariants?.filter((variant: any) => {
      const cityMileage = variant.specs?.city_mileage;
      const hwMileage = variant.specs?.highway_mileage;
      
      // Use city mileage first, then highway mileage as fallback
      let mileageValue = cityMileage || hwMileage;
      if (!mileageValue) return false;
      
      // Convert mileage to number for comparison
      let numericMileage = 0;
      if (typeof mileageValue === 'number') {
        numericMileage = mileageValue;
      } else if (typeof mileageValue === 'string') {
        // Extract numeric value from string like "45.2 kmpl" or "45 kmpl" or "45"
        const match = mileageValue.match(/(\d+(?:\.\d+)?)/);
        if (match) {
          numericMileage = parseFloat(match[1]);
        }
      }
      
      // Apply mileage filter
      if (mileageRange.max >= 10000) {
        // For "above" queries
        return numericMileage >= mileageRange.min;
      } else {
        // For range queries
        return numericMileage >= mileageRange.min && numericMileage < mileageRange.max;
      }
    }) || [];

    console.log('Variants after mileage filtering:', allFilteredVariants.length);

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
      mileage: {
        slug: mileageSlug,
        label: mileageRange.label,
        description: mileageRange.description,
        min: mileageRange.min,
        max: mileageRange.max
      },
      pagination: {
        total: totalCount || 0,
        page,
        limit,
        totalPages: Math.ceil((totalCount || 0) / limit)
      }
    });

  } catch (error) {
    console.error(`Error fetching bikes for mileage ${params.mileage}:`, error);
    return NextResponse.json(
      { error: `Failed to fetch bikes for mileage: ${params.mileage}` },
      { status: 500 }
    );
  }
}