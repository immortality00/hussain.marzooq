import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Security headers
const securityHeaders = {
  'X-DNS-Prefetch-Control': 'off',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; connect-src 'self' https://*.firebaseio.com https://*.googleapis.com https://firestore.googleapis.com https://*.cloudfunctions.net; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.firebaseapp.com https://*.googleapis.com https://apis.google.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; frame-src https://*.firebaseapp.com;"
};

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || 'unknown';
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;

  // Apply security headers to all responses
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Rate limiting for login attempts
  if (pathname === '/admin/login') {
    const ipAddress = getClientIp(request);
    const loginAttempts = request.cookies.get(`login_attempts_${ipAddress}`);
    const lastAttempt = request.cookies.get(`last_attempt_${ipAddress}`);

    if (loginAttempts && lastAttempt) {
      const attempts = parseInt(loginAttempts.value);
      const lastAttemptTime = parseInt(lastAttempt.value);
      const now = Date.now();

      // If too many attempts within 15 minutes
      if (attempts >= 5 && now - lastAttemptTime < 15 * 60 * 1000) {
        return new NextResponse('Too many login attempts. Please try again later.', {
          status: 429,
          headers: {
            'Retry-After': '900', // 15 minutes in seconds
          },
        });
      }
    }
  }

  // Protect admin routes
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const authCookie = request.cookies.get('firebase-auth-token');
    
    if (!authCookie) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Additional security check for admin routes
    if (!request.headers.get('sec-fetch-site')) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Prevent access to login page if already authenticated
  if (pathname === '/admin/login') {
    const authCookie = request.cookies.get('firebase-auth-token');
    if (authCookie) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 