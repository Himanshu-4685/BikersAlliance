import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      return NextResponse.json(
        { 
          success: false, 
          error: error.message 
        }, 
        { status: 400 }
      );
    }

    if (!data.session) {
      return NextResponse.json({
        success: false,
        authenticated: false,
      });
    }

    // Return session information
    return NextResponse.json({
      success: true,
      authenticated: true,
      user: data.session.user
    });
    
  } catch (error) {
    console.error('Session API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      }, 
      { status: 500 }
    );
  }
}