import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-client';
import jwt from 'jsonwebtoken';

// Helper to verify admin authentication
async function verifyAdminAuth(request: NextRequest): Promise<any | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET || 'your-super-secret-admin-key') as any;
    
    const supabase = createClient();
    const { data: admin, error } = await supabase
      .from('admin')
      .select('*')
      .eq('id', decoded.adminId || decoded.id)
      .eq('is_active', true)
      .single();

    if (error || !admin) {
      return null;
    }

    return admin as any;
  } catch (error) {
    return null;
  }
}

// GET /api/admin/reviews/[id] - Get a specific review
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await verifyAdminAuth(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = createClient();
    const reviewId = params.id;

    const { data: review, error } = await supabase
      .from('reviews')
      .select(`
        review_id,
        variant_id,
        user_id,
        rating,
        title,
        body,
        created_at,
        users(
          user_id,
          full_name,
          email
        ),
        variants(
          variant_id,
          variant_name,
          models(
            model_name,
            brands(
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
      review_id: (review as any).review_id,
      variant_id: (review as any).variant_id,
      user_id: (review as any).user_id,
      rating: (review as any).rating,
      title: (review as any).title,
      body: (review as any).body,
      created_at: (review as any).created_at,
      user_name: (review as any).users?.full_name || 'Anonymous',
      user_email: (review as any).users?.email,
      variant_name: (review as any).variants?.variant_name,
      model_name: (review as any).variants?.models?.model_name,
      brand_name: (review as any).variants?.models?.brands?.brand_name
    };

    return NextResponse.json({
      success: true,
      review: formattedReview
    });

  } catch (error) {
    console.error('Error in GET /api/admin/reviews/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/reviews/[id] - Update a review (admin can edit any review)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await verifyAdminAuth(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = createClient();
    const reviewId = params.id;
    
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

    // Get existing review for logging
    const { data: existingReview, error: fetchError } = await supabase
      .from('reviews')
      .select('*')
      .eq('review_id', reviewId)
      .single();

    if (fetchError || !existingReview) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }

    // Update the review
    const updateData = {
      rating: Number(rating),
      title: title || 'Review',
      body: review_body
    };
    
    const { data: updatedReview, error: updateError } = await (supabase as any)
      .from('reviews')
      .update(updateData)
      .eq('review_id', reviewId)
      .select(`
        review_id,
        variant_id,
        rating,
        title,
        body,
        created_at,
        users(
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

    // Log admin action
    try {
      await (supabase as any).from('admin_audit_log').insert({
        admin_id: (admin as any).id,
        action: 'UPDATE',
        table_name: 'reviews',
        record_id: reviewId,
        old_values: {
          rating: (existingReview as any).rating,
          title: (existingReview as any).title,
          body: (existingReview as any).body
        },
        new_values: {
          rating,
          title: title || 'Review',
          body: review_body
        }
      });
    } catch (logError) {
      console.error('Failed to log admin action:', logError);
    }

    return NextResponse.json({
      success: true,
      message: 'Review updated successfully',
      review: {
        id: (updatedReview as any).review_id,
        variantId: (updatedReview as any).variant_id,
        rating: (updatedReview as any).rating,
        title: (updatedReview as any).title,
        content: (updatedReview as any).body,
        createdAt: (updatedReview as any).created_at,
        user: {
          name: (updatedReview as any).users?.full_name || 'Anonymous',
          image: null
        }
      }
    });

  } catch (error) {
    console.error('Error in PUT /api/admin/reviews/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/reviews/[id] - Delete a review (admin can delete any review)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await verifyAdminAuth(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = createClient();
    const reviewId = params.id;

    // Get existing review for logging
    const { data: existingReview, error: fetchError } = await supabase
      .from('reviews')
      .select('*')
      .eq('review_id', reviewId)
      .single();

    if (fetchError || !existingReview) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
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

    // Log admin action
    try {
      await (supabase as any).from('admin_audit_log').insert({
        admin_id: (admin as any).id,
        action: 'DELETE',
        table_name: 'reviews',
        record_id: reviewId,
        old_values: existingReview
      });
    } catch (logError) {
      console.error('Failed to log admin action:', logError);
    }

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('Error in DELETE /api/admin/reviews/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}