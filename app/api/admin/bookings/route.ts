import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { successResponse, errorResponse } from '@/lib/api-response';

// Create admin client with service role key for admin operations
const createAdminSupabaseClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role key for admin operations
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
};

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminSupabaseClient(); // Use admin client for service role access
    
    // Get authorization header
    const authorization = request.headers.get('authorization');
    if (!authorization?.startsWith('Bearer ')) {
      return errorResponse('Invalid authorization header', 401);
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    
    const offset = (page - 1) * limit;

    // Build query for bookings with user details
    let query = supabase
      .from('bookings')
      .select(`
        booking_id,
        user_id,
        variant_id,
        dealer_id,
        booking_date,
        status,
        price,
        notes,
        created_at,
        variants(
          variant_name,
          models(
            model_name,
            brands(
              brand_name
            )
          )
        ),
        dealers(
          name,
          phone,
          email
        )
      `, { count: 'exact' });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    if (search) {
      // Search in variant names only for now to avoid nested relationship issues
      query = query.ilike('variants.variant_name', `%${search}%`);
    }

    // Apply pagination and order
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: bookings, error, count } = await query;

    if (error) {
      console.error('Error fetching admin bookings:', error);
      return errorResponse('Failed to fetch bookings', 500);
    }

    // Get user details using service role to access auth.users
    const userIds = Array.from(new Set(bookings?.map(b => b.user_id).filter(Boolean)));
    
    // Use auth.admin.getUserById for each user to get real user data
    const userPromises = userIds.map(async (userId) => {
      try {
        const { data: authUser, error } = await supabase.auth.admin.getUserById(userId);
        if (!error && authUser?.user) {
          return {
            id: authUser.user.id,
            email: authUser.user.email,
            full_name: authUser.user.user_metadata?.full_name || 
                      authUser.user.user_metadata?.name || 
                      authUser.user.email?.split('@')[0],
            phone: authUser.user.user_metadata?.phone || authUser.user.phone || 'N/A',
          };
        }
        return {
          id: userId,
          email: 'N/A',
          full_name: `User ${userId.substring(0, 8)}...`,
          phone: 'N/A'
        };
      } catch (error) {
        console.error(`Error fetching user ${userId}:`, error);
        return {
          id: userId,
          email: 'N/A',
          full_name: `User ${userId.substring(0, 8)}...`,
          phone: 'N/A'
        };
      }
    });

    const userResults = await Promise.all(userPromises);
    const userLookup = userResults.reduce((acc, user) => {
      acc[user.id] = user;
      return acc;
    }, {} as any);

    // Format response
    const formattedBookings = (bookings || []).map((booking: any) => {
      const user = userLookup[booking.user_id];
      return {
        booking_id: booking.booking_id,
        user_id: booking.user_id,
        user_name: user?.full_name || user?.name || user?.email?.split('@')[0] || 'Unknown User',
        user_email: user?.email || 'N/A',
        user_phone: user?.phone || 'N/A',
        variant_id: booking.variant_id,
        variant_name: booking.variants?.variant_name || 'N/A',
        model_name: booking.variants?.models?.model_name || 'N/A',
        brand_name: booking.variants?.models?.brands?.brand_name || 'N/A',
        dealer_id: booking.dealer_id,
        dealer_name: booking.dealers?.name || 'N/A',
        dealer_phone: booking.dealers?.phone || 'N/A',
        dealer_email: booking.dealers?.email || 'N/A',
        booking_date: booking.booking_date,
        status: booking.status,
        price: booking.price,
        notes: booking.notes,
        created_at: booking.created_at
      };
    });

    return NextResponse.json({
      success: true,
      bookings: formattedBookings,
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit)
    });

  } catch (error) {
    console.error('Admin bookings GET API error:', error);
    return errorResponse('Internal server error', 500);
  }
}