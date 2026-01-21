import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Protected routes that require authentication
  const protectedRoutes = [
    '/dashboard',
    '/dashboard/orders',
    '/dashboard/shortlisted',
    '/dashboard/activity',
    '/dashboard/consents',
    '/dashboard/settings'
  ];
  
  // Auth routes that should redirect to dashboard if already logged in
  const authRoutes = ['/login', '/register', '/forgot-password'];
  
  // Video routes that need special handling (but not maintenance or API routes)
  const videoRoutes = ['/videos'];
  const isVideoRoute = videoRoutes.some(route => pathname.startsWith(route)) && 
                       !pathname.startsWith('/videos/maintenance') && 
                       !pathname.startsWith('/api/');
  
  // Create a Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  // Create response
  const res = NextResponse.next();
  
  // Create a Supabase client with the Request and Response
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name) {
        return request.cookies.get(name)?.value;
      },
      set(name, value, options) {
        request.cookies.set({
          name,
          value,
          ...options,
        });
        res.cookies.set({
          name,
          value,
          ...options,
        });
      },
      remove(name, options) {
        request.cookies.set({
          name,
          value: '',
          ...options,
        });
        res.cookies.set({
          name,
          value: '',
          ...options,
        });
      },
    },
  });
  
  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession();

  // Handle video routes - check if videos are available
  if (isVideoRoute) {
    try {
      const { data, error } = await (supabase as any)
        .from('videos')
        .select('id')
        .eq('is_published', true)
        .limit(1);
      
      // If no videos found or there's an error, redirect to maintenance page
      if (error || !data || data.length === 0) {
        const maintenanceUrl = new URL('/videos/maintenance', request.url);
        return NextResponse.redirect(maintenanceUrl);
      }
    } catch (err) {
      // On any error, redirect to maintenance page
      const maintenanceUrl = new URL('/videos/maintenance', request.url);
      return NextResponse.redirect(maintenanceUrl);
    }
  }

  // Redirect from protected routes to login if not authenticated
  if (protectedRoutes.some(route => pathname.startsWith(route)) && !session) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }
  
  // Redirect from auth routes to dashboard if already authenticated
  if (authRoutes.includes(pathname) && session) {
    const redirectUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Return the response with updated cookies
  return res;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/register',
    '/forgot-password',
    '/videos/:path*'
  ],
};
