import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  // Allow API endpoints to be accessed without authentication
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return response;
  }

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin') && request.nextUrl.pathname !== '/admin/login') {
    // Check for auth cookies
    const nextAuthCookie = request.cookies.get('next-auth.session-token') || 
                          request.cookies.get('__Secure-next-auth.session-token'); // Secure cookie in production
    const firebaseAuthCookie = request.cookies.get('firebase-auth-token');
    
    if (!nextAuthCookie && !firebaseAuthCookie) {
      console.log('No auth cookies found, redirecting to login');
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Prevent access to login page if already authenticated
  if (request.nextUrl.pathname === '/admin/login') {
    // Check for auth cookies
    const nextAuthCookie = request.cookies.get('next-auth.session-token') || 
                          request.cookies.get('__Secure-next-auth.session-token'); // Secure cookie in production
    const firebaseAuthCookie = request.cookies.get('firebase-auth-token');
    
    if (nextAuthCookie || firebaseAuthCookie) {
      console.log('Auth cookies found, redirecting to dashboard');
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 