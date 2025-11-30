import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Use service role client to access all data
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface RouteContext {
  params: {
    id: string;
  };
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
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

    const userId = params.id;

    // Delete user from auth.users (this will cascade to public.users if triggers are set up)
    const { error: authDeleteError } = await supabase.auth.admin.deleteUser(userId);

    if (authDeleteError) {
      console.error('Error deleting user from auth:', authDeleteError);
      return NextResponse.json({ 
        error: 'Failed to delete user',
        details: authDeleteError.message 
      }, { status: 500 });
    }

    // Also try to delete from public.users if it exists
    const { error: publicDeleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    // We don't fail if public.users delete fails, as auth deletion is primary
    if (publicDeleteError) {
      console.warn('Could not delete from public.users:', publicDeleteError);
    }

    // Log the admin action
    try {
      await supabase
        .from('admin_audit_log')
        .insert({
          admin_id: decoded.adminId,
          action: 'DELETE_USER',
          table_name: 'users',
          record_id: userId,
          timestamp: new Date().toISOString()
        });
    } catch (logError) {
      console.warn('Failed to log admin action:', logError);
    }

    return NextResponse.json({ 
      message: 'User deleted successfully',
      userId 
    });

  } catch (error) {
    console.error('Admin user delete API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest, { params }: RouteContext) {
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

    const userId = params.id;

    // Try to get user from public.users first
    const { data: publicUser, error: publicError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (publicUser) {
      const formattedUser = {
        user_id: publicUser.id,
        id: publicUser.id,
        full_name: publicUser.full_name,
        email: publicUser.email,
        phone: publicUser.phone,
        created_at: publicUser.created_at,
        Img_url: publicUser.avatar_url,
        updated_at: publicUser.updated_at
      };

      return NextResponse.json({ user: formattedUser });
    }

    // Fallback to auth.users
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);

    if (authError) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const formattedUser = {
      user_id: authUser.user.id,
      id: authUser.user.id,
      full_name: authUser.user.user_metadata?.full_name || authUser.user.user_metadata?.name || null,
      email: authUser.user.email,
      phone: authUser.user.user_metadata?.phone || authUser.user.phone || null,
      created_at: authUser.user.created_at,
      Img_url: authUser.user.user_metadata?.avatar_url || null,
      updated_at: authUser.user.updated_at || authUser.user.created_at,
      email_confirmed: authUser.user.email_confirmed_at !== null,
      last_sign_in: authUser.user.last_sign_in_at
    };

    return NextResponse.json({ user: formattedUser });

  } catch (error) {
    console.error('Admin user get API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
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

    const userId = params.id;
    const body = await request.json();
    const { email, full_name, phone, password } = body;

    // Prepare update data for auth.users
    const updateData: any = {
      user_metadata: {
        full_name: full_name || null,
        phone: phone || null
      }
    };

    // Include email if provided
    if (email) {
      updateData.email = email;
    }

    // Include password if provided
    if (password && password.trim() !== '') {
      updateData.password = password;
    }

    // Update user in Supabase Auth
    const { data: updatedUser, error: authError } = await supabase.auth.admin.updateUserById(
      userId,
      updateData
    );

    if (authError) {
      console.error('Error updating user in auth:', authError);
      return NextResponse.json({ 
        error: 'Failed to update user',
        details: authError.message 
      }, { status: 500 });
    }

    // Also update in public.users if table exists
    const publicUpdateData: any = {};
    if (email) publicUpdateData.email = email;
    if (full_name !== undefined) publicUpdateData.full_name = full_name;
    if (phone !== undefined) publicUpdateData.phone = phone;

    if (Object.keys(publicUpdateData).length > 0) {
      const { error: publicError } = await supabase
        .from('users')
        .update({
          ...publicUpdateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      // Don't fail if public.users update fails
      if (publicError) {
        console.warn('Could not update public.users:', publicError);
      }
    }

    // Log the admin action
    try {
      await supabase
        .from('admin_audit_log')
        .insert({
          admin_id: decoded.adminId,
          action: 'UPDATE_USER',
          table_name: 'users',
          record_id: userId,
          new_values: { email, full_name, phone },
          timestamp: new Date().toISOString()
        });
    } catch (logError) {
      console.warn('Failed to log admin action:', logError);
    }

    const formattedUser = {
      user_id: updatedUser.user.id,
      id: updatedUser.user.id,
      full_name: updatedUser.user.user_metadata?.full_name || null,
      email: updatedUser.user.email,
      phone: updatedUser.user.user_metadata?.phone || null,
      created_at: updatedUser.user.created_at,
      Img_url: updatedUser.user.user_metadata?.avatar_url || null,
      updated_at: updatedUser.user.updated_at || new Date().toISOString()
    };

    return NextResponse.json({
      message: 'User updated successfully',
      user: formattedUser
    });

  } catch (error) {
    console.error('Admin user update API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}