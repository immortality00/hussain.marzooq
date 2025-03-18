import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';

/**
 * Set authentication cookie handler
 */
async function postHandler(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { token, expiresIn } = body;

    if (!token) {
      logger.warn('No token provided to setAuthCookie');
      return NextResponse.json({ success: false, error: 'No token provided' }, { status: 400 });
    }

    // Convert expiresIn to seconds, default to 1 hour if not provided
    const maxAgeInSeconds = expiresIn ? Math.floor(expiresIn / 1000) : 60 * 60;
    
    // Create a response with the success status
    const response = NextResponse.json({ success: true });
    
    // Set the cookie on the response
    response.cookies.set({
      name: 'firebase-auth-token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: maxAgeInSeconds
    });

    // Add a specific header to confirm cookie was set (helps with debugging)
    response.headers.set('X-Auth-Cookie-Set', 'true');
    
    logger.info('Auth cookie set successfully');
    return response;
  } catch (error) {
    logger.error('Error setting auth cookie:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to set authentication cookie' },
      { status: 500 }
    );
  }
}

/**
 * Clear authentication cookie handler
 */
async function deleteHandler() {
  try {
    // Create a response with the success status
    const response = NextResponse.json({ success: true });
    
    // Clear the cookie by setting an expired date
    response.cookies.set({
      name: 'firebase-auth-token',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 0 // Expire immediately
    });
    
    // Add a specific header to confirm cookie was deleted (helps with debugging)
    response.headers.set('X-Auth-Cookie-Cleared', 'true');
    
    logger.info('Auth cookie cleared successfully');
    return response;
  } catch (error) {
    logger.error('Error clearing auth cookie:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clear authentication cookie' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/auth/setAuthCookie
 * 
 * Sets the firebase-auth-token cookie
 */
export const POST = postHandler;

/**
 * DELETE /api/auth/setAuthCookie
 * 
 * Clears the firebase-auth-token cookie
 */
export const DELETE = deleteHandler; 