"use server";

import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(
  request: Request,
  { params }: { params: { type: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const bodyType = params.type;

    // Parse filter parameters
    const search = searchParams.get('search');
    const brand = searchParams.get('brand');
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
    const sortBy = searchParams.get('sortBy') || 'price';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 12;
    const offset = (page - 1) * limit;

    // Convert slug back to body type name (handle various cases)
    let bodyTypeName = bodyType.replace(/-/g, ' ');
    
    // Handle specific cases that might not match exactly
    const typeMapping: { [key: string]: string } = {
      'sports': 'Sports Bikes',
      'commuter': 'Commuter Bikes',
      'cruiser': 'Cruiser Bikes',
      'adventure': 'Adventure Tourer Bikes',
      'scooter': 'Scooter',  // Note: "Scooter" not "Scooter Bikes"
      'electric': 'Electric Bikes',
      'off road': 'Off Road Bikes',
      'off-road': 'Off Road Bikes',
      'naked': 'Naked Bikes',
      'super': 'Super Bikes',
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

    // Create display name (remove "Bikes" suffix if present for frontend display)
    const displayName = bodyTypeName.replace(/ Bikes$/, '');

    console.log('Searching for body type:', bodyTypeName);
    console.log('Display name:', displayName);

    const supabase = createServerClient();
    console.log('Supabase client created successfully');

    // Full query with all joins and filters
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
      .ilike('specs.body_type', `%${bodyTypeName}%`);

    // Apply search filter
    if (search) {
      query = query.or(`variant_name.ilike.%${search}%,models.model_name.ilike.%${search}%,brands.brand_name.ilike.%${search}%`);
    }

    // Apply brand filter
    if (brand) {
      query = query.eq('brands.brand_name', brand);
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

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: variants, error } = await query;

    console.log('Full query result:', { variants: variants?.length, error, bodyTypeName });

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    // Get total count for pagination using same query structure
    let countQuery = supabase
      .from('variants')
      .select(`
        variant_id,
        models!inner(model_name),
        brands!inner(brand_name),
        specs!inner(body_type)
      `, { count: 'exact', head: true })
      .ilike('specs.body_type', `%${bodyTypeName}%`);

    // Apply same search filter to count query
    if (search) {
      countQuery = countQuery.or(`variant_name.ilike.%${search}%,models.model_name.ilike.%${search}%,brands.brand_name.ilike.%${search}%`);
    }
    
    // Apply same brand filter to count query
    if (brand) {
      countQuery = countQuery.eq('brands.brand_name', brand);
    }
    
    // Apply same price filters to count query
    if (minPrice !== undefined) {
      countQuery = countQuery.gte('on_road_price', minPrice);
    }
    if (maxPrice !== undefined) {
      countQuery = countQuery.lte('on_road_price', maxPrice);
    }

    const { count: totalCount, error: countError } = await countQuery;

    if (countError) {
      console.error('Count query error:', countError);
      throw countError;
    }

    console.log('Variants found:', variants?.length);
    console.log('Total count:', totalCount);

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
        bodyType: variant.specs?.body_type || bodyTypeName,
        engine: variant.specs?.engine_type || 'Unknown Engine',
        displacement: variant.specs?.displacement || 'Unknown Displacement',
        power: variant.specs?.peak_power || 'Unknown Power',
        mileage: variant.specs?.city_mileage || variant.specs?.highway_mileage || 'Unknown Mileage'
      }
    }));

    return successResponse({
      bikes: formattedBikes,
      bodyType: {
        name: displayName,
        slug: bodyType
      },
      pagination: {
        total: totalCount || 0,
        page,
        limit,
        totalPages: Math.ceil((totalCount || 0) / limit)
      }
    });

  } catch (error) {
    console.error(`Error fetching bikes for body type ${params.type}:`, error);
    return errorResponse(`Failed to fetch bikes for body type: ${params.type}`, 500);
  }
}