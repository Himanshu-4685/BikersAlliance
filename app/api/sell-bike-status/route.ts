import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { sendBikeStatusChangeNotification } from '@/lib/sell-bike-email-service';

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Check authentication - only admins should be able to change bike status
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    // TODO: Add admin role check here
    // For now, we'll allow any authenticated user (you may want to restrict this)
    
    const body = await request.json();
    const { bikeId, newStatus, adminNotes } = body;

    // Validate required fields
    if (!bikeId || !newStatus) {
      return NextResponse.json({
        success: false,
        error: 'bikeId and newStatus are required'
      }, { status: 400 });
    }

    // Validate status values
    if (!['pending', 'approved', 'rejected'].includes(newStatus)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid status. Must be pending, approved, or rejected'
      }, { status: 400 });
    }

    // Get the current bike details before updating
    const { data: currentBike, error: fetchError } = await (supabase as any)
      .from('used_bikes')
      .select('*')
      .eq('id', bikeId)
      .single();

    if (fetchError || !currentBike) {
      console.error('Error fetching bike details:', fetchError);
      return NextResponse.json({
        success: false,
        error: 'Bike not found'
      }, { status: 404 });
    }

    // Update the bike status
    const { data: updatedBike, error: updateError } = await (supabase as any)
      .from('used_bikes')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', bikeId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating bike status:', updateError);
      return NextResponse.json({
        success: false,
        error: 'Failed to update bike status'
      }, { status: 500 });
    }

    // Send email notification if status changed from pending to approved/rejected
    if (currentBike.status === 'pending' && (newStatus === 'approved' || newStatus === 'rejected')) {
      console.log(`📧 Sending ${newStatus} notification to bike owner...`);
      
      const bikeData = {
        id: updatedBike.id,
        brand: updatedBike.brand,
        model: updatedBike.model,
        variant: updatedBike.variant || '',
        year: updatedBike.year?.toString() || '',
        expectedPrice: updatedBike.expected_price?.toString() || '',
        ownerName: updatedBike.owner_name,
        email: updatedBike.email,
        phone: updatedBike.phone,
        city: updatedBike.city,
        state: updatedBike.state
      };
      
      try {
        await sendBikeStatusChangeNotification(bikeData, newStatus, adminNotes);
        console.log(`✅ ${newStatus} notification sent successfully`);
      } catch (emailError) {
        console.error(`❌ Failed to send ${newStatus} notification:`, emailError);
        // Don't fail the entire request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: `Bike status updated to ${newStatus} successfully`,
      data: updatedBike
    });

  } catch (err) {
    console.error('API /sell-bike-status error:', err);
    return NextResponse.json({
      success: false,
      error: 'Unexpected server error. Please try again.'
    }, { status: 500 });
  }
}

// GET endpoint to fetch bike submissions (for admin use)
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    // TODO: Add admin role check here
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = (supabase as any)
      .from('used_bikes')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by status if provided
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching bike submissions:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch bike submissions'
      }, { status: 500 });
    }

    // Get total count for pagination
    let countQuery = (supabase as any)
      .from('used_bikes')
      .select('*', { count: 'exact', head: true });

    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      countQuery = countQuery.eq('status', status);
    }

    const { count } = await countQuery;

    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    });

  } catch (err) {
    console.error('API /sell-bike-status GET error:', err);
    return NextResponse.json({
      success: false,
      error: 'Unexpected server error. Please try again.'
    }, { status: 500 });
  }
}