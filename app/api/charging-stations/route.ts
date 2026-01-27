import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Define the ChargingStation type
export interface ChargingStation {
  id: string;
  name: string;
  slug: string;
  location: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  email?: string;
  timing: string;
  connectorTypes: string[];
  chargingSpeed: string;
  status: 'Available' | 'Occupied' | 'Maintenance' | 'Out of Order';
  pricing: string;
  amenities: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
  description?: string;
  operator?: string;
  capacity?: number;
  powerOutput?: string;
}

// Helper function to transform database row to API format
function transformDbRowToChargingStation(row: any): ChargingStation {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    location: row.location,
    address: row.address,
    city: row.city,
    state: row.state,
    phone: row.phone,
    email: row.email,
    timing: row.timing,
    connectorTypes: row.connector_types || [],
    chargingSpeed: row.charging_speed,
    status: row.status,
    pricing: row.pricing,
    amenities: row.amenities || [],
    coordinates: {
      lat: parseFloat(row.latitude),
      lng: parseFloat(row.longitude)
    },
    description: row.description,
    operator: row.operator,
    capacity: row.capacity,
    powerOutput: row.power_output
  };
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    
    // Get query parameters
    const city = searchParams.get('city');
    const state = searchParams.get('state');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build the query
    let query = supabase.from('charging_stations').select('*');

    // Apply filters
    if (city && city !== 'All Cities') {
      query = query.ilike('city', `%${city}%`);
    }

    if (state && state !== 'All States') {
      query = query.ilike('state', `%${state}%`);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,location.ilike.%${search}%,address.ilike.%${search}%,operator.ilike.%${search}%`);
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('charging_stations')
      .select('*', { count: 'exact', head: true });

    // Apply the same filters to count query
    if (state && state !== 'All States') {
      countQuery = countQuery.ilike('state', `%${state}%`);
    }

    if (status) {
      countQuery = countQuery.eq('status', status);
    }

    if (search) {
      countQuery = countQuery.or(`name.ilike.%${search}%,location.ilike.%${search}%,address.ilike.%${search}%,operator.ilike.%${search}%`);
    }

    const { count } = await countQuery;
    const total = count || 0;

    // Apply pagination and ordering
    const startIndex = (page - 1) * limit;
    query = query
      .order('status', { ascending: true }) // Available first
      .order('charging_speed', { ascending: false }) // Higher speed first
      .range(startIndex, startIndex + limit - 1);

    const { data: chargingStationsData, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    // Transform data to match API format
    const transformedStations = (chargingStationsData || []).map(transformDbRowToChargingStation);

    // Get filter data
    const { data: citiesData } = await supabase
      .from('charging_stations')
      .select('city')
      .order('city');
    
    const { data: statesData } = await supabase
      .from('charging_stations')
      .select('state')
      .order('state');

    const { data: operatorsData } = await supabase
      .from('charging_stations')
      .select('operator')
      .order('operator');

    const uniqueCities = Array.from(new Set((citiesData || []).map(item => item.city).filter(Boolean)));
    const uniqueStates = Array.from(new Set((statesData || []).map(item => item.state).filter(Boolean)));
    const uniqueOperators = Array.from(new Set((operatorsData || []).map(item => item.operator).filter(Boolean)));

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: transformedStations,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      filters: {
        cities: ['All Cities', ...uniqueCities],
        states: ['All States', ...uniqueStates],
        operators: uniqueOperators,
        statuses: ['Available', 'Occupied', 'Maintenance', 'Out of Order']
      }
    });

  } catch (error) {
    console.error('Error fetching charging stations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch charging stations' },
      { status: 500 }
    );
  }
}

// GET individual charging station by slug
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { slug } = await request.json();

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('charging_stations')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Charging station not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    const transformedStation = transformDbRowToChargingStation(data);

    return NextResponse.json({
      data: transformedStation
    });

  } catch (error) {
    console.error('Error fetching charging station:', error);
    return NextResponse.json(
      { error: 'Failed to fetch charging station' },
      { status: 500 }
    );
  }
}