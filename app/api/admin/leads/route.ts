import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Use service role client to access all data
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper function to verify admin authentication
async function verifyAdminAuth(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized');
  }

  const token = authHeader.substring(7);
  const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET!) as any;

  if (!decoded.adminId) {
    throw new Error('Invalid token');
  }

  return decoded;
}

// GET - Fetch leads with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminAuth = await verifyAdminAuth(request);
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const leadType = searchParams.get('lead_type') || '';
    const status = searchParams.get('status') || '';
    const dateFrom = searchParams.get('date_from') || '';
    const dateTo = searchParams.get('date_to') || '';
    const assignedTo = searchParams.get('assigned_to') || '';

    const offset = (page - 1) * limit;

    // Build the query - remove foreign key join until schema is updated
    let query = supabase
      .from('leads')
      .select('*', { count: 'exact' });

    // Add filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%,bike_name.ilike.%${search}%`);
    }

    if (leadType && ['get_on_road_price', 'book_test_ride'].includes(leadType)) {
      query = query.eq('lead_type', leadType);
    }

    if (status && ['new', 'contacted', 'qualified', 'closed'].includes(status)) {
      query = query.eq('status', status);
    }

    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }

    if (dateTo) {
      query = query.lte('created_at', dateTo);
    }

    // Remove assignedTo filter until schema is updated
    // if (assignedTo) {
    //   query = query.eq('assigned_to', assignedTo);
    // }

    // Add pagination and ordering
    query = query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    const { data: leads, count, error } = await query;

    if (error) {
      console.error('Error fetching leads:', error);
      return NextResponse.json(
        { error: 'Failed to fetch leads' },
        { status: 500 }
      );
    }

    // Get admin users for assignment dropdown
    const { data: admins } = await supabase
      .from('admin')
      .select('id, name, email')
      .eq('is_active', true)
      .order('name');

    return NextResponse.json({
      leads: leads || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
      admins: admins || []
    });

  } catch (error) {
    console.error('Admin leads GET error:', error);
    const status = error instanceof Error && error.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status }
    );
  }
}

// PUT/PATCH - Update lead status, assignment, or add admin notes
export async function PUT(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminAuth = await verifyAdminAuth(request);
    
    const body = await request.json();
    const { id, status, assigned_to, admin_notes } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Lead ID is required' },
        { status: 400 }
      );
    }

    // Validate status if provided - using original status values
    if (status && !['new', 'contacted', 'qualified', 'closed'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    // Get the current lead data for audit log
    const { data: currentLead } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .single();

    if (!currentLead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (status) updateData.status = status;
    // Skip assigned_to and admin_notes until schema is updated
    // if (assigned_to !== undefined) updateData.assigned_to = assigned_to || null;
    // if (admin_notes !== undefined) updateData.admin_notes = admin_notes;

    // Update the lead - remove foreign key join until schema is updated
    const { data: updatedLead, error: updateError } = await supabase
      .from('leads')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (updateError) {
      console.error('Error updating lead:', updateError);
      return NextResponse.json(
        { error: 'Failed to update lead' },
        { status: 500 }
      );
    }

    // Log the admin action
    try {
      await supabase
        .from('admin_audit_log')
        .insert({
          admin_id: adminAuth.adminId,
          action: 'UPDATE_LEAD',
          table_name: 'leads',
          record_id: id,
          old_values: {
            status: currentLead.status
          },
          new_values: updateData
        });
    } catch (logError) {
      console.warn('Failed to log admin action:', logError);
    }

    return NextResponse.json({
      message: 'Lead updated successfully',
      lead: updatedLead
    });

  } catch (error) {
    console.error('Admin leads PUT error:', error);
    const status = error instanceof Error && error.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status }
    );
  }
}

// DELETE - Delete a lead (soft delete by updating status to canceled)
export async function DELETE(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminAuth = await verifyAdminAuth(request);
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Lead ID is required' },
        { status: 400 }
      );
    }

    // Get the current lead data for audit log
    const { data: currentLead } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .single();

    if (!currentLead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    // Soft delete by updating status to closed (using original status values)
    const { error: deleteError } = await supabase
      .from('leads')
      .update({ 
        status: 'closed',
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting lead:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete lead' },
        { status: 500 }
      );
    }

    // Log the admin action
    try {
      await supabase
        .from('admin_audit_log')
        .insert({
          admin_id: adminAuth.adminId,
          action: 'DELETE_LEAD',
          table_name: 'leads',
          record_id: id,
          old_values: currentLead,
          new_values: { status: 'closed', deleted: true }
        });
    } catch (logError) {
      console.warn('Failed to log admin action:', logError);
    }

    return NextResponse.json({
      message: 'Lead deleted successfully'
    });

  } catch (error) {
    console.error('Admin leads DELETE error:', error);
    const status = error instanceof Error && error.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status }
    );
  }
}