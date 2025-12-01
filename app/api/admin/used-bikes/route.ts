import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import jwt from 'jsonwebtoken';

// GET endpoint for admin to fetch all used bike listings
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let query = (supabase as any)
      .from('used_bikes')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply status filter
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Apply search filter
    if (search) {
      query = query.or(`brand.ilike.%${search}%,model.ilike.%${search}%,owner_name.ilike.%${search}%,city.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching used bikes for admin:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 });
    }

    // Get total count
    let countQuery = (supabase as any)
      .from('used_bikes')
      .select('*', { count: 'exact', head: true });

    if (status && status !== 'all') {
      countQuery = countQuery.eq('status', status);
    }
    if (search) {
      countQuery = countQuery.or(`brand.ilike.%${search}%,model.ilike.%${search}%,owner_name.ilike.%${search}%,city.ilike.%${search}%`);
    }

    const { count } = await countQuery;

    // Get status counts for dashboard
    const { data: statusCounts } = await (supabase as any)
      .from('used_bikes')
      .select('status')
      .then((result: any) => {
        if (result.data) {
          const counts = result.data.reduce((acc: any, bike: any) => {
            acc[bike.status] = (acc[bike.status] || 0) + 1;
            return acc;
          }, {});
          return { data: counts };
        }
        return { data: {} };
      });

    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      },
      statusCounts: statusCounts || {}
    });

  } catch (err) {
    console.error('API /admin/used-bikes GET error:', err);
    return NextResponse.json({ 
      success: false, 
      error: 'Unexpected server error' 
    }, { status: 500 });
  }
}

// PUT endpoint for admin to update used bike listings
export async function PUT(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const body = await request.json();
    const { id, status, admin_notes, verified, featured } = body;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Bike ID is required'
      }, { status: 400 });
    }

    const updateData: any = {};
    
    if (status) {
      updateData.status = status;
      if (status === 'approved') {
        updateData.approved_at = new Date().toISOString();
      } else if (status === 'sold') {
        updateData.sold_at = new Date().toISOString();
      }
    }
    
    if (admin_notes !== undefined) {
      updateData.admin_notes = admin_notes;
    }
    
    if (verified !== undefined) {
      updateData.verified = verified;
    }
    
    if (featured !== undefined) {
      updateData.featured = featured;
    }

    const { data, error } = await (supabase as any)
      .from('used_bikes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating used bike:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to update bike listing'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Bike listing updated successfully',
      data
    });

  } catch (err) {
    console.error('API /admin/used-bikes PUT error:', err);
    return NextResponse.json({
      success: false,
      error: 'Unexpected server error. Please try again.'
    }, { status: 500 });
  }
}

// DELETE endpoint for admin to delete used bike listings
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Bike ID is required'
      }, { status: 400 });
    }

    // First get the bike data to delete associated images
    const { data: bikeData, error: fetchError } = await (supabase as any)
      .from('used_bikes')
      .select('photos')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching bike for deletion:', fetchError);
      return NextResponse.json({
        success: false,
        error: 'Bike not found'
      }, { status: 404 });
    }

    // Delete the bike record
    const { error: deleteError } = await (supabase as any)
      .from('used_bikes')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting used bike:', deleteError);
      return NextResponse.json({
        success: false,
        error: 'Failed to delete bike listing'
      }, { status: 500 });
    }

    // TODO: Delete associated images from storage if needed
    // This would require extracting image paths from the photos array
    // and calling supabase.storage.from('sell-bikes').remove(paths)

    return NextResponse.json({
      success: true,
      message: 'Bike listing deleted successfully'
    });

  } catch (err) {
    console.error('API /admin/used-bikes DELETE error:', err);
    return NextResponse.json({
      success: false,
      error: 'Unexpected server error. Please try again.'
    }, { status: 500 });
  }
}

// POST endpoint for admin to create new used bike listings
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'Admin authentication required'
      }, { status: 401 });
    }

    try {
      jwt.verify(token, process.env.ADMIN_JWT_SECRET!);
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Invalid admin token'
      }, { status: 401 });
    }

    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const body = await request.json();
    const {
      // Bike Details
      brand,
      model,
      variant,
      year,
      category,
      fuelType,
      transmission,
      kmDriven,
      ownership,
      
      // Pricing and Condition
      expectedPrice,
      condition,
      description,
      
      // Contact Details
      ownerName,
      email,
      phone,
      city,
      state,
      
      // Documents
      hasRC,
      hasInsurance,
      hasPUC,
      
      // Photos
      photos,
      
      // Admin fields
      status = 'approved' // Admin created bikes are approved by default
    } = body;

    // Validate required fields
    const requiredFields = {
      brand, model, year, category, fuelType, transmission, kmDriven, 
      ownership, expectedPrice, condition, ownerName, email, phone, city, state
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value || value === '')
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid email format'
      }, { status: 400 });
    }

    // Validate phone format (basic validation for Indian numbers)
    const phoneRegex = /^(\+91|91)?[6-9]\d{9}$/;
    if (!phoneRegex.test(phone.replace(/[\s-]/g, ''))) {
      return NextResponse.json({
        success: false,
        error: 'Invalid phone number format'
      }, { status: 400 });
    }

    // Validate year
    const currentYear = new Date().getFullYear();
    if (year < 1990 || year > currentYear) {
      return NextResponse.json({
        success: false,
        error: 'Invalid manufacturing year'
      }, { status: 400 });
    }

    // Validate price
    if (expectedPrice < 1000 || expectedPrice > 10000000) {
      return NextResponse.json({
        success: false,
        error: 'Invalid price range'
      }, { status: 400 });
    }

    // Normalize city name to proper case
    const normalizeCity = (cityName: string) => {
      return cityName
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };

    const insertData = {
      brand,
      model,
      variant: variant || null,
      year: parseInt(year),
      category,
      fuel_type: fuelType,
      transmission,
      km_driven: parseInt(kmDriven),
      ownership,
      expected_price: parseInt(expectedPrice),
      condition,
      description: description || null,
      owner_name: ownerName,
      email,
      phone,
      city: normalizeCity(city),
      state,
      has_rc: hasRC || false,
      has_insurance: hasInsurance || false,
      has_puc: hasPUC || false,
      photos: photos || [],
      status: status, // Admin can set status directly
      verified: true, // Admin created bikes are verified
      approved_at: status === 'approved' ? new Date().toISOString() : null
    };

    const { data, error } = await (supabase as any)
      .from('used_bikes')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Error inserting used bike (admin):', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to create bike listing'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Bike listing created successfully',
      data
    });

  } catch (err) {
    console.error('API /admin/used-bikes POST error:', err);
    return NextResponse.json({
      success: false,
      error: 'Unexpected server error. Please try again.'
    }, { status: 500 });
  }
}