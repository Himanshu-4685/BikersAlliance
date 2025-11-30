import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'your-super-secret-admin-key';

// GET - List brands with pagination and search
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
      .from('brands')
      .select(`
        brand_id,
        brand_name,
        logo_url,
        country,
        description,
        created_at,
        models (
          model_id
        )
      `);

    // Add search filter
    if (search) {
      query = query.or(`brand_name.ilike.%${search}%,country.ilike.%${search}%`);
    }

    // Get total count
    const { count } = await supabase
      .from('brands')
      .select('*', { count: 'exact', head: true });

    // Get paginated data
    const { data: brands, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Database error' },
        { status: 500 }
      );
    }

    // Format brands data with models count
    const formattedBrands = (brands || []).map((brand: any) => ({
      brand_id: brand.brand_id,
      brand_name: brand.brand_name,
      logo_url: brand.logo_url,
      country: brand.country,
      description: brand.description,
      created_at: brand.created_at,
      models_count: brand.models ? brand.models.length : 0
    }));

    return NextResponse.json({
      success: true,
      brands: formattedBrands,
      total: count || 0,
      page,
      limit
    });

  } catch (error) {
    console.error('Brands API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new brand
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
    let decoded;

    try {
      decoded = jwt.verify(token, JWT_SECRET) as any;
    } catch (jwtError) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { brand_name, logo_url, country, description } = body;

    if (!brand_name) {
      return NextResponse.json(
        { success: false, error: 'Brand name is required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Check if brand already exists
    const { data: existingBrand } = await supabase
      .from('brands')
      .select('brand_id')
      .eq('brand_name', brand_name)
      .single();

    if (existingBrand) {
      return NextResponse.json(
        { success: false, error: 'Brand already exists' },
        { status: 409 }
      );
    }

    // Create new brand
    const { data: newBrand, error } = await (supabase as any)
      .from('brands')
      .insert({
        brand_name,
        logo_url,
        country,
        description
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create brand' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      brand: newBrand
    });

  } catch (error) {
    console.error('Create brand error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}