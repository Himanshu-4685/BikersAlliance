import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { successResponse, errorResponse } from '@/lib/api-response';
import { sendBookingConfirmationEmail, sendBookingStatusUpdateEmail } from '@/lib/email-booking';

interface BookingRequest {
  user_id: string;
  variant_id: number;
  bike_name: string;
  variant_name: string;
  brand_name: string;
  price: number;
  image_url?: string;
  dealer_id?: number;
  notes?: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse('Not authenticated', 401);
    }

    const body: BookingRequest = await request.json();
    
    // Validate required fields
    if (!body.user_id || !body.variant_id || !body.bike_name || !body.variant_name || !body.price) {
      return errorResponse('Missing required fields', 400);
    }

    // Check if user already has a booking for this variant
    const { data: existingBooking, error: checkError } = await supabase
      .from('bookings')
      .select('booking_id')
      .eq('user_id', body.user_id)
      .eq('variant_id', body.variant_id)
      .single();

    if (existingBooking) {
      return errorResponse('You already have a booking for this bike', 409);
    }

    // Create the booking - ensure user_id is passed as string (UUID)
    const { data: booking, error: insertError } = await supabase
      .from('bookings')
      .insert({
        user_id: body.user_id, // This should be UUID string from auth.users
        variant_id: body.variant_id,
        dealer_id: body.dealer_id || null,
        booking_date: new Date().toISOString(),
        status: 'pending',
        price: body.price,
        notes: body.notes || `Booking for ${body.brand_name} ${body.bike_name} - ${body.variant_name}`
      } as any)
      .select()
      .single();

    if (insertError) {
      console.error('Error creating booking:', insertError);
      // Check if it's a type error and provide helpful message
      if (insertError.code === '22P02') {
        return errorResponse('Database schema mismatch: Please contact administrator to update bookings table', 500);
      }
      return errorResponse('Failed to create booking', 500);
    }

    // Remove the item from user_orders since it's now booked
    const { error: removeOrderError } = await supabase
      .from('user_orders')
      .delete()
      .eq('user_id', body.user_id)
      .eq('variant_id', body.variant_id);

    if (removeOrderError) {
      console.error('Warning: Failed to remove from orders after booking:', removeOrderError);
      // Don't fail the booking for this, just log the warning
    }

    // Get additional booking details for response
    const { data: bookingDetails, error: detailsError } = await supabase
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
          email,
          address,
          city,
          state
        )
      `)
      .eq('booking_id', (booking as any).booking_id)
      .single();

    if (detailsError) {
      console.error('Error fetching booking details:', detailsError);
    }

    // Get user details for email notification
    let userEmail = '';
    let userFullName = '';
    
    try {
      const { data: { user: authUser }, error: authUserError } = await supabase.auth.getUser();
      if (!authUserError && authUser) {
        userEmail = authUser.email || '';
        userFullName = authUser.user_metadata?.full_name || 
                      authUser.user_metadata?.name || 
                      authUser.email?.split('@')[0] || 'Valued Customer';
      }
    } catch (error) {
      console.error('Error getting user details for email:', error);
    }

    // Send booking confirmation email
    if (userEmail) {
      console.log('📤 Sending booking confirmation email...');
      const emailData = {
        booking_id: (booking as any)?.booking_id,
        user_email: userEmail,
        user_name: userFullName,
        brand_name: body.brand_name,
        model_name: body.bike_name,
        variant_name: body.variant_name,
        price: body.price,
        booking_date: (booking as any)?.booking_date,
        status: 'pending',
        dealer_name: (bookingDetails as any)?.dealers?.name || undefined,
        dealer_phone: (bookingDetails as any)?.dealers?.phone || undefined,
        dealer_email: (bookingDetails as any)?.dealers?.email || undefined
      };

      try {
        const emailSent = await sendBookingConfirmationEmail(emailData);
        
        if (!emailSent) {
          console.log('⚠️ Booking confirmation email failed, but booking was created successfully');
        } else {
          console.log('✅ Booking confirmation email sent successfully');
        }
      } catch (emailError) {
        console.error('❌ Error sending booking confirmation email:', emailError);
        // Don't fail the booking for email errors
      }
    } else {
      console.log('⚠️ Could not send booking confirmation email - user email not available');
    }

    return successResponse({
      booking: {
        id: (booking as any)?.booking_id,
        user_id: (booking as any)?.user_id,
        variant_id: (booking as any)?.variant_id,
        dealer_id: (booking as any)?.dealer_id,
        booking_date: (booking as any)?.booking_date,
        status: (booking as any)?.status,
        price: (booking as any)?.price,
        notes: (booking as any)?.notes,
        created_at: (booking as any)?.created_at,
        bike_name: body.bike_name,
        variant_name: body.variant_name,
        brand_name: body.brand_name
      }
    });

  } catch (error) {
    console.error('Booking API error:', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse('Not authenticated', 401);
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const userId = searchParams.get('user_id');
    const search = searchParams.get('search');
    
    console.log('Bookings GET API - Query params:', {
      page, limit, status, userId, search, authUser: user.id
    });
    
    const offset = (page - 1) * limit;

    // Build query
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
    
    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (search) {
      query = query.or(`variants.models.model_name.ilike.%${search}%,variants.models.brands.brand_name.ilike.%${search}%,variants.variant_name.ilike.%${search}%`);
    }

    // Apply pagination and order
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: bookings, error, count } = await query;

    console.log('Bookings query result:', { 
      bookingsCount: bookings?.length || 0, 
      error: error?.message,
      count,
      userId,
      authUserId: user.id
    });

    if (error) {
      console.error('Error fetching bookings:', error);
      return errorResponse('Failed to fetch bookings', 500);
    }

    // Get images for each booking's variant
    const bookingsWithImages = await Promise.all((bookings || []).map(async (booking: any) => {
      const { data: images } = await supabase
        .from('images')
        .select('url')
        .eq('variant_id', booking.variant_id)
        .limit(1);

      return {
        ...booking,
        image_url: images && images.length > 0 ? (images[0] as any).url : null
      };
    }));

    // Format response
    const formattedBookings = bookingsWithImages.map((booking: any) => ({
      booking_id: booking.booking_id,
      user_id: booking.user_id,
      variant_id: booking.variant_id,
      dealer_id: booking.dealer_id,
      booking_date: booking.booking_date,
      status: booking.status,
      price: booking.price,
      notes: booking.notes,
      created_at: booking.created_at,
      variant_name: booking.variants?.variant_name || 'N/A',
      model_name: booking.variants?.models?.model_name || 'N/A',
      brand_name: booking.variants?.models?.brands?.brand_name || 'N/A',
      dealer_name: booking.dealers?.name || 'N/A',
      dealer_phone: booking.dealers?.phone || 'N/A',
      dealer_email: booking.dealers?.email || 'N/A',
      image_url: booking.image_url || '/demo.avif'
    }));

    const totalPages = Math.ceil((count || 0) / limit);

    return successResponse({
      bookings: formattedBookings,
      pagination: {
        current_page: page,
        total_pages: totalPages,
        total_count: count || 0,
        per_page: limit
      }
    });

  } catch (error) {
    console.error('Bookings GET API error:', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerClient();
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse('Not authenticated', 401);
    }

    const body = await request.json();
    const { booking_id, status, notes } = body;

    if (!booking_id) {
      return errorResponse('Booking ID is required', 400);
    }

    // Get current booking details before updating
    const { data: currentBooking, error: currentBookingError } = await supabase
      .from('bookings')
      .select(`
        booking_id,
        user_id,
        variant_id,
        status,
        price,
        booking_date,
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
      .eq('booking_id', booking_id)
      .single();

    if (currentBookingError || !currentBooking) {
      console.error('Error fetching current booking details:', currentBookingError);
      return errorResponse('Booking not found', 404);
    }

    // Check if status is actually changing
    const isStatusChanging = status && (currentBooking as any).status !== status;
    const oldStatus = (currentBooking as any).status;

    const updates: any = {};
    if (status) updates.status = status;
    if (notes !== undefined) updates.notes = notes;
    
    // Always update the updated_at timestamp
    updates.updated_at = new Date().toISOString();

    const { data: booking, error } = await (supabase
      .from('bookings') as any)
      .update(updates)
      .eq('booking_id', booking_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating booking:', error);
      return errorResponse('Failed to update booking', 500);
    }

    // Send email notification for significant status changes
    if (isStatusChanging) {
      try {
        // Get user details
        let userData = {
          email: user.email || '',
          full_name: user.user_metadata?.full_name || 
                    user.user_metadata?.name || 
                    user.email?.split('@')[0] || 'Valued Customer'
        };

        if (userData.email) {
          // Send email for significant status changes
          const shouldSendEmail = (
            (oldStatus === 'pending' && status === 'confirmed') ||
            (status === 'completed') ||
            (status === 'cancelled')
          );

          if (shouldSendEmail) {
            console.log(`📤 Sending booking status update email for ${oldStatus} -> ${status}...`);
            const emailData = {
              booking_id: (currentBooking as any).booking_id,
              user_email: userData.email,
              user_name: userData.full_name,
              brand_name: (currentBooking as any).variants?.models?.brands?.brand_name || 'Unknown',
              model_name: (currentBooking as any).variants?.models?.model_name || 'Unknown',
              variant_name: (currentBooking as any).variants?.variant_name || 'Unknown',
              price: (currentBooking as any).price || 0,
              booking_date: (currentBooking as any).booking_date,
              status: status,
              dealer_name: (currentBooking as any).dealers?.name || undefined,
              dealer_phone: (currentBooking as any).dealers?.phone || undefined,
              dealer_email: (currentBooking as any).dealers?.email || undefined
            };

            try {
              const emailSent = await sendBookingStatusUpdateEmail(emailData);
              
              if (!emailSent) {
                console.log('⚠️ Booking status update email failed, but status was updated successfully');
              } else {
                console.log('✅ Booking status update email sent successfully');
              }
            } catch (emailError) {
              console.error('❌ Error sending booking status update email:', emailError);
            }
          } else {
            console.log(`ℹ️ Status change ${oldStatus} -> ${status} does not trigger email notification`);
          }
        }
      } catch (emailError) {
        console.error('Error in email notification process:', emailError);
      }
    }

    return successResponse({ booking });

  } catch (error) {
    console.error('Booking PUT API error:', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerClient();
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse('Not authenticated', 401);
    }

    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('booking_id');

    if (!bookingId) {
      return errorResponse('Booking ID is required', 400);
    }

    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('booking_id', bookingId);

    if (error) {
      console.error('Error deleting booking:', error);
      return errorResponse('Failed to delete booking', 500);
    }

    return successResponse({ message: 'Booking deleted successfully' });

  } catch (error) {
    console.error('Booking DELETE API error:', error);
    return errorResponse('Internal server error', 500);
  }
}