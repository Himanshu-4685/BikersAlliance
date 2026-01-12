import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

// Temporary type for favourites table until we fix Supabase types
interface Favourite {
  favourite_id: number;
  user_id: number;
  variant_id: number;
  added_at: string;
}

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

    // First get the user's integer ID from email in users table
    const { data: userRecord, error: userError } = await (supabase as any)
      .from('users')
      .select('user_id')
      .eq('email', user.email)
      .single();

    if (userError || !userRecord) {
      console.error('Error finding user in users table:', userError);
      return NextResponse.json(
        { success: false, error: 'User not found in database' },
        { status: 404 }
      );
    }

    // Get favourites with complete bike information  
    const { data: favourites, error } = await (supabase as any)
      .from('favourites')
      .select(`
        favourite_id, 
        variant_id, 
        added_at,
        variants!inner(
          variant_name,
          on_road_price,
          url,
          models!inner(
            model_name,
            brands!inner(
              brand_name
            )
          )
        )
      `)
      .eq('user_id', userRecord.user_id);

    if (error) {
      console.error('Error fetching favourites:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch wishlist' },
        { status: 500 }
      );
    }

    // Get images for each variant separately
    const favouritesWithImages = await Promise.all(
      (favourites || []).map(async (fav: any) => {
        const { data: images } = await (supabase as any)
          .from('images')
          .select('url, alt_text')
          .eq('variant_id', fav.variant_id)
          .limit(1);
        
        return {
          ...fav,
          images: images || []
        };
      })
    );

    // Transform the data to match our wishlist format
    const wishlistItems = (favouritesWithImages || []).map((fav: any) => {
      const variant = fav.variants;
      const model = variant?.models;
      const brand = model?.brands;
      const image = fav.images && fav.images.length > 0 ? fav.images[0] : null;
      
      // Use variant_id as the bike_slug since that's what /api/bikes/[slug] expects
      const bikeSlug = fav.variant_id.toString();

      return {
        id: fav.favourite_id.toString(),
        bike_id: fav.variant_id.toString(),
        bike_name: variant?.variant_name || model?.model_name || `Bike ${fav.variant_id}`,
        bike_slug: bikeSlug,
        bike_price: variant?.on_road_price || null,
        bike_image_url: image?.url || `https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&crop=center&auto=format&q=80`, // Use motorcycle placeholder
        brand_name: brand?.brand_name || null,
        created_at: fav.added_at
      };
    });

    return NextResponse.json({
      success: true,
      data: wishlistItems,
      count: wishlistItems.length
    });

  } catch (error) {
    console.error('Wishlist GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { bike_id, bike_name, bike_image_url, bike_price, bike_slug, brand_name } = body;

    // Validate required fields
    if (!bike_id || !bike_name || !bike_slug) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: bike_id, bike_name, bike_slug' },
        { status: 400 }
      );
    }

    // First get the user's integer ID from email in users table
    const { data: userRecord, error: userError } = await (supabase as any)
      .from('users')
      .select('user_id')
      .eq('email', user.email)
      .single();

    if (userError || !userRecord) {
      console.error('Error finding user in users table:', userError);
      return NextResponse.json(
        { success: false, error: 'User not found in database' },
        { status: 404 }
      );
    }

    // Use bike_id as variant_id (assuming bike_id corresponds to variant_id)
    const variantId = parseInt(bike_id) || parseInt(bike_slug.replace(/\D/g, '')) || 1;

    // Check if already in favourites
    const { data: existing } = await (supabase as any)
      .from('favourites')
      .select('favourite_id')
      .eq('user_id', userRecord.user_id)
      .eq('variant_id', variantId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Bike already in wishlist' },
        { status: 409 }
      );
    }

    // Add to favourites table
    const { data: favourite, error } = await (supabase as any)
      .from('favourites')
      .insert([{
        user_id: userRecord.user_id,
        variant_id: variantId
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding to favourites:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to add to wishlist' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Added to wishlist',
      data: {
        id: (favourite as any)?.favourite_id?.toString() || bike_id,
        bike_id,
        bike_name,
        bike_image_url,
        bike_price,
        bike_slug,
        brand_name,
        created_at: (favourite as any)?.added_at || new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Wishlist POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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
    const bike_id = searchParams.get('bike_id');

    if (!bike_slug && !bike_id) {
      return NextResponse.json(
        { success: false, error: 'bike_slug or bike_id parameter is required' },
        { status: 400 }
      );
    }

    // First get the user's integer ID from email in users table
    const { data: userRecord, error: userError } = await (supabase as any)
      .from('users')
      .select('user_id')
      .eq('email', user.email)
      .single();

    if (userError || !userRecord) {
      console.error('Error finding user in users table:', userError);
      return NextResponse.json(
        { success: false, error: 'User not found in database' },
        { status: 404 }
      );
    }

    // Use bike_id as variant_id, or extract from slug
    const variantId = bike_id ? parseInt(bike_id) : parseInt((bike_slug || '').replace(/\D/g, '')) || 1;

    // Remove from favourites table
    const { error } = await (supabase as any)
      .from('favourites')
      .delete()
      .eq('user_id', userRecord.user_id)
      .eq('variant_id', variantId);

    if (error) {
      console.error('Error removing from favourites:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to remove from wishlist' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Removed from wishlist'
    });

  } catch (error) {
    console.error('Wishlist DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}