import { NextRequest, NextResponse } from 'next/server';
import { SessionAdapter } from '@/lib/utils/sessionAdapter';
import { validateEncryptedData, decryptAndValidateSession } from '@/lib/utils/sessionValidator';
import { createValidator, Validators } from '@/lib/utils/validator';
import { withValidation } from '@/lib/middleware/validateSchema';

// Request validator for POST endpoint
const sessionPostValidator = createValidator()
  .field('sessionData', Validators.required('Session data is required'));

// Validation middleware
const validateSessionPost = withValidation(() => sessionPostValidator);

// GET /api/session - Get current session
export async function GET(request: NextRequest) {
  try {
    // Read session data
    const session = await SessionAdapter.readSessionFromRequest(request);
    
    if (!session) {
      return NextResponse.json({ error: 'No active session' }, { status: 401 });
    }
    
    // Return the encrypted session data for client-side decryption
    return NextResponse.json({
      sessionData: request.cookies.get('auth_session')?.value,
      active: true
    });
  } catch (error) {
    console.error('Error getting session:', error);
    return NextResponse.json({ error: 'Failed to get session' }, { status: 500 });
  }
}

// POST /api/session - Create new session
export async function POST(request: NextRequest) {
  // First validate the request schema
  const validationResult = await validateSessionPost(request);
  if (validationResult) {
    return validationResult; // Return validation error if there is one
  }

  try {
    const body = await request.json();
    const { sessionData } = body;
    
    // Additional validation beyond schema
    if (!validateEncryptedData(sessionData)) {
      return NextResponse.json({ error: 'Invalid session data format' }, { status: 400 });
    }
    
    // Decrypt and validate session structure
    try {
      await decryptAndValidateSession(sessionData);
    } catch (_error) {
      return NextResponse.json({ error: 'Invalid session data' }, { status: 400 });
    }
    
    // Create response
    const response = NextResponse.json({ success: true });
    
    // Store the encrypted session in a cookie
    response.cookies.set({
      name: 'auth_session',
      value: sessionData,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 14400, // 4 hours
      path: '/'
    });
    
    return response;
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}

// DELETE /api/session - Clear current session
export async function DELETE() {
  return SessionAdapter.clearSessionResponse();
} 