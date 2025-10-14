import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return NextResponse.json(
        { 
          success: false, 
          error: error.message 
        }, 
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });
    
  } catch (error) {
    console.error('Logout API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      }, 
      { status: 500 }
    );
  }
}
