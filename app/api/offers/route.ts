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
    const brand = searchParams.get('brand');
    const location = searchParams.get('location');
    const offerType = searchParams.get('offerType');
    const active = searchParams.get('active') !== 'false'; // Default to active offers

    let query = supabase
      .from('bike_offers')
      .select('*');

    // Apply filters
    if (brand && brand !== 'All Brands') {
      query = query.eq('brand', brand); // Changed from brand_name to brand
    }
    
    if (location && location !== 'All Locations') {
      query = query.eq('location', location);
    }
    
    if (offerType && offerType !== 'All Types') {
      query = query.eq('offer_type', offerType);
    }

    // Only show active offers for public API - make this optional for now
    if (active) {
      // Check if is_active column exists, if not just skip this filter
      // query = query.eq('is_active', true)
      
      // Check if valid_till exists and is not expired
      // For now, let's skip date filtering to see all offers
      // query = query.gte('valid_till', new Date().toISOString());
    }

    // Order by created date
    query = query.order('created_at', { ascending: false });

    const { data: offers, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return errorResponse('Failed to fetch offers', 500);
    }

    // Debug logging
    console.log('Fetched offers from database:', offers);
    console.log('Number of offers:', offers?.length || 0);

    return successResponse(offers || [], 'Offers fetched successfully');
  } catch (error) {
    console.error('Server error:', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    
    // Check if user is admin (add your admin auth logic here)
    const body = await request.json();
    
    // Calculate discount_amount if not provided
    let offerData = { ...body };
    
    if (offerData.original_price && offerData.offer_price) {
      // Calculate discount amount from prices
      offerData.discount_amount = parseFloat((offerData.original_price - offerData.offer_price).toFixed(2));
      
      // Calculate discount percentage if not provided
      if (!offerData.discount_percent) {
        offerData.discount_percent = parseFloat(((offerData.discount_amount / offerData.original_price) * 100).toFixed(2));
      }
    } else if (offerData.original_price && offerData.discount_percent) {
      // Calculate discount amount from percentage
      offerData.discount_amount = parseFloat(((offerData.original_price * offerData.discount_percent) / 100).toFixed(2));
      
      // Calculate offer price if not provided
      if (!offerData.offer_price) {
        offerData.offer_price = parseFloat((offerData.original_price - offerData.discount_amount).toFixed(2));
      }
    } else {
      // Default values if calculations can't be made
      offerData.discount_amount = 0;
      if (!offerData.discount_percent) offerData.discount_percent = 0;
    }
    
    const { data: newOffer, error } = await (supabase as any)
      .from('bike_offers')
      .insert([offerData])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return errorResponse('Failed to create offer', 500);
    }

    console.log('Created offer:', newOffer); // Debug logging

    return successResponse({
      offer: newOffer
    }, 'Offer created successfully', 201);
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
    const { id, ...updateData } = body;
    
    console.log('PUT request - ID:', id, 'Update data:', updateData); // Debug logging
    
    if (!id) {
      return errorResponse('Offer ID is required', 400);
    }
    
    // Calculate discount_amount if not provided
    let offerData = { ...updateData };
    
    if (offerData.original_price && offerData.offer_price) {
      // Calculate discount amount from prices
      offerData.discount_amount = parseFloat((offerData.original_price - offerData.offer_price).toFixed(2));
      
      // Calculate discount percentage if not provided
      if (!offerData.discount_percent) {
        offerData.discount_percent = parseFloat(((offerData.discount_amount / offerData.original_price) * 100).toFixed(2));
      }
    } else if (offerData.original_price && offerData.discount_percent) {
      // Calculate discount amount from percentage
      offerData.discount_amount = parseFloat(((offerData.original_price * offerData.discount_percent) / 100).toFixed(2));
      
      // Calculate offer price if not provided
      if (!offerData.offer_price) {
        offerData.offer_price = parseFloat((offerData.original_price - offerData.discount_amount).toFixed(2));
      }
    }

    const { data: updatedOffer, error } = await (supabase as any)
      .from('bike_offers')
      .update(offerData)
      .eq('id', id)
      .select()
      .single();

    console.log('Database update - Error:', error, 'Updated offer:', updatedOffer); // Debug logging

    if (error) {
      console.error('Database error:', error);
      return errorResponse('Failed to update offer', 500);
    }

    return successResponse(updatedOffer, 'Offer updated successfully');
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
      return errorResponse('Offer ID is required', 400);
    }

    const { error } = await (supabase as any)
      .from('bike_offers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Database error:', error);
      return errorResponse('Failed to delete offer', 500);
    }

    return successResponse(null, 'Offer deleted successfully');
  } catch (error) {
    console.error('Server error:', error);
    return errorResponse('Internal server error', 500);
  }
}