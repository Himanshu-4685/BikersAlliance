import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'your-super-secret-admin-key';

// GET - Export subscribers as CSV
export async function GET(request: NextRequest) {
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

    const url = new URL(request.url);
    const status = url.searchParams.get('status') || 'active';

    const supabase = createServerClient();

    // Get all subscribers with the specified status
    const { data: subscribers, error } = await supabase
      .from('newsletter_subscriptions')
      .select('email, status, subscribed_at, created_at')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch subscribers' },
        { status: 500 }
      );
    }

    // Generate CSV content
    const headers = ['Email', 'Status', 'Subscribed At', 'Created At'];
    const csvContent = [
      headers.join(','),
      ...(subscribers || []).map((subscriber: any) => [
        subscriber.email,
        subscriber.status,
        new Date(subscriber.subscribed_at).toLocaleDateString(),
        new Date(subscriber.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n');

    // Return CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="newsletter-subscribers-${status}-${new Date().toISOString().split('T')[0]}.csv"`
      }
    });

  } catch (error) {
    console.error('Newsletter export API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}