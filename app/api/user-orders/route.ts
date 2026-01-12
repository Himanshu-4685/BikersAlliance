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

    // Check if user already has this variant in their orders
    const { data: existingOrder, error: checkError } = await supabase
      .from('user_orders')
      .select('id')
      .eq('user_id', user_id)
      .eq('variant_id', parseInt(variant_id))
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing order:', checkError);
      return NextResponse.json(
        { success: false, error: 'Failed to check existing orders' },
        { status: 500 }
      );
    }

    if (existingOrder) {
      return NextResponse.json(
        { success: false, error: 'You have already added this bike to your orders' },
        { status: 409 }
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

    // Get user orders, excluding those that have been booked
    const { data: orders, error } = await supabase
      .from('user_orders')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch orders' },
        { status: 500 }
      );
    }

    // Filter out orders that have been booked
    let filteredOrders = orders || [];
    
    if (orders && orders.length > 0) {
      // Get booking data to exclude booked items
      const { data: bookings } = await supabase
        .from('bookings')
        .select('variant_id')
        .eq('user_id', user_id);
      
      const bookedVariantIds = new Set(bookings?.map(booking => booking.variant_id) || []);
      
      // Filter out orders that have been booked
      filteredOrders = orders.filter(order => !bookedVariantIds.has(order.variant_id));
    }

    console.log('Database query result:', { 
      totalOrders: orders?.length || 0,
      filteredOrders: filteredOrders.length,
      error: (error as any)?.message,
      user_id
    });

    return NextResponse.json({
      success: true,
      orders: filteredOrders
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { user_id, variant_id } = await request.json();

    console.log('DELETE /api/user-orders - Request data:', {
      user_id, variant_id
    });

    // Input validation
    if (!user_id || !variant_id) {
      return NextResponse.json(
        { success: false, error: 'User ID and variant ID are required' },
        { status: 400 }
      );
    }

    // Delete order from database
    const { error } = await supabase
      .from('user_orders')
      .delete()
      .eq('user_id', user_id)
      .eq('variant_id', parseInt(variant_id));

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to remove order from database' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Order removed successfully'
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}