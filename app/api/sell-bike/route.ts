import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { sendBikeSubmissionConfirmation } from '@/lib/sell-bike-email-service';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required. Please login to sell your bike.'
      }, { status: 401 });
    }

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
      photos
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
      status: 'pending'
    };

    const { data, error } = await (supabase as any)
      .from('used_bikes')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Error inserting used bike:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to submit bike listing'
      }, { status: 500 });
    }

    // Get the user's integer ID from email in users table
    const { data: userRecord, error: userError } = await (supabase as any)
      .from('users')
      .select('user_id')
      .eq('email', user.email)
      .single();

    if (userError || !userRecord) {
      console.error('Error finding user in users table:', userError);
      
      // Send confirmation email even if user tracking fails
      console.log('📧 Sending confirmation email to bike owner...');
      const bikeData = {
        id: data.id,
        brand,
        model,
        variant: variant || '',
        year: year.toString(),
        expectedPrice: expectedPrice.toString(),
        ownerName,
        email,
        phone,
        city: normalizeCity(city),
        state
      };
      
      try {
        await sendBikeSubmissionConfirmation(bikeData);
        console.log('✅ Confirmation email sent successfully');
      } catch (emailError) {
        console.error('❌ Failed to send confirmation email:', emailError);
      }
      
      // Still return success for the bike listing, but log the tracking error
      return NextResponse.json({
        success: true,
        message: 'Your bike listing has been submitted successfully! We will review it and get back to you.',
        data,
        warning: 'User tracking may not be available'
      });
    }

    // Now create the user submission tracking record
    const { error: submissionError } = await (supabase as any)
      .from('user_bike_submissions')
      .insert({
        user_id: userRecord.user_id,
        used_bike_id: data.id,
        submission_status: 'active'
      });

    if (submissionError) {
      console.error('Error creating user submission tracking:', submissionError);
      // We don't fail the entire request if this fails, but we log it
      // The bike listing was still created successfully
    }

    // Send confirmation email to the owner
    console.log('📧 Sending confirmation email to bike owner...');
    const bikeData = {
      id: data.id,
      brand,
      model,
      variant: variant || '',
      year: year.toString(),
      expectedPrice: expectedPrice.toString(),
      ownerName,
      email,
      phone,
      city: normalizeCity(city),
      state
    };
    
    try {
      await sendBikeSubmissionConfirmation(bikeData);
      console.log('✅ Confirmation email sent successfully');
    } catch (emailError) {
      console.error('❌ Failed to send confirmation email:', emailError);
      // Don't fail the entire request if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Your bike listing has been submitted successfully! We will review it and get back to you.',
      data
    });

  } catch (err) {
    console.error('API /sell-bike error:', err);
    return NextResponse.json({
      success: false,
      error: 'Unexpected server error. Please try again.'
    }, { status: 500 });
  }
}

// GET endpoint for public listings (approved bikes)
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const brand = searchParams.get('brand');
    const category = searchParams.get('category');
    const fuelType = searchParams.get('fuelType');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const city = searchParams.get('city');
    const state = searchParams.get('state');

    let query = (supabase as any)
      .from('used_bikes')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (brand) {
      query = query.eq('brand', brand);
    }
    if (category) {
      query = query.eq('category', category);
    }
    if (fuelType) {
      query = query.eq('fuel_type', fuelType);
    }
    if (minPrice) {
      query = query.gte('expected_price', parseInt(minPrice));
    }
    if (maxPrice) {
      query = query.lte('expected_price', parseInt(maxPrice));
    }
    if (city) {
      query = query.ilike('city', `%${city}%`);
    }
    if (state) {
      query = query.eq('state', state);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching used bikes:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 });
    }

    // Get total count for pagination
    let countQuery = (supabase as any)
      .from('used_bikes')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved');

    // Apply same filters to count query
    if (brand) countQuery = countQuery.eq('brand', brand);
    if (category) countQuery = countQuery.eq('category', category);
    if (fuelType) countQuery = countQuery.eq('fuel_type', fuelType);
    if (minPrice) countQuery = countQuery.gte('expected_price', parseInt(minPrice));
    if (maxPrice) countQuery = countQuery.lte('expected_price', parseInt(maxPrice));
    if (city) countQuery = countQuery.ilike('city', `%${city}%`);
    if (state) countQuery = countQuery.eq('state', state);

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
    console.error('API /sell-bike GET error:', err);
    return NextResponse.json({ 
      success: false, 
      error: 'Unexpected server error' 
    }, { status: 500 });
  }
}