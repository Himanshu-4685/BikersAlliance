import { createClient as createClientServer } from '@/utils/supabase/server';
import { createClient as createClientMiddleware } from '@/utils/supabase/middleware';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { Database, TypedSupabaseClient } from './supabase-client';

// Server-side Supabase instance (for use in Server Components)
export const createServerClient = () => {
  const cookieStore = cookies();
  return createClientServer(cookieStore) as TypedSupabaseClient;
};

// Middleware Supabase instance (for use in middleware.ts)
export const createMiddlewareClient = (req: NextRequest) => {
  const { supabase, response } = createClientMiddleware(req);
  return { supabase: supabase as TypedSupabaseClient, response };
};

// Helper function to get signed-in user in server components
export async function getUser() {
  const supabase = createServerClient();
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}