import { NextRequest, NextResponse } from 'next/server';
import { sendBookingConfirmationEmail, sendBookingStatusUpdateEmail } from '@/lib/email-booking';

// Test API endpoint for email notifications
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, email, ...testData } = body;

    // Validate required fields
    if (!type || !email) {
      return NextResponse.json(
        { success: false, error: 'Type and email are required' },
        { status: 400 }
      );
    }

    // Default test booking data
    const defaultBookingData = {
      booking_id: 12345,
      user_email: email,
      user_name: testData.user_name || 'Test User',
      brand_name: testData.brand_name || 'TVS',
      model_name: testData.model_name || 'Scooty Pep Plus',
      variant_name: testData.variant_name || 'Glossy',
      price: testData.price || 76694,
      booking_date: testData.booking_date || new Date().toISOString(),
      status: testData.status || 'pending',
      dealer_name: testData.dealer_name || 'TVS Showroom Mumbai',
      dealer_phone: testData.dealer_phone || '+91-9876543210',
      dealer_email: testData.dealer_email || 'dealer@tvs.com'
    };

    let result = false;
    let emailType = '';

    if (type === 'confirmation') {
      emailType = 'Booking Confirmation';
      result = await sendBookingConfirmationEmail(defaultBookingData);
    } else if (type === 'status_update') {
      emailType = 'Booking Status Update';
      const statusUpdateData = {
        ...defaultBookingData,
        status: testData.status || 'confirmed'
      };
      result = await sendBookingStatusUpdateEmail(statusUpdateData);
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid type. Use "confirmation" or "status_update"' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: result,
      message: result 
        ? `${emailType} email sent successfully`
        : `${emailType} email failed to send`,
      data: defaultBookingData
    });

  } catch (error) {
    console.error('Email test API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Get endpoint for testing instructions
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Booking Email Test API',
    usage: {
      endpoint: '/api/test/email-booking',
      method: 'POST',
      examples: [
        {
          description: 'Test booking confirmation email',
          payload: {
            type: 'confirmation',
            email: 'your-test-email@example.com',
            user_name: 'John Doe',
            brand_name: 'Honda',
            model_name: 'Activa',
            variant_name: '6G',
            price: 75000
          }
        },
        {
          description: 'Test booking status update email',
          payload: {
            type: 'status_update',
            email: 'your-test-email@example.com',
            user_name: 'John Doe',
            status: 'confirmed',
            brand_name: 'Honda',
            model_name: 'Activa'
          }
        }
      ]
    },
    environment: {
      resend_configured: !!process.env.RESEND_API_KEY,
      from_email: process.env.FROM_EMAIL || 'onboarding@resend.dev'
    }
  });
}