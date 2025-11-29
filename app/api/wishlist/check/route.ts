import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const bike_slug = searchParams.get('bike_slug');

    if (!bike_slug) {
      return NextResponse.json(
        { success: false, error: 'bike_slug parameter is required' },
        { status: 400 }
      );
    }

    // Check if bike is in user's wishlist using the existing favourites table
    // We'll use the favourites table until we can properly set up the new wishlist table
    const { data: favourite, error } = await supabase
      .from('favourites')
      .select('favourite_id')
      .eq('user_id', parseInt(user.id)) // Convert to int if needed for legacy table
      .eq('variant_id', bike_slug) // We'll need to map this properly
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking wishlist status:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to check wishlist status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      isWishlisted: !!favourite
    });

  } catch (error) {
    console.error('Wishlist check error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}