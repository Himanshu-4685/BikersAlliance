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

    // Send welcome email asynchronously (don't wait for it to complete)
    if (data.user) {
      sendWelcomeEmail(email, name).catch(error => {
        console.error('Failed to send welcome email:', error);
        // Don't fail the registration if email sending fails
      });
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
      console.log('✅ Welcome email sent successfully');
    } else {
      const error = await response.json();
      console.error('❌ Failed to send welcome email:', error);
    }
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
  }
}