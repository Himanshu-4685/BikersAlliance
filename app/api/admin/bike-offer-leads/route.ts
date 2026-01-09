import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const bike_name = searchParams.get('bike_name');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = (supabase as any)
      .from('bike_offer_leads')
      .select('*');

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    
    if (bike_name) {
      query = query.ilike('bike_name', `%${bike_name}%`);
    }

    // Order by created date (newest first)
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: leads, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      return errorResponse('Failed to fetch leads', 500);
    }

    return successResponse({
      leads: leads || [],
      total: count || 0,
      limit,
      offset
    }, 'Leads fetched successfully');
  } catch (error) {
    console.error('Server error:', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    
    const body = await request.json();
    const { id, status, notes } = body;
    
    if (!id) {
      return errorResponse('Lead ID is required', 400);
    }

    // Build update object with only the fields we want to update
    const updateFields: any = {};
    if (status !== undefined) updateFields.status = status;
    if (notes !== undefined) updateFields.notes = notes;
    updateFields.updated_at = new Date().toISOString();

    const { data: updatedLead, error } = await (supabase as any)
      .from('bike_offer_leads')
      .update(updateFields)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return errorResponse('Failed to update lead', 500);
    }

    return successResponse(updatedLead, 'Lead updated successfully');
  } catch (error) {
    console.error('Server error:', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return errorResponse('Lead ID is required', 400);
    }

    const { error } = await (supabase as any)
      .from('bike_offer_leads')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Database error:', error);
      return errorResponse('Failed to delete lead', 500);
    }

    return successResponse(null, 'Lead deleted successfully');
  } catch (error) {
    console.error('Server error:', error);
    return errorResponse('Internal server error', 500);
  }
}