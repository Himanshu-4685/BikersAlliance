import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email, password, action } = await request.json();

    if (!email || (!password && action !== 'logout')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields' 
        }, 
        { status: 400 }
      );
    }

    let data, error;

    // Handle different authentication actions
    switch (action) {
      case 'signin':
        ({ data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        }));
        break;
        
      case 'signup':
        ({ data, error } = await supabase.auth.signUp({
          email,
          password,
        }));
        break;
        
      case 'resetpassword':
        ({ data, error } = await supabase.auth.resetPasswordForEmail(email));
        break;
        
      case 'logout':
        ({ error } = await supabase.auth.signOut());
        break;
        
      default:
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid action' 
          }, 
          { status: 400 }
        );
    }

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
      data: action === 'logout' ? null : data,
    });
    
  } catch (error) {
    console.error('Auth API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      }, 
      { status: 500 }
    );
  }
}