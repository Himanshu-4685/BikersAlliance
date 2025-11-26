import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'your-super-secret-admin-key';

// GET - List status with pagination and search
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
    const status = searchParams.get('status') || '';
    const offset = (page - 1) * limit;

    const supabase = createServerClient();

    let query = supabase
      .from('status')
      .select(`
        status_id,
        brand_id,
        model_id,
        variant_id,
        status,
        price_range,
        expected_launch,
        launch_date,
        created_at,
        updated_at,
        brands!inner(
          brand_name
        ),
        models!inner(
          model_name
        ),
        variants!inner(
          variant_name
        )
      `);

    // Add search filter
    if (search) {
      query = query.or(`models.model_name.ilike.%${search}%,brands.brand_name.ilike.%${search}%`);
    }

    // Add status filter
    if (status) {
      query = query.eq('status', status);
    }

    // Get total count
    const { count } = await supabase
      .from('status')
      .select('*', { count: 'exact', head: true });

    // Get paginated data
    const { data: statuses, error } = await query
      .order('status_id', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Database error' },
        { status: 500 }
      );
    }

    // Format status data
    const formattedStatuses = (statuses || []).map((statusItem: any) => ({
      status_id: statusItem.status_id,
      model_id: statusItem.model_id,
      variant_id: statusItem.variant_id,
      status_type: statusItem.status,
      launch_date: statusItem.launch_date,
      expected_launch: statusItem.expected_launch,
      price_range: statusItem.price_range,
      created_at: statusItem.created_at,
      model_name: statusItem.models?.model_name,
      brand_name: statusItem.brands?.brand_name,
      variant_name: statusItem.variants?.variant_name
    }));

    // Get stats
    const { data: statsData } = await supabase
      .from('status')
      .select('status');

    const stats = {
      launched: statsData?.filter((s: any) => s.status === 'new_launch').length || 0,
      upcoming: statsData?.filter((s: any) => s.status === 'upcoming').length || 0,
      discontinued: 0 // Not in your schema
    };

    return NextResponse.json({
      success: true,
      statuses: formattedStatuses,
      stats,
      total: count || 0,
      page,
      limit
    });

  } catch (error) {
    console.error('Status API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new status
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
    const { brand_id, model_id, variant_id, status, price_range, expected_launch, launch_date } = body;

    if (!brand_id || !model_id || !variant_id || !status) {
      return NextResponse.json(
        { success: false, error: 'Brand ID, Model ID, Variant ID and status are required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    const { data: statusItem, error } = await (supabase as any)
      .from('status')
      .insert({
        brand_id,
        model_id,
        variant_id,
        status,
        price_range,
        expected_launch,
        launch_date
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      status: statusItem
    });

  } catch (error) {
    console.error('Status API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}