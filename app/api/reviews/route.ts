import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const createClient = () => {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
};

// GET /api/reviews - Fetch reviews for a specific variant or all reviews
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    
    const variantId = searchParams.get('variant_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('reviews')
      .select(`
        review_id,
        variant_id,
        rating,
        title,
        body,
        created_at,
        users!inner(
          user_id,
          full_name
        ),
        variants!inner(
          variant_name,
          models!inner(
            model_name,
            brands!inner(
              brand_name
            )
          )
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (variantId) {
      query = query.eq('variant_id', variantId);
    }

    const { data: reviews, error, count } = await query;

    if (error) {
      console.error('Error fetching reviews:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch reviews' },
        { status: 500 }
      );
    }

    const formattedReviews = reviews?.map((review: any) => ({
      id: review.review_id,
      variantId: review.variant_id,
      rating: review.rating,
      title: review.title,
      content: review.body,
      createdAt: review.created_at,
      user: {
        name: review.users?.full_name || 'Anonymous',
        image: null
      },
      bike: {
        variant: review.variants?.variant_name,
        model: review.variants?.models?.model_name,
        brand: review.variants?.models?.brands?.brand_name
      }
    })) || [];

    return NextResponse.json({
      success: true,
      reviews: formattedReviews,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Error in GET /api/reviews:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/reviews - Create a new review (requires authentication)
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { variant_id, rating, title, review_body } = body;

    // Validate required fields
    if (!variant_id || !rating || !review_body) {
      return NextResponse.json(
        { success: false, error: 'Variant ID, rating, and review content are required' },
        { status: 400 }
      );
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Get user_id from public.users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('user_id')
      .eq('email', user.email)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { success: false, error: 'User not found in database' },
        { status: 404 }
      );
    }

    // Check if user has already reviewed this variant
    const { data: existingReview, error: checkError } = await supabase
      .from('reviews')
      .select('review_id')
      .eq('variant_id', variant_id)
      .eq('user_id', userData.user_id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error
      return NextResponse.json(
        { success: false, error: 'Error checking existing review' },
        { status: 500 }
      );
    }

    if (existingReview) {
      return NextResponse.json(
        { success: false, error: 'You have already reviewed this bike variant' },
        { status: 409 }
      );
    }

    // Create the review
    const { data: review, error: insertError } = await (supabase as any)
      .from('reviews')
      .insert({
        variant_id: parseInt(variant_id),
        user_id: userData.user_id,
        rating,
        title: title || 'User Review',
        body: review_body
      })
      .select(`
        review_id,
        variant_id,
        rating,
        title,
        body,
        created_at,
        users!inner(
          full_name
        )
      `)
      .single();

    if (insertError) {
      console.error('Error creating review:', insertError);
      return NextResponse.json(
        { success: false, error: 'Failed to create review' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Review created successfully',
      review: {
        id: review.review_id,
        variantId: review.variant_id,
        rating: review.rating,
        title: review.title,
        content: review.body,
        createdAt: review.created_at,
        user: {
          name: (review.users as any)?.full_name || 'Anonymous',
          image: null
        }
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/reviews:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}