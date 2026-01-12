import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse('Not authenticated', 401);
    }

    const body = await request.json();
    const { user_id } = body;

    if (!user_id) {
      return errorResponse('User ID is required', 400);
    }

    // Get all bookings for this user
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('variant_id')
      .eq('user_id', user_id);

    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError);
      return errorResponse('Failed to fetch bookings', 500);
    }

    if (!bookings || bookings.length === 0) {
      return successResponse({ message: 'No bookings found, nothing to clean up', removed: 0 });
    }

    const bookedVariantIds = bookings.map((booking: any) => booking.variant_id);

    // Remove orders that have been booked
    const { data: deletedOrders, error: deleteError } = await supabase
      .from('user_orders')
      .delete()
      .eq('user_id', user_id)
      .in('variant_id', bookedVariantIds)
      .select('id, variant_id, bike_name');

    if (deleteError) {
      console.error('Error deleting booked orders:', deleteError);
      return errorResponse('Failed to clean up orders', 500);
    }

    return successResponse({
      message: `Successfully cleaned up ${deletedOrders?.length || 0} booked orders`,
      removed: deletedOrders?.length || 0,
      removedOrders: deletedOrders || []
    });

  } catch (error) {
    console.error('Cleanup API error:', error);
    return errorResponse('Internal server error', 500);
  }
}