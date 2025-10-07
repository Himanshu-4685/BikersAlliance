import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    // Get URL search params
    const { searchParams } = new URL(request.url);
    
    // Extract filter parameters
    const brand = searchParams.get('brand');
    const category = searchParams.get('category');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const minEngineCapacity = searchParams.get('minEngineCapacity');
    const maxEngineCapacity = searchParams.get('maxEngineCapacity');
    const minMileage = searchParams.get('minMileage');
    const sortBy = searchParams.get('sortBy') || 'price';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    
    // Build Supabase query
    let query = supabase
      .from('bikes')
      .select('*', { count: 'exact' });
    
    // Apply filters
    if (brand) {
      query = query.eq('brand', brand);
    }
    
    if (category) {
      query = query.eq('category', category);
    }
    
    if (minPrice) {
      query = query.gte('price', parseInt(minPrice));
    }
    
    if (maxPrice) {
      query = query.lte('price', parseInt(maxPrice));
    }
    
    if (minEngineCapacity) {
      query = query.gte('engine_capacity', parseInt(minEngineCapacity));
    }
    
    if (maxEngineCapacity) {
      query = query.lte('engine_capacity', parseInt(maxEngineCapacity));
    }
    
    if (minMileage) {
      query = query.gte('mileage', parseInt(minMileage));
    }
    
    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    
    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);
    
    // Execute query
    const { data, error, count } = await query;
    
    if (error) {
      console.error('Error fetching bikes from Supabase:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch bikes'
      }, { status: 500 });
    }
    
    // Prepare pagination data
    const totalPages = count ? Math.ceil(count / limit) : 0;
    
    return NextResponse.json({
      success: true,
      data: {
        models: data,
        pagination: {
          total: count || 0,
          page,
          limit,
          totalPages
        }
      }
    });
    
  } catch (error) {
    console.error('Error handling request:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}