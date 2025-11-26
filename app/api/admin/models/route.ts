import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'your-super-secret-admin-key';

// GET - List models with pagination and search
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
    const brandId = searchParams.get('brandId') || '';
    const offset = (page - 1) * limit;

    const supabase = createServerClient();

    let query = supabase
      .from('models')
      .select(`
        model_id,
        model_name,
        brand_id,
        brands!inner(
          brand_name
        ),
        variants (
          variant_id
        )
      `);

    // Add search filter
    if (search) {
      query = query.or(`model_name.ilike.%${search}%`);
    }

    // Add brand filter
    if (brandId) {
      query = query.eq('brand_id', brandId);
    }

    // Get total count
    const { count } = await supabase
      .from('models')
      .select('*', { count: 'exact', head: true });

    // Get paginated data
    const { data: models, error } = await query
      .order('model_id', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Database error' },
        { status: 500 }
      );
    }

    // Format models data with variants count and brand name
    const formattedModels = (models || []).map((model: any) => ({
      model_id: model.model_id,
      model_name: model.model_name,
      brand_id: model.brand_id,
      brand_name: model.brands?.brand_name,
      variants_count: model.variants ? model.variants.length : 0
    }));

    return NextResponse.json({
      success: true,
      models: formattedModels,
      total: count || 0,
      page,
      limit
    });

  } catch (error) {
    console.error('Models API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new model
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
    const { model_name, brand_id, description, image_url, launch_date } = body;

    if (!model_name || !brand_id) {
      return NextResponse.json(
        { success: false, error: 'Model name and brand are required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    const { data: model, error } = await (supabase as any)
      .from('models')
      .insert({
        model_name,
        brand_id
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create model' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      model
    });

  } catch (error) {
    console.error('Models API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}