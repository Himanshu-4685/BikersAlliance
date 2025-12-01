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

// GET /api/reviews/[id] - Get a specific review
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const reviewId = params.id;

    const { data: review, error } = await supabase
      .from('reviews')
      .select(`
        review_id,
        variant_id,
        rating,
        title,
        body,
        created_at,
        users!inner(
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
      .eq('review_id', reviewId)
      .single();

    if (error) {
      console.error('Error fetching review:', error);
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }

    const formattedReview = {
      id: review.review_id,
      variantId: review.variant_id,
      rating: review.rating,
      title: review.title,
      content: review.body,
      createdAt: review.created_at,
      user: {
        name: (review.users as any)?.full_name || 'Anonymous',
        image: null
      },
      bike: {
        variant: (review.variants as any)?.variant_name,
        model: (review.variants as any)?.models?.model_name,
        brand: (review.variants as any)?.models?.brands?.brand_name
      }
    };

    return NextResponse.json({
      success: true,
      review: formattedReview
    });

  } catch (error) {
    console.error('Error in GET /api/reviews/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/reviews/[id] - Update a review (only owner can edit)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const reviewId = params.id;
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { rating, title, review_body } = body;

    // Validate required fields
    if (!rating || !review_body) {
      return NextResponse.json(
        { success: false, error: 'Rating and review content are required' },
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

    // Check if review exists and belongs to user
    const { data: existingReview, error: reviewError } = await supabase
      .from('reviews')
      .select('user_id')
      .eq('review_id', reviewId)
      .single();

    if (reviewError || !existingReview) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }

    if (existingReview.user_id !== userData.user_id) {
      return NextResponse.json(
        { success: false, error: 'You can only edit your own reviews' },
        { status: 403 }
      );
    }

    // Update the review
    const { data: updatedReview, error: updateError } = await supabase
      .from('reviews')
      .update({
        rating,
        title: title || 'User Review',
        body: review_body
      })
      .eq('review_id', reviewId)
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

    if (updateError) {
      console.error('Error updating review:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update review' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Review updated successfully',
      review: {
        id: updatedReview.review_id,
        variantId: updatedReview.variant_id,
        rating: updatedReview.rating,
        title: updatedReview.title,
        content: updatedReview.body,
        createdAt: updatedReview.created_at,
        user: {
          name: (updatedReview.users as any)?.full_name || 'Anonymous',
          image: null
        }
      }
    });

  } catch (error) {
    console.error('Error in PUT /api/reviews/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/reviews/[id] - Delete a review (only owner can delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const reviewId = params.id;
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
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

    // Check if review exists and belongs to user
    const { data: existingReview, error: reviewError } = await supabase
      .from('reviews')
      .select('user_id')
      .eq('review_id', reviewId)
      .single();

    if (reviewError || !existingReview) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }

    if (existingReview.user_id !== userData.user_id) {
      return NextResponse.json(
        { success: false, error: 'You can only delete your own reviews' },
        { status: 403 }
      );
    }

    // Delete the review
    const { error: deleteError } = await supabase
      .from('reviews')
      .delete()
      .eq('review_id', reviewId);

    if (deleteError) {
      console.error('Error deleting review:', deleteError);
      return NextResponse.json(
        { success: false, error: 'Failed to delete review' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('Error in DELETE /api/reviews/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}