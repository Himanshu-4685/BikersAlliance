import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple authentication check (replace with your actual authentication logic)
async function getSession(request: NextRequest) {
  // You can implement your own session verification logic here
  // For example using cookies, JWT, or headers
  const sessionCookie = request.cookies.get('auth-token');
  
  // Return a simple session object or null if no session exists
  return sessionCookie ? { user: { id: 'user-id' } } : null;
}

export async function middleware(request: NextRequest) {
  // Get session using the new method
  const session = await getSession(request);
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
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/register',
    '/forgot-password'
  ],
};
