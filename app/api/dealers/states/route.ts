import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch unique states from dealers table
export async function GET() {
  try {
    const { data: dealers, error } = await supabase
      .from('dealers')
      .select('state')
      .order('state', { ascending: true });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch states',
          details: error.message 
        },
        { status: 500 }
      );
    }

    // Get unique states and filter out null/empty values
    const statesArray = (dealers || [])
      .map(dealer => dealer.state)
      .filter(state => state && state.trim() !== '')
      .map(state => state.trim());
    
    const uniqueStates = Array.from(new Set(statesArray));

    return NextResponse.json({
      success: true,
      data: uniqueStates
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