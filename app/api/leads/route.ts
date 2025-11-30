import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function POST(request: NextRequest) {
  try {
    const {
      name,
      phone,
      email,
      address,
      pincode,
      variant_id,
      bike_name,
      variant_name,
      brand_name,
      lead_type
    } = await request.json();

    // Input validation
    if (!name || !phone || !email || !address || !pincode || !variant_id || !bike_name || !variant_name || !brand_name || !lead_type) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate lead type
    if (!['get_on_road_price', 'book_test_ride'].includes(lead_type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid lead type' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate phone format (basic check for digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone number' },
        { status: 400 }
      );
    }

    // Validate pincode (6 digits)
    const pincodeRegex = /^\d{6}$/;
    if (!pincodeRegex.test(pincode)) {
      return NextResponse.json(
        { success: false, error: 'Invalid pincode' },
        { status: 400 }
      );
    }

    // Insert lead into database
    const { data, error } = await supabase
      .from('leads')
      .insert({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        address: address.trim(),
        pincode: pincode.trim(),
        variant_id: parseInt(variant_id),
        bike_name: bike_name.trim(),
        variant_name: variant_name.trim(),
        brand_name: brand_name.trim(),
        lead_type,
        status: 'new'
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to submit form. Please try again.' },
        { status: 500 }
      );
    }

    // Send notification email (optional - you can implement this later)
    // await sendNotificationEmail(data);

    return NextResponse.json({
      success: true,
      lead: data,
      message: 'Form submitted successfully'
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
    const { searchParams } = new URL(request.url);
    const leadType = searchParams.get('lead_type');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build query
    let query = supabase
      .from('leads')
      .select('*', { count: 'exact' });

    if (leadType && ['get_on_road_price', 'book_test_ride'].includes(leadType)) {
      query = query.eq('lead_type', leadType);
    }

    if (status && ['new', 'contacted', 'qualified', 'closed'].includes(status)) {
      query = query.eq('status', status);
    }

    // Add pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.range(from, to).order('created_at', { ascending: false });

    const { data: leads, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch leads' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      leads: leads || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}