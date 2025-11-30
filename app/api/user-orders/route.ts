import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function POST(request: NextRequest) {
  try {
    const { variant_id, bike_name, variant_name, price, brand_name, image_url, user_id } = await request.json();

    console.log('POST /api/user-orders - Request data:', {
      variant_id, bike_name, variant_name, price, brand_name, user_id
    });

    // Input validation
    if (!variant_id || !bike_name || !variant_name || !price || !brand_name || !user_id) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert order into database
    const { data, error } = await supabase
      .from('user_orders')
      .insert({
        user_id: user_id,
        variant_id: parseInt(variant_id),
        bike_name,
        variant_name,
        price: parseFloat(price),
        brand_name,
        image_url: image_url || null,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to add order to database' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      order: data,
      message: 'Order added successfully'
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get user_id from query params
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');

    console.log('GET /api/user-orders - Request params:', { user_id });

    if (!user_id) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user orders
    const { data: orders, error } = await supabase
      .from('user_orders')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    console.log('Database query result:', { 
      ordersCount: orders?.length || 0, 
      error: error?.message,
      user_id
    });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch orders' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      orders: orders || []
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}