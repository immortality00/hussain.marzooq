import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('firebase-auth-token');
  const { pathname } = request.nextUrl;

  // Protect all /admin routes except /admin/login
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!authCookie) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Redirect from /admin/login to /admin/dashboard if already authenticated
  if (pathname === '/admin/login' && authCookie) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
}; 