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

    // Add search filter
    if (search) {
      query = query.or(`variants.variant_name.ilike.%${search}%,variants.models.model_name.ilike.%${search}%`);
    }

    // Get total count
    const { count } = await supabase
      .from('specs')
      .select('*', { count: 'exact', head: true });

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