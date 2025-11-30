import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

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

    // Get the user's integer ID from email in users table
    const { data: userRecord, error: userError } = await (supabase as any)
      .from('users')
      .select('user_id')
      .eq('email', user.email)
      .single();

    if (userError || !userRecord) {
      console.error('Error finding user in users table:', userError);
      return NextResponse.json({
        success: false,
        error: 'User not found in database'
      }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Fetch user's bike submissions with bike details
    const { data, error } = await (supabase as any)
      .from('user_bike_submissions')
      .select(`
        id,
        submission_status,
        notes,
        created_at,
        updated_at,
        used_bikes (
          id,
          brand,
          model,
          variant,
          year,
          category,
          fuel_type,
          transmission,
          km_driven,
          ownership,
          expected_price,
          condition,
          description,
          city,
          state,
          photos,
          status,
          admin_notes,
          verified,
          featured,
          created_at,
          updated_at,
          approved_at,
          sold_at
        )
      `)
      .eq('user_id', userRecord.user_id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching user bike submissions:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch your bike submissions'
      }, { status: 500 });
    }

    // Get total count for pagination
    const { count } = await (supabase as any)
      .from('user_bike_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userRecord.user_id);

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
    console.error('API /user-bike-submissions error:', err);
    return NextResponse.json({
      success: false,
      error: 'Unexpected server error'
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
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

    // Get the user's integer ID from email in users table
    const { data: userRecord, error: userError } = await (supabase as any)
      .from('users')
      .select('user_id')
      .eq('email', user.email)
      .single();

    if (userError || !userRecord) {
      console.error('Error finding user in users table:', userError);
      return NextResponse.json({
        success: false,
        error: 'User not found in database'
      }, { status: 404 });
    }

    const body = await request.json();
    const { submissionId, submission_status, notes } = body;

    if (!submissionId) {
      return NextResponse.json({
        success: false,
        error: 'Submission ID is required'
      }, { status: 400 });
    }

    // Validate submission_status if provided
    if (submission_status && !['active', 'cancelled', 'withdrawn'].includes(submission_status)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid submission status'
      }, { status: 400 });
    }

    // Update the user's submission
    const updateData: any = {};
    if (submission_status) updateData.submission_status = submission_status;
    if (notes !== undefined) updateData.notes = notes;

    const { data, error } = await (supabase as any)
      .from('user_bike_submissions')
      .update(updateData)
      .eq('id', submissionId)
      .eq('user_id', userRecord.user_id) // Ensure user can only update their own submissions
      .select()
      .single();

    if (error) {
      console.error('Error updating user bike submission:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to update submission'
      }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({
        success: false,
        error: 'Submission not found or access denied'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Submission updated successfully',
      data
    });

  } catch (err) {
    console.error('API /user-bike-submissions PATCH error:', err);
    return NextResponse.json({
      success: false,
      error: 'Unexpected server error'
    }, { status: 500 });
  }
}