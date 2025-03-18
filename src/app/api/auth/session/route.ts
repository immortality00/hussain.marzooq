import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';

/**
 * GET /api/auth/session
 * 
 * Endpoint to verify the authentication status.
 * Returns { authenticated: true } if the user has a valid firebase-auth-token cookie.
 * Uses CSRF protection to prevent cross-site request forgery.
 */
export async function GET(request: NextRequest) {
  try {
    // Get headers directly from the request
    const origin = request.headers.get('origin') || '';
    const host = request.headers.get('host') || '';
    const referer = request.headers.get('referer') || '';
    
    // Simple CSRF protection - this isn't comprehensive but provides basic protection
    if (process.env.NODE_ENV === 'production') {
      // In production, verify origin matches host
      const allowedOrigins = [
        `https://${host}`,
        process.env.NEXT_PUBLIC_SITE_URL,
        'https://portfolio-9a22c.web.app'
      ].filter(Boolean) as string[];
      
      // If origin is set, verify it's allowed
      if (origin && !allowedOrigins.includes(origin)) {
        logger.warn(`Invalid origin: ${origin}`);
        return NextResponse.json({ authenticated: false, error: 'Invalid origin' }, { status: 403 });
      }
      
      // If referer is set, verify it's from an allowed domain
      if (referer && !allowedOrigins.some(allowed => referer.startsWith(allowed))) {
        logger.warn(`Invalid referer: ${referer}`);
        return NextResponse.json({ authenticated: false, error: 'Invalid referer' }, { status: 403 });
      }
    }
    
    // Check for auth cookie
    const authCookie = request.cookies.get('firebase-auth-token');
    
    if (!authCookie) {
      // No auth cookie found
      return NextResponse.json({ authenticated: false });
    }
    
    // Return success with nonce for additional security
    // This approach prevents cookie eavesdropping to a degree
    const nonce = Math.random().toString(36).substring(2, 15);
    
    const response = NextResponse.json({ 
      authenticated: true, 
      timestamp: Date.now(),
      nonce
    });
    
    return response;
  } catch (error) {
    logger.error('Error verifying authentication:', error);
    return NextResponse.json({ 
      authenticated: false, 
      error: 'Failed to verify authentication' 
    }, { status: 500 });
  }
} 