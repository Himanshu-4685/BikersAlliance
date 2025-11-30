import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token_hash = searchParams.get('token_hash');
    const type = searchParams.get('type');

    if (!token_hash || !type) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing verification parameters' 
        }, 
        { status: 400 }
      );
    }

    const supabase = createServerClient();
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as any,
    });

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
      message: 'Email verified successfully',
      data
    });
    
  } catch (error) {
    console.error('Verify API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      }, 
      { status: 500 }
    );
  }
}
