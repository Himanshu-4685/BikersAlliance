import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-client';
import jwt from 'jsonwebtoken';

// Helper to verify admin authentication
async function verifyAdminAuth(request: NextRequest): Promise<any | null> {
  const authHeader = request.headers.get('authorization');
  console.log('[TEST] Auth header:', authHeader ? 'Present' : 'Missing');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('[TEST] Invalid auth header format');
    return null;
  }

  const token = authHeader.substring(7);
  console.log('[TEST] Token length:', token.length);
  
  try {
    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET || 'your-super-secret-admin-key') as any;
    console.log('[TEST] Token decoded successfully for admin ID:', decoded.id);
    
    const supabase = createClient();
    const { data: admin, error } = await supabase
      .from('admin')
      .select('*')
      .eq('id', decoded.adminId || decoded.id)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('[TEST] Admin lookup error:', error);
      return null;
    }

    if (!admin) {
      console.log('[TEST] Admin not found or inactive');
      return null;
    }

    console.log('[TEST] Admin verified:', (admin as any).email);
    return admin as any;
  } catch (error) {
    console.error('[TEST] Token verification error:', error);
    return null;
  }
}

// GET /api/admin/reviews/test - Test endpoint
export async function GET(request: NextRequest) {
  console.log('[TEST] Admin reviews test endpoint called');
  
  try {
    const admin = await verifyAdminAuth(request);
    if (!admin) {
      console.log('[TEST] Admin auth failed');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[TEST] Admin auth successful');

    const supabase = createClient();
    
    // Simple query to count reviews
    const { data: reviewCount, error: countError } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('[TEST] Count error:', countError);
      return NextResponse.json({
        success: true,
        message: 'Admin auth working',
        admin: (admin as any).email,
        reviewsTableError: countError.message
      });
    }

    console.log('[TEST] Review count successful');

    // Try to get one review
    const { data: sampleReview, error: sampleError } = await supabase
      .from('reviews')
      .select('*')
      .limit(1)
      .single();

    return NextResponse.json({
      success: true,
      message: 'Admin auth and database access working',
      admin: (admin as any).email,
      totalReviews: reviewCount?.length || 0,
      sampleReview: sampleReview || null,
      sampleError: sampleError?.message || null
    });

  } catch (error) {
    console.error('[TEST] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}