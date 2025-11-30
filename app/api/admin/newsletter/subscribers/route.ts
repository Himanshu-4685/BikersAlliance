import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'your-super-secret-admin-key';

// GET - List newsletter subscribers with pagination and search
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
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';

    const offset = (page - 1) * limit;

    const supabase = createServerClient();
    
    // Build query with filters
    let query = supabase
      .from('newsletter_subscriptions')
      .select('*', { count: 'exact' });

    if (search) {
      query = query.ilike('email', `%${search}%`);
    }

    if (status) {
      query = query.eq('status', status);
    }

    // Get paginated data
    const { data: subscribers, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch subscribers' },
        { status: 500 }
      );
    }

    // Get stats
    const statsTable = supabase.from('newsletter_subscriptions') as any;
    const statsResult = await statsTable.select('status');
    const totalSubscribers = statsResult.data?.length || 0;
    const activeSubscribers = statsResult.data?.filter((sub: any) => sub.status === 'active').length || 0;

    const stats = {
      totalSubscribers,
      activeSubscribers,
      totalCampaigns: 0, // TODO: Implement campaigns table
      averageOpenRate: 0 // TODO: Implement campaign stats
    };

    return NextResponse.json({
      success: true,
      subscribers: subscribers || [],
      total: count || 0,
      stats: stats
    });

  } catch (error) {
    console.error('Newsletter subscribers API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Add new subscriber (for manual addition)
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { email } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Valid email is required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Check if email already exists
    const { data: existing } = await supabase
      .from('newsletter_subscriptions')
      .select('email')
      .eq('email', email.toLowerCase())
      .single();

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Email already subscribed' },
        { status: 409 }
      );
    }

    // Add new subscriber
    const insertTable = supabase.from('newsletter_subscriptions') as any;
    const { data: subscriber, error } = await insertTable
      .insert({
        email: email.toLowerCase(),
        status: 'active',
        subscribed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to add subscriber' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      subscriber
    });

  } catch (error) {
    console.error('Newsletter subscribers API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}