import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    // Input validation
    if (!name || !email || !password) {
      return errorResponse('Name, email and password are required', 400);
    }

    // Initialize Supabase client
    const supabase = createServerClient();

    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: 'USER' // Default role
        }
      }
    });

    if (error) {
      return errorResponse(error.message, 409);
    }

    // Return the user information
    return successResponse({
      user: data.user,
      message: 'Registration successful'
    });
  } catch (error) {
    console.error('Registration error:', error);
    return errorResponse('Registration failed', 500);
  }
}