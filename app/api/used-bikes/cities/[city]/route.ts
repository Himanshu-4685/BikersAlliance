import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

export async function GET(
  request: NextRequest,
  { params }: { params: { city: string } }
) {
  try {
    const { city } = params;
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const offset = (page - 1) * limit;
    
    if (!city) {
      return NextResponse.json(
        { success: false, error: 'City parameter is required' },
        { status: 400 }
      );
    }

    // Convert slug back to city name
    const cityName = city
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    const supabase = createServerClient();

    // Get used bikes for the specific city (case-insensitive)
    const query = supabase
      .from('used_bikes')
      .select(`
        id,
        brand,
        model,
        variant,
        year,
        expected_price,
        km_driven,
        city,
        state,
        condition,
        photos,
        created_at,
        fuel_type,
        transmission,
        ownership
      `)
      .eq('status', 'approved')
      .ilike('city', cityName) // Use case-insensitive matching
      .is('sold_at', null) // Only show unsold bikes
      .order('created_at', { ascending: false });

    // Apply pagination
    const { data: usedBikes, error } = await query
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching used bikes:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch used bikes' },
        { status: 500 }
      );
    }

    // Get total count for pagination
    const { count: totalCount, error: countError } = await supabase
      .from('used_bikes')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved')
      .ilike('city', cityName) // Use case-insensitive matching
      .is('sold_at', null);

    if (countError) {
      console.error('Error getting total count:', countError);
      return NextResponse.json(
        { success: false, error: 'Failed to get count' },
        { status: 500 }
      );
    }

    // Format the used bikes data
    const formattedBikes = usedBikes?.map((bike: any) => ({
      id: bike.id,
      title: `${bike.brand} ${bike.model}${bike.variant ? ` ${bike.variant}` : ''}`,
      price: bike.expected_price,
      year: bike.year,
      kilometers: bike.km_driven,
      city: bike.city,
      state: bike.state,
      condition: bike.condition,
      fuelType: bike.fuel_type,
      transmission: bike.transmission,
      ownership: bike.ownership,
      image: bike.photos && bike.photos.length > 0 ? bike.photos[0] : '/images/bikes/default-bike.svg',
      photos: bike.photos || [],
      createdAt: bike.created_at
    })) || [];

    return NextResponse.json({
      success: true,
      data: {
        bikes: formattedBikes,
        pagination: {
          total: totalCount || 0,
          page,
          limit,
          totalPages: Math.ceil((totalCount || 0) / limit),
          hasNextPage: page * limit < (totalCount || 0),
          hasPrevPage: page > 1
        },
        city: {
          name: cityName,
          slug: city
        }
      }
    });

  } catch (error) {
    console.error('Error in used bikes by city API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}