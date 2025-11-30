import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    
    const supabase = createServerClient();
    
    // Get city counts for approved used bikes
    const { data: cityCounts, error } = await supabase
      .from('used_bikes')
      .select('city, state')
      .eq('status', 'approved')
      .is('sold_at', null); // Only include unsold bikes

    if (error) {
      console.error('Error fetching city counts:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch city data' },
        { status: 500 }
      );
    }

    // Group by city and count
    const cityMap = new Map();
    
    cityCounts?.forEach((bike: any) => {
      const cityKey = bike.city;
      if (cityMap.has(cityKey)) {
        cityMap.set(cityKey, cityMap.get(cityKey) + 1);
      } else {
        cityMap.set(cityKey, 1);
      }
    });

    // Convert to array format expected by frontend
    const cityData = Array.from(cityMap.entries()).map(([cityName, count]) => ({
      name: cityName,
      slug: cityName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
      count,
      svgIcon: `/images/location-svg/${cityName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.svg`
    }));

    // Sort by count (highest first)
    cityData.sort((a, b) => b.count - a.count);
    
    // Apply limit if specified
    const finalData = limit ? cityData.slice(0, parseInt(limit)) : cityData;

    return NextResponse.json({
      success: true,
      data: finalData
    });

  } catch (error) {
    console.error('Error in used bikes cities API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}