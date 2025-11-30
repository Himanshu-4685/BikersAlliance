import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'your-super-secret-admin-key';

interface AdminRecord {
  id: string;
  name: string;  
  email: string;
  password_hash: string;
  role: string;
  phone?: string;
  profile_image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export async function POST(request: NextRequest) {
  try {
    console.log('Admin login attempt...');
    const { email, password } = await request.json();
    console.log('Login attempt for email:', email);

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Query admin from database with explicit typing
    console.log('Querying admin from database...');
    const { data: adminData, error } = await supabase
      .from('admin')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('is_active', true)
      .single();

    console.log('Database query result:', { data: adminData, error });

    if (error || !adminData) {
      console.log('No admin found or database error:', error);
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }    
      );
    }

    // Cast to our interface to avoid TypeScript issues
    const admin = adminData as AdminRecord;

    // Verify password
    console.log('Verifying password...');
    const passwordMatch = await bcrypt.compare(password, admin.password_hash);
    console.log('Password match:', passwordMatch);
    
    if (!passwordMatch) {
      console.log('Password does not match');
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    console.log('Password verified successfully');

    // Generate JWT token
    const token = jwt.sign(
      { 
        adminId: admin.id,
        email: admin.email,
        role: admin.role
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remove password hash from response
    const { password_hash, ...adminResponse } = admin;

    // Log login action - commented out due to TypeScript issues
    // try {
    //   await supabase
    //     .from('admin_audit_log')
    //     .insert({
    //       admin_id: admin.id,
    //       action: 'LOGIN',
    //       ip_address: request.ip || null,
    //       user_agent: request.headers.get('user-agent') || null
    //     });
    // } catch (logError) {
    //   console.warn('Failed to log admin action:', logError);
    // }

    console.log('Login successful for:', admin.email);
    return NextResponse.json({
      success: true,
      admin: adminResponse,
      token
    });

  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}