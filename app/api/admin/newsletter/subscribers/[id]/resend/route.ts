import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'your-super-secret-admin-key';

interface RouteContext {
  params: { id: string };
}

// POST - Resend newsletter to subscriber
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    try {
      jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { id } = context.params;
    const supabase = createServerClient();

    // Get subscriber details
    const { data: subscriber, error: fetchError } = await supabase
      .from('newsletter_subscriptions')
      .select('email, status')
      .eq('id', id)
      .single();

    if (fetchError || !subscriber) {
      return NextResponse.json(
        { success: false, error: 'Subscriber not found' },
        { status: 404 }
      );
    }

    const subscriberData = subscriber as { email: string; status: string };

    // Resend the welcome email using the same logic as the newsletter API
    try {
      const resendResponse = await fetch(`${request.nextUrl.origin}/api/newsletter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: subscriberData.email,
          resend: true // Flag to indicate this is a resend
        }),
      });

      const resendData = await resendResponse.json();

      if (resendResponse.ok) {
        // Update the updated_at timestamp to track when newsletter was last sent
        await (supabase as any)
          .from('newsletter_subscriptions')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', id);

        return NextResponse.json({
          success: true,
          message: `Newsletter successfully resent to ${subscriberData.email}`
        });
      } else {
        return NextResponse.json({
          success: false,
          error: resendData.error || 'Failed to resend newsletter'
        }, { status: 500 });
      }
    } catch (emailError) {
      console.error('Error resending newsletter:', emailError);
      return NextResponse.json({
        success: false,
        error: 'Failed to send newsletter email'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Newsletter resend API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}