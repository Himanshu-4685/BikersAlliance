import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch all dealers or filter by city/state
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const state = searchParams.get('state');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('dealers')
      .select('*')
      .order('name', { ascending: true });

    // Apply filters
    if (city) {
      query = query.ilike('city', `%${city}%`);
    }
    if (state) {
      query = query.ilike('state', `%${state}%`);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: dealers, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch dealers',
          details: error.message 
        },
        { status: 500 }
      );
    }

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('dealers')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      success: true,
      data: {
        dealers: dealers || [],
        pagination: {
          currentPage: page,
          totalPages: Math.ceil((totalCount || 0) / limit),
          totalCount: totalCount || 0,
          hasNext: offset + limit < (totalCount || 0),
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST - Create a new dealer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { name, address, city, state, pincode, phone, email } = body;
    
    if (!name || !city || !state) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: name, city, and state are required' 
        },
        { status: 400 }
      );
    }

    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid email format' 
          },
          { status: 400 }
        );
      }
    }

    const { data: dealer, error } = await supabase
      .from('dealers')
      .insert([{
        name: name.trim(),
        address: address?.trim() || null,
        city: city.trim(),
        state: state.trim(),
        pincode: pincode?.trim() || null,
        phone: phone?.trim() || null,
        email: email?.trim().toLowerCase() || null
      }])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to create dealer',
          details: error.message 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: dealer,
      message: 'Dealer created successfully'
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}