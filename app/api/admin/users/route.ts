import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Use service role client to access all data
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    // Check authorization
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET!) as any;

    if (!decoded.adminId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    const offset = (page - 1) * limit;

    // First, try to get users from public.users table (if the triggers have been run)
    let query = supabase
      .from('users')
      .select('*', { count: 'exact' });

    // Add search filter if provided
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Add pagination
    query = query.range(offset, offset + limit - 1);

    const { data: publicUsers, count: publicCount, error: publicError } = await query;

    // If public.users has data, use it
    if (publicUsers && publicUsers.length > 0) {
      const formattedUsers = publicUsers.map(user => ({
        user_id: user.id, // Using UUID as user_id for consistency
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        created_at: user.created_at,
        Img_url: user.avatar_url,
        updated_at: user.updated_at
      }));

      return NextResponse.json({
        users: formattedUsers,
        total: publicCount || 0,
        page,
        limit
      });
    }

    // If public.users is empty, fallback to auth.users (requires service role)
    console.log('Falling back to auth.users table...');

    // Query auth.users directly using the service role client
    // Note: This requires service role key and should be used carefully
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers({
      page: page,
      perPage: limit
    });

    if (authError) {
      console.error('Error fetching from auth.users:', authError);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    // Format auth users data to match expected format
    const formattedAuthUsers = authUsers.users.map(user => ({
      user_id: user.id,
      id: user.id,
      full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
      email: user.email,
      phone: user.user_metadata?.phone || user.phone || null,
      created_at: user.created_at,
      Img_url: user.user_metadata?.avatar_url || null,
      updated_at: user.updated_at || user.created_at,
      email_confirmed: user.email_confirmed_at !== null,
      last_sign_in: user.last_sign_in_at
    }));

    return NextResponse.json({
      users: formattedAuthUsers,
      total: authUsers.total || formattedAuthUsers.length,
      page,
      limit,
      source: 'auth.users' // Indicate source for debugging
    });

  } catch (error) {
    console.error('Admin users API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Handle POST request for creating new users
export async function POST(request: NextRequest) {
  try {
    // Check authorization
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET!) as any;

    if (!decoded.adminId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { email, password, full_name, phone } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json({ 
        error: 'Email and password are required' 
      }, { status: 400 });
    }

    // Create user in Supabase Auth
    const { data: newUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        full_name: full_name || null,
        phone: phone || null
      },
      email_confirm: true // Auto-confirm email for admin-created users
    });

    if (authError) {
      console.error('Error creating user in auth:', authError);
      return NextResponse.json({ 
        error: 'Failed to create user',
        details: authError.message 
      }, { status: 500 });
    }

    // Also create in public.users if table exists
    const { error: publicError } = await supabase
      .from('users')
      .insert({
        id: newUser.user.id,
        email: newUser.user.email,
        full_name: full_name || null,
        phone: phone || null
      });

    // Don't fail if public.users insert fails (might not have triggers set up)
    if (publicError) {
      console.warn('Could not insert into public.users:', publicError);
    }

    // Send welcome email asynchronously (don't wait for it to complete)
    if (newUser.user && full_name) {
      sendWelcomeEmail(email, full_name).catch(error => {
        console.error('Failed to send welcome email:', error);
        // Don't fail the user creation if email sending fails
      });
    }

    // Log the admin action
    try {
      await supabase
        .from('admin_audit_log')
        .insert({
          admin_id: decoded.adminId,
          action: 'CREATE_USER',
          table_name: 'users',
          record_id: newUser.user.id,
          new_values: { email, full_name, phone },
          timestamp: new Date().toISOString()
        });
    } catch (logError) {
      console.warn('Failed to log admin action:', logError);
    }

    const formattedUser = {
      user_id: newUser.user.id,
      id: newUser.user.id,
      full_name: full_name || null,
      email: newUser.user.email,
      phone: phone || null,
      created_at: newUser.user.created_at,
      Img_url: null,
      updated_at: newUser.user.created_at
    };

    return NextResponse.json({
      message: 'User created successfully',
      user: formattedUser
    });

  } catch (error) {
    console.error('Admin user create API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Helper function to send welcome email
async function sendWelcomeEmail(email: string, fullName: string): Promise<void> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/welcome-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, fullName }),
    });

    if (response.ok) {
      console.log('✅ Welcome email sent successfully to admin-created user');
    } else {
      const error = await response.json();
      console.error('❌ Failed to send welcome email:', error);
    }
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
  }
}