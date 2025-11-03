"use server";

import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(
  request: Request,
  { params }: { params: { budget: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const budgetSlug = params.budget;

    // Parse filter parameters
    const search = searchParams.get('search');
    const brand = searchParams.get('brand');
    const bodyType = searchParams.get('bodyType');
    const engineType = searchParams.get('engineType');
    const sortBy = searchParams.get('sortBy') || 'price';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 12;
    const offset = (page - 1) * limit;

    // Define budget ranges based on the slug
    const budgetRanges: { [key: string]: { min: number; max: number; label: string; description: string } } = {
      'under-50k': { 
        min: 0, 
        max: 50000, 
        label: '₹50K', 
        description: 'Under ₹50,000' 
      },
      '50k-70k': { 
        min: 50000, 
        max: 70000, 
        label: '₹50-70K', 
        description: '₹50,000 - ₹70,000' 
      },
      '50000-70000': { // Support numeric format
        min: 50000, 
        max: 70000, 
        label: '₹50-70K', 
        description: '₹50,000 - ₹70,000' 
      },
      '70k-1l': { 
        min: 70000, 
        max: 100000, 
        label: '₹70K-1L', 
        description: '₹70,000 - ₹1 Lakh' 
      },
      '70000-100000': { // Support numeric format
        min: 70000, 
        max: 100000, 
        label: '₹70K-1L', 
        description: '₹70,000 - ₹1 Lakh' 
      },
      '1l-1.25l': { 
        min: 100000, 
        max: 125000, 
        label: '₹1-1.25L', 
        description: '₹1 Lakh - ₹1.25 Lakh' 
      },
      '100000-125000': { // Support numeric format
        min: 100000, 
        max: 125000, 
        label: '₹1-1.25L', 
        description: '₹1 Lakh - ₹1.25 Lakh' 
      },
      '1.25l-1.5l': { 
        min: 125000, 
        max: 150000, 
        label: '₹1.25-1.5L', 
        description: '₹1.25 Lakh - ₹1.5 Lakh' 
      },
      '125000-150000': { // Support numeric format
        min: 125000, 
        max: 150000, 
        label: '₹1.25-1.5L', 
        description: '₹1.25 Lakh - ₹1.5 Lakh' 
      },
      '1.5l-2l': { 
        min: 150000, 
        max: 200000, 
        label: '₹1.5-2L', 
        description: '₹1.5 Lakh - ₹2 Lakh' 
      },
      '150000-200000': { // Support numeric format
        min: 150000, 
        max: 200000, 
        label: '₹1.5-2L', 
        description: '₹1.5 Lakh - ₹2 Lakh' 
      },
      '2l-2.5l': { 
        min: 200000, 
        max: 250000, 
        label: '₹2-2.5L', 
        description: '₹2 Lakh - ₹2.5 Lakh' 
      },
      '200000-250000': { // Support numeric format
        min: 200000, 
        max: 250000, 
        label: '₹2-2.5L', 
        description: '₹2 Lakh - ₹2.5 Lakh' 
      },
      'above-2.5l': { 
        min: 250000, 
        max: 10000000, // Very high number for "above"
        label: '₹2.5L+', 
        description: 'Above ₹2.5 Lakh' 
      },
      'above-250000': { // Support numeric format
        min: 250000, 
        max: 10000000, // Very high number for "above"
        label: '₹2.5L+', 
        description: 'Above ₹2.5 Lakh' 
      }
    };

    const budgetRange = budgetRanges[budgetSlug];
    if (!budgetRange) {
      return NextResponse.json(
        { error: `Invalid budget range: ${budgetSlug}` },
        { status: 400 }
      );
    }

    console.log('Searching for budget range:', budgetRange);

    const supabase = createServerClient();
    console.log('Supabase client created successfully');

    // Build query with budget filters
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
      .gte('on_road_price', budgetRange.min)
      .lt('on_road_price', budgetRange.max);

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

    if (engineType) {
      query = query.ilike('specs.engine_type', `%${engineType}%`);
    }

    // Apply sorting
    const sortField = sortBy === 'name' ? 'variant_name' : 'on_road_price';
    query = query.order(sortField, { ascending: sortOrder === 'asc' });

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('variants')
      .select('*', { count: 'exact', head: true })
      .gte('on_road_price', budgetRange.min)
      .lt('on_road_price', budgetRange.max);

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: variants, error } = await query;

    console.log('Budget filter query result:', { variants: variants?.length, error, budgetRange });

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
      budget: {
        slug: budgetSlug,
        label: budgetRange.label,
        description: budgetRange.description,
        min: budgetRange.min,
        max: budgetRange.max
      },
      pagination: {
        total: totalCount || 0,
        page,
        limit,
        totalPages: Math.ceil((totalCount || 0) / limit)
      }
    });

  } catch (error) {
    console.error(`Error fetching bikes for budget ${params.budget}:`, error);
    return NextResponse.json(
      { error: `Failed to fetch bikes for budget: ${params.budget}` },
      { status: 500 }
    );
  }
}