import { NextRequest, NextResponse } from 'next/server';
import { generateCsrfToken } from '@/lib/utils/csrf';
import { logger } from '@/lib/utils/logger';

/**
 * GET /api/csrf
 * 
 * Generate a new CSRF token and return it to the client
 * Sets a cookie with the encrypted token
 */
export async function GET(request: NextRequest) {
  try {
    // Get headers directly from the request
    const origin = request.headers.get('origin') || '';
    const host = request.headers.get('host') || '';
    const referer = request.headers.get('referer') || '';
    
    // For production, verify origin to prevent CSRF token generation from other domains
    if (process.env.NODE_ENV === 'production') {
      const allowedOrigins = [
        `https://${host}`,
        process.env.NEXT_PUBLIC_SITE_URL,
        'https://portfolio-9a22c.web.app'
      ].filter(Boolean) as string[];
      
      // If origin is set, check if it's allowed
      if (origin && !allowedOrigins.includes(origin)) {
        logger.warn(`Invalid origin requesting CSRF token: ${origin}`);
        return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
      }
      
      // If referer is set, check if it's from an allowed domain
      if (referer && !allowedOrigins.some(allowed => referer.startsWith(allowed))) {
        logger.warn(`Invalid referer requesting CSRF token: ${referer}`);
        return NextResponse.json({ error: 'Invalid referer' }, { status: 403 });
      }
    }
    
    // Generate a new CSRF token (this also sets the cookie)
    const token = await generateCsrfToken();
    
    // Return the token to the client
    return NextResponse.json({ 
      token,
      expires: Date.now() + (60 * 60 * 1000) // 1 hour in milliseconds
    });
  } catch (error) {
    logger.error('Error generating CSRF token:', error);
    return NextResponse.json({ error: 'Failed to generate CSRF token' }, { status: 500 });
  }
} 