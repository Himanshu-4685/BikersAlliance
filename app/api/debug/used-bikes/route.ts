"use server";

import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = createServerClient();
    
    // Test 1: Get basic used bikes data
    const { data: usedBikes, error: usedBikesError } = await supabase
      .from('used_bikes')
      .select('*')
      .limit(10);

    // Test 2: Get count by status
    const { data: statusCounts, error: statusError } = await supabase
      .from('used_bikes')
      .select('status')
      .not('status', 'is', null);

    // Test 3: Get unique cities
    const { data: cities, error: citiesError } = await supabase
      .from('used_bikes')
      .select('city')
      .not('city', 'is', null);

    // Test 4: Get recent listings
    const { data: recentListings, error: recentError } = await supabase
      .from('used_bikes')
      .select('id, brand, model, year, price, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    const uniqueCities = cities ? Array.from(new Set(cities.map((item: any) => item.city))).filter(Boolean) : [];
    const statusCount = statusCounts ? statusCounts.reduce((acc: any, item: any) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {}) : {};

    return NextResponse.json({
      success: true,
      data: {
        usedBikes: {
          data: usedBikes,
          error: usedBikesError,
          count: usedBikes?.length || 0
        },
        statusDistribution: {
          data: statusCount,
          error: statusError
        },
        cities: {
          data: uniqueCities,
          error: citiesError,
          count: uniqueCities.length
        },
        recentListings: {
          data: recentListings,
          error: recentError
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Used bikes debug error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}