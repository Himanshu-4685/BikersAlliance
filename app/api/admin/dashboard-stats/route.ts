import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'your-super-secret-admin-key';

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

    const supabase = createServerClient();

    // Fetch dashboard statistics
    const [
      brandsResult,
      modelsResult,
      variantsResult,
      bookingsResult,
      usersResult
    ] = await Promise.allSettled([
      supabase.from('brands').select('brand_id', { count: 'exact', head: true }),
      supabase.from('models').select('model_id', { count: 'exact', head: true }),
      supabase.from('variants').select('variant_id', { count: 'exact', head: true }),
      supabase.from('bookings').select('booking_id', { count: 'exact', head: true }),
      supabase.from('users').select('user_id', { count: 'exact', head: true })
    ]);

    // Extract counts with fallback values
    const totalBrands = brandsResult.status === 'fulfilled' ? (brandsResult.value.count || 0) : 0;
    const totalModels = modelsResult.status === 'fulfilled' ? (modelsResult.value.count || 0) : 0;
    const totalVariants = variantsResult.status === 'fulfilled' ? (variantsResult.value.count || 0) : 0;
    const totalBookings = bookingsResult.status === 'fulfilled' ? (bookingsResult.value.count || 0) : 0;
    const totalUsers = usersResult.status === 'fulfilled' ? (usersResult.value.count || 0) : 0;

    // Calculate monthly growth (simplified - you can implement proper logic)
    const monthlyGrowth = Math.floor(Math.random() * 20) + 5; // Mock data for now

    const stats = {
      totalBrands,
      totalModels,
      totalVariants,
      totalBookings,
      totalUsers,
      monthlyGrowth
    };

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}