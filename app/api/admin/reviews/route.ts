import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-client';
import jwt from 'jsonwebtoken';

// Helper to verify admin authentication
async function verifyAdminAuth(request: NextRequest): Promise<any | null> {
  const authHeader = request.headers.get('authorization');
  console.log('Auth header:', authHeader ? 'Present' : 'Missing');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('Invalid auth header format');
    return null;
  }

  const token = authHeader.substring(7);
  console.log('Token length:', token.length);
  
  try {
    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET || 'your-super-secret-admin-key') as any;
    console.log('Token decoded successfully for admin ID:', decoded.adminId || decoded.id);
    
    const supabase = createClient();
    const { data: admin, error } = await supabase
      .from('admin')
      .select('*')
      .eq('id', decoded.adminId || decoded.id)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Admin lookup error:', error);
      return null;
    }

    if (!admin) {
      console.log('Admin not found or inactive');
      return null;
    }

    console.log('Admin verified:', (admin as any).email);
    return admin as any;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

// GET /api/admin/reviews - List all reviews with pagination and search
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdminAuth(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const offset = (page - 1) * limit;

    // Query reviews with joined user and variant data
    let query = supabase
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
          full_name,
          email
        ),
        variants(
          variant_name,
          models(
            model_name,
            brands(
              brand_name
            )
          )
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.or(
        `title.ilike.%${search}%,body.ilike.%${search}%`
      );
    }

    const { data: reviews, error, count } = await query;

    if (error) {
      console.error('Error fetching reviews:', error);
      console.error('Query details:', { page, limit, search, offset });
      return NextResponse.json(
        { success: false, error: 'Failed to fetch reviews', details: error.message },
        { status: 500 }
      );
    }

    console.log('Fetched reviews count:', reviews?.length || 0);
    console.log('Total count:', count);

    // Format the reviews with proper user and variant data
    const formattedReviews = (reviews || []).map((review: any) => ({
      review_id: review.review_id,
      variant_id: review.variant_id,
      user_id: review.user_id,
      rating: review.rating,
      title: review.title || 'No Title',
      body: review.body,
      created_at: review.created_at,
      user_name: review.users?.full_name || 'Unknown User',
      user_email: review.users?.email || '',
      variant_name: review.variants?.variant_name || 'Unknown Variant',
      model_name: review.variants?.models?.model_name || 'Unknown Model',
      brand_name: review.variants?.models?.brands?.brand_name || 'Unknown Brand'
    }));

    return NextResponse.json({
      success: true,
      reviews: formattedReviews,
      total: count || 0,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Error in GET /api/admin/reviews:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/reviews - Create a new review as admin
export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdminAuth(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = createClient();
    const body = await request.json();
    const { variant_id, user_id, rating, title, review_body } = body;

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

    // If user_id is provided, verify user exists, otherwise use admin's user
    let actualUserId = user_id;
    if (!actualUserId) {
      // Create or find a user for admin reviews
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('user_id')
        .eq('email', (admin as any).email)
        .single();

      if (userError && userError.code === 'PGRST116') {
        // Create user entry for admin
        const { data: newUser, error: createError } = await (supabase as any)
          .from('users')
          .insert({
            full_name: (admin as any).name,
            email: (admin as any).email
          })
          .select('user_id')
          .single();

        if (createError) {
          return NextResponse.json(
            { success: false, error: 'Failed to create user entry' },
            { status: 500 }
          );
        }

        actualUserId = (newUser as any).user_id;
      } else if (userData) {
        actualUserId = (userData as any).user_id;
      } else {
        return NextResponse.json(
          { success: false, error: 'Failed to resolve user' },
          { status: 500 }
        );
      }
    }

    // Create the review
    const { data: review, error: insertError } = await (supabase as any)
      .from('reviews')
      .insert({
        variant_id: parseInt(variant_id),
        user_id: actualUserId,
        rating,
        title: title || 'Admin Review',
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

    // Log admin action
    try {
      await (supabase as any).from('admin_audit_log').insert({
        admin_id: (admin as any).id,
        action: 'CREATE',
        table_name: 'reviews',
        record_id: (review as any).review_id.toString(),
        new_values: {
          variant_id,
          rating,
          title: title || 'Admin Review',
          body: review_body
        }
      });
    } catch (logError) {
      console.error('Failed to log admin action:', logError);
    }

    return NextResponse.json({
      success: true,
      message: 'Review created successfully',
      review: {
        id: (review as any).review_id,
        variantId: (review as any).variant_id,
        rating: (review as any).rating,
        title: (review as any).title,
        content: (review as any).body,
        createdAt: (review as any).created_at,
        user: {
          name: (review as any).users?.full_name || 'Anonymous',
          image: null
        }
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/admin/reviews:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}