import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Define the Showroom type
export interface Showroom {
  id: string;
  name: string;
  slug: string;
  brand: {
    id: string;
    name: string;
    slug: string;
    logo: string;
  };
  address: {
    street: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
  };
  contact: {
    phone: string[];
    email: string;
    website?: string;
  };
  timings: {
    weekdays: string;
    weekends: string;
    holidays?: string;
  };
  services: string[];
  image: string;
  rating: number;
  reviews: number;
  verified: boolean;
  featured: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
  description?: string;
  established?: string;
  areaServed?: string[];
}

// Helper function to transform database row to API format
function transformDbRowToShowroom(row: any): Showroom {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    brand: {
      id: row.brand_id,
      name: row.brand_name,
      slug: row.brand_slug,
      logo: row.brand_logo
    },
    address: {
      street: row.street,
      area: row.area,
      city: row.city,
      state: row.state,
      pincode: row.pincode,
      landmark: row.landmark
    },
    contact: {
      phone: row.phone,
      email: row.email,
      website: row.website
    },
    timings: {
      weekdays: row.timings_weekdays,
      weekends: row.timings_weekends,
      holidays: row.timings_holidays
    },
    services: row.services,
    image: row.image,
    rating: parseFloat(row.rating) || 0,
    reviews: row.reviews || 0,
    verified: row.verified || false,
    featured: row.featured || false,
    coordinates: row.latitude && row.longitude ? {
      lat: parseFloat(row.latitude),
      lng: parseFloat(row.longitude)
    } : undefined,
    description: row.description,
    established: row.established,
    areaServed: row.area_served
  };
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    
    // Get query parameters
    const city = searchParams.get('city');
    const brand = searchParams.get('brand');
    const featured = searchParams.get('featured');
    const verified = searchParams.get('verified');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build the query
    let query = supabase.from('showrooms').select('*');

    // Apply filters
    if (city) {
      query = query.or(`city.ilike.%${city}%,area_served.cs.["${city}"]`);
    }

    if (brand) {
      query = query.eq('brand_slug', brand.toLowerCase());
    }

    if (featured === 'true') {
      query = query.eq('featured', true);
    }

    if (verified === 'true') {
      query = query.eq('verified', true);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,brand_name.ilike.%${search}%,area.ilike.%${search}%,city.ilike.%${search}%`);
    }

    // Get total count for pagination
    let countQuery = supabase.from('showrooms').select('*', { count: 'exact', head: true });

    // Apply the same filters to count query
    if (city) {
      countQuery = countQuery.or(`city.ilike.%${city}%,area_served.cs.["${city}"]`);
    }

    if (brand) {
      countQuery = countQuery.eq('brand_slug', brand.toLowerCase());
    }

    if (featured === 'true') {
      countQuery = countQuery.eq('featured', true);
    }

    if (verified === 'true') {
      countQuery = countQuery.eq('verified', true);
    }

    if (search) {
      countQuery = countQuery.or(`name.ilike.%${search}%,brand_name.ilike.%${search}%,area.ilike.%${search}%,city.ilike.%${search}%`);
    }

    const { count } = await countQuery;
    const total = count || 0;

    // Apply pagination and ordering
    const startIndex = (page - 1) * limit;
    query = query
      .order('featured', { ascending: false })
      .order('rating', { ascending: false })
      .range(startIndex, startIndex + limit - 1);

    const { data: showroomsData, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    // Transform data to match API format
    const transformedShowrooms = (showroomsData || []).map(transformDbRowToShowroom);

    // Get filter data
    const { data: citiesData } = await supabase
      .from('showrooms')
      .select('city')
      .order('city');
    
    const { data: brandsData } = await supabase
      .from('showrooms')
      .select('brand_id, brand_name, brand_slug, brand_logo')
      .order('brand_name');

    const uniqueCities = Array.from(new Set((citiesData || []).map(item => item.city)));
    const uniqueBrands = Array.from(
      new Map((brandsData || []).map(item => [
        item.brand_id,
        {
          id: item.brand_id,
          name: item.brand_name,
          slug: item.brand_slug,
          logo: item.brand_logo
        }
      ])).values()
    );

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: transformedShowrooms,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      filters: {
        cities: uniqueCities,
        brands: uniqueBrands
      }
    });

  } catch (error) {
    console.error('Error fetching showrooms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch showrooms' },
      { status: 500 }
    );
  }
}