import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Search dealers by location/name
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.toLowerCase();
    const city = searchParams.get('city')?.toLowerCase();
    const state = searchParams.get('state')?.toLowerCase();

    if (!query && !city && !state) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Search query, city, or state parameter is required' 
        },
        { status: 400 }
      );
    }

    let supabaseQuery = supabase
      .from('dealers')
      .select('*')
      .order('name', { ascending: true })
      .limit(20); // Limit search results

    if (query) {
      supabaseQuery = supabaseQuery.or(
        `name.ilike.%${query}%,city.ilike.%${query}%,state.ilike.%${query}%,address.ilike.%${query}%`
      );
    }

    if (city) {
      supabaseQuery = supabaseQuery.ilike('city', `%${city}%`);
    }

    if (state) {
      supabaseQuery = supabaseQuery.ilike('state', `%${state}%`);
    }

    const { data: dealers, error } = await supabaseQuery;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to search dealers',
          details: error.message 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: dealers || [],
      count: dealers?.length || 0
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