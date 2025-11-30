import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'your-super-secret-admin-key';

// GET - List specifications with pagination and search
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    try {
      jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const offset = (page - 1) * limit;

    const supabase = createServerClient();

    let query = supabase
      .from('specs')
      .select(`
        variant_id,
        engine_type,
        displacement,
        max_torque,
        no_of_cylinders,
        cooling_system,
        valve_per_cylinder,
        starting,
        fuel_supply,
        clutch,
        ignition,
        gear_box,
        bore,
        stroke,
        compression_ratio,
        city_mileage,
        highway_mileage,
        body_type,
        zero_to_hundred,
        peak_power,
        transmission,
        other_features,
        variants!inner(
          variant_name,
          models!inner(
            model_name,
            brands!inner(
              brand_name
            )
          )
        )
      `);

    // Add search filter including variant names
    if (search) {
      // First get variant IDs that match the search term
      const { data: matchingVariants } = await supabase
        .from('variants')
        .select('variant_id, variant_name')
        .or(`variant_name.ilike.%${search}%`) as { data: Array<{variant_id: string, variant_name: string}> | null };
      
      const variantIds = matchingVariants?.map((v: any) => v.variant_id) || [];
      
      // Search in multiple fields using OR logic
      const searchTerm = `%${search}%`;
      let searchConditions = [
        `engine_type.ilike.${searchTerm}`,
        `displacement.ilike.${searchTerm}`,
        `max_torque.ilike.${searchTerm}`,
        `body_type.ilike.${searchTerm}`,
        `peak_power.ilike.${searchTerm}`,
        `transmission.ilike.${searchTerm}`
      ];
      
      // Add variant ID conditions if we found matching variants
      if (variantIds.length > 0) {
        searchConditions.push(`variant_id.in.(${variantIds.join(',')})`);
      }
      
      query = query.or(searchConditions.join(','));
    }

    // Get total count with same search logic
    let countQuery = supabase
      .from('specs')
      .select('*', { count: 'exact', head: true });
    
    if (search) {
      // Get variant IDs that match search for count query too
      const { data: matchingVariantsForCount } = await supabase
        .from('variants')
        .select('variant_id')
        .or(`variant_name.ilike.%${search}%`) as { data: Array<{variant_id: string}> | null };
      
      const variantIdsForCount = matchingVariantsForCount?.map((v: any) => v.variant_id) || [];
      
      const searchTerm = `%${search}%`;
      let countSearchConditions = [
        `engine_type.ilike.${searchTerm}`,
        `displacement.ilike.${searchTerm}`,
        `max_torque.ilike.${searchTerm}`,
        `body_type.ilike.${searchTerm}`,
        `peak_power.ilike.${searchTerm}`,
        `transmission.ilike.${searchTerm}`
      ];
      
      if (variantIdsForCount.length > 0) {
        countSearchConditions.push(`variant_id.in.(${variantIdsForCount.join(',')})`);
      }
      
      countQuery = countQuery.or(countSearchConditions.join(','));
    }
    
    const { count } = await countQuery;

    // Get paginated data
    const { data: specifications, error } = await query
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Database error' },
        { status: 500 }
      );
    }

    // Format specifications data
    const formattedSpecs = (specifications || []).map((spec: any) => ({
      variant_id: spec.variant_id,
      variant_name: spec.variants?.variant_name,
      model_name: spec.variants?.models?.model_name,
      brand_name: spec.variants?.models?.brands?.brand_name,
      engine_type: spec.engine_type,
      displacement: spec.displacement,
      max_torque: spec.max_torque,
      no_of_cylinders: spec.no_of_cylinders,
      cooling_system: spec.cooling_system,
      city_mileage: spec.city_mileage,
      highway_mileage: spec.highway_mileage,
      body_type: spec.body_type,
      peak_power: spec.peak_power,
      transmission: spec.transmission
    }));

    return NextResponse.json({
      success: true,
      specifications: formattedSpecs,
      total: count || 0,
      page,
      limit
    });

  } catch (error) {
    console.error('Specifications API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new specification
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    try {
      jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { variant_id, engine_type, displacement, max_torque, no_of_cylinders, cooling_system } = body;

    if (!variant_id) {
      return NextResponse.json(
        { success: false, error: 'Variant ID is required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    const { data: spec, error } = await (supabase as any)
      .from('specs')
      .insert({
        variant_id,
        engine_type,
        displacement,
        max_torque,
        no_of_cylinders,
        cooling_system
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create specification' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      specification: spec
    });

  } catch (error) {
    console.error('Specifications API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}