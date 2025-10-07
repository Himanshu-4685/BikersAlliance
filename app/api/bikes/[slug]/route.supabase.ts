import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    
    if (!slug) {
      return NextResponse.json({
        success: false,
        error: 'Bike slug is required'
      }, { status: 400 });
    }
    
    // Fetch bike details from Supabase
    const { data, error } = await supabase
      .from('bikes')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          success: false,
          error: 'Bike not found'
        }, { status: 404 });
      }
      
      console.error('Error fetching bike details from Supabase:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch bike details'
      }, { status: 500 });
    }
    
    if (!data) {
      return NextResponse.json({
        success: false,
        error: 'Bike not found'
      }, { status: 404 });
    }
    
    // Return bike data
    return NextResponse.json({
      success: true,
      data: data
    });
    
  } catch (error) {
    console.error('Error handling request:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}