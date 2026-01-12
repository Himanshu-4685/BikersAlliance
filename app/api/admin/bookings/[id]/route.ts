import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { successResponse, errorResponse } from '@/lib/api-response';

// Create admin client with service role key for admin operations
const createAdminSupabaseClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminSupabaseClient();
    const bookingId = params.id;
    
    // Get authorization header
    const authorization = request.headers.get('authorization');
    if (!authorization?.startsWith('Bearer ')) {
      return errorResponse('Invalid authorization header', 401);
    }

    if (!bookingId) {
      return errorResponse('Booking ID is required', 400);
    }

    // Get the specific booking with all related data
    const { data: booking, error } = await supabase
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
      `)
      .eq('booking_id', parseInt(bookingId))
      .single();

    if (error) {
      console.error('Error fetching booking:', error);
      return errorResponse('Failed to fetch booking', 500);
    }

    if (!booking) {
      return errorResponse('Booking not found', 404);
    }

    // Get user details using service role
    let userData = {
      id: booking.user_id,
      email: 'N/A',
      full_name: `User ${booking.user_id.substring(0, 8)}...`,
      phone: 'N/A'
    };

    try {
      const { data: authUser, error: userError } = await supabase.auth.admin.getUserById(booking.user_id);
      if (!userError && authUser?.user) {
        userData = {
          id: authUser.user.id,
          email: authUser.user.email || 'N/A',
          full_name: authUser.user.user_metadata?.full_name || 
                    authUser.user.user_metadata?.name || 
                    authUser.user.email?.split('@')[0] || 'Unknown User',
          phone: authUser.user.user_metadata?.phone || authUser.user.phone || 'N/A',
        };
      }
    } catch (userError) {
      console.error('Error fetching user data:', userError);
    }

    // Format response
    const formattedBooking = {
      booking_id: booking.booking_id,
      user_id: booking.user_id,
      user_name: userData.full_name,
      user_email: userData.email,
      user_phone: userData.phone,
      variant_id: booking.variant_id,
      variant_name: (booking as any).variants?.variant_name || 'N/A',
      model_name: (booking as any).variants?.models?.model_name || 'N/A',
      brand_name: (booking as any).variants?.models?.brands?.brand_name || 'N/A',
      dealer_id: booking.dealer_id,
      dealer_name: (booking as any).dealers?.name || 'N/A',
      dealer_phone: (booking as any).dealers?.phone || 'N/A',
      dealer_email: (booking as any).dealers?.email || 'N/A',
      booking_date: booking.booking_date,
      status: booking.status,
      price: booking.price,
      notes: booking.notes,
      created_at: booking.created_at
    };

    return NextResponse.json({
      success: true,
      booking: formattedBooking
    });

  } catch (error) {
    console.error('Admin booking fetch API error:', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminSupabaseClient(); // Use admin client
    const bookingId = params.id;
    
    // Get authorization header
    const authorization = request.headers.get('authorization');
    if (!authorization?.startsWith('Bearer ')) {
      return errorResponse('Invalid authorization header', 401);
    }

    const body = await request.json();
    const { status, notes } = body;

    if (!bookingId) {
      return errorResponse('Booking ID is required', 400);
    }

    const updates: any = {};
    if (status) updates.status = status;
    if (notes !== undefined) updates.notes = notes;

    const { data: booking, error } = await supabase
      .from('bookings')
      .update(updates)
      .eq('booking_id', parseInt(bookingId))
      .select()
      .single();

    if (error) {
      console.error('Error updating booking:', error);
      return errorResponse('Failed to update booking', 500);
    }

    return NextResponse.json({
      success: true,
      booking
    });

  } catch (error) {
    console.error('Admin booking update API error:', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminSupabaseClient();
    const bookingId = params.id;
    
    // Get authorization header
    const authorization = request.headers.get('authorization');
    if (!authorization?.startsWith('Bearer ')) {
      return errorResponse('Invalid authorization header', 401);
    }

    if (!bookingId) {
      return errorResponse('Booking ID is required', 400);
    }

    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('booking_id', parseInt(bookingId));

    if (error) {
      console.error('Error deleting booking:', error);
      return errorResponse('Failed to delete booking', 500);
    }

    return NextResponse.json({
      success: true,
      message: 'Booking deleted successfully'
    });

  } catch (error) {
    console.error('Admin booking delete API error:', error);
    return errorResponse('Internal server error', 500);
  }
}