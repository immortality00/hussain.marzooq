import { encrypt, decrypt } from './encryption';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';

const CSRF_COOKIE_NAME = 'csrf-token';
const CSRF_HEADER_NAME = 'X-CSRF-Token';
const CSRF_TOKEN_EXPIRY = 1000 * 60 * 60; // 1 hour in milliseconds

/**
 * Generate a CSRF token and set it as a cookie
 * @returns The generated CSRF token
 */
export async function generateCsrfToken(): Promise<string> {
  // Create a random token
  const token = Math.random().toString(36).substring(2, 15) + 
                Math.random().toString(36).substring(2, 15);
  
  // Create a JSON payload with the token and expiry
  const payload = JSON.stringify({
    token,
    expires: Date.now() + CSRF_TOKEN_EXPIRY
  });
  
  // Encrypt the payload
  const encryptedPayload = await encrypt(payload);
  
  // Set the cookie with the encrypted payload
  const cookieStore = cookies();
  cookieStore.set({
    name: CSRF_COOKIE_NAME,
    value: encryptedPayload,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: CSRF_TOKEN_EXPIRY / 1000 // Convert to seconds
  });
  
  return token;
}

/**
 * Validate a CSRF token against the cookie
 * @param request The Next.js request object
 * @returns True if token is valid, false otherwise
 */
export async function validateCsrfToken(request: NextRequest): Promise<boolean> {
  try {
    // Get the token from the header
    const headerToken = request.headers.get(CSRF_HEADER_NAME);
    if (!headerToken) {
      logger.warn('CSRF validation failed: No CSRF token in header');
      return false;
    }
    
    // Get the encrypted payload from the cookie
    const cookieToken = request.cookies.get(CSRF_COOKIE_NAME);
    if (!cookieToken) {
      logger.warn('CSRF validation failed: No CSRF cookie found');
      return false;
    }
    
    // Decrypt the cookie payload
    const decryptedPayload = await decrypt(cookieToken.value);
    if (!decryptedPayload) {
      logger.warn('CSRF validation failed: Could not decrypt cookie');
      return false;
    }
    
    // Parse the payload
    const payload = JSON.parse(decryptedPayload);
    
    // Check if the token has expired
    if (payload.expires < Date.now()) {
      logger.warn('CSRF validation failed: Token expired');
      return false;
    }
    
    // Compare the token from the header with the one from the cookie
    if (headerToken !== payload.token) {
      logger.warn('CSRF validation failed: Token mismatch');
      return false;
    }
    
    // All checks passed
    return true;
  } catch (error) {
    logger.error('Error validating CSRF token:', error);
    return false;
  }
}

/**
 * Apply CSRF protection to an API route
 * @param handler The API route handler function
 * @returns A wrapped handler that applies CSRF protection
 */
export function withCsrfProtection<T>(
  handler: (request: NextRequest) => Promise<NextResponse<T>>
) {
  return async (request: NextRequest) => {
    // Skip CSRF check for GET, HEAD, OPTIONS requests (they should be idempotent)
    const method = request.method.toUpperCase();
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      return handler(request);
    }
    
    // For all other methods, validate the CSRF token
    const isValid = await validateCsrfToken(request);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 }) as NextResponse<T>;
    }
    
    // If valid, proceed with the handler
    return handler(request);
  };
}

/**
 * Get the CSRF token for use in forms
 * Creates a new token if none exists
 * @returns The CSRF token
 */
export async function getCsrfToken(): Promise<string> {
  try {
    // Get the existing token from the cookie
    const cookieStore = cookies();
    const csrfCookie = cookieStore.get(CSRF_COOKIE_NAME);
    
    if (csrfCookie) {
      // Try to decrypt and validate the existing token
      try {
        const decryptedPayload = await decrypt(csrfCookie.value);
        if (decryptedPayload) {
          const payload = JSON.parse(decryptedPayload);
          
          // If the token is still valid, return it
          if (payload.expires > Date.now()) {
            return payload.token;
          }
        }
      } catch (error) {
        // If decryption fails, we'll generate a new token
        logger.warn('Failed to decrypt existing CSRF token, generating new one');
      }
    }
    
    // If we get here, we need to generate a new token
    return await generateCsrfToken();
  } catch (error) {
    logger.error('Error getting CSRF token:', error);
    return '';
  }
} 