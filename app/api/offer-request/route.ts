import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, mobile, offerId, bikeName, dealerName, offerTitle, offerPrice, originalPrice, discountPercent } = body;

    // Validate required fields
    if (!name || !email || !mobile) {
      return NextResponse.json(
        { error: 'Name, email, and mobile number are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate mobile number (10 digits)
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(mobile)) {
      return NextResponse.json(
        { error: 'Mobile number must be 10 digits' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Save to database
    const { data, error } = await (supabase as any)
      .from('bike_offer_leads')
      .insert([
        {
          name,
          email,
          mobile,
          offer_id: offerId,
          bike_name: bikeName,
          dealer_name: dealerName,
          offer_title: offerTitle,
          offer_price: offerPrice,
          original_price: originalPrice,
          discount_percent: discountPercent,
          status: 'new'
        }
      ])
      .select();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to save lead information' },
        { status: 500 }
      );
    }

    // Log the successful submission
    console.log('New bike offer lead saved:', {
      id: data[0]?.id,
      name,
      email,
      mobile,
      bikeName,
      timestamp: new Date().toISOString()
    });

    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json(
      { 
        success: true, 
        message: 'Offer request submitted successfully! We will contact you soon.',
        leadId: data[0]?.id
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error processing offer request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle GET requests (optional - for testing)
export async function GET() {
  return NextResponse.json(
    { message: 'Offer request API endpoint is working' },
    { status: 200 }
  );
}