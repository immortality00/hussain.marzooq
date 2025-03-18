import { NextRequest, NextResponse } from 'next/server';
import { SessionAdapter } from '@/lib/utils/sessionAdapter';

// GET /api/session/validate - Check if the current session is valid
export async function GET(request: NextRequest) {
  try {
    // Validate session exists
    const session = await SessionAdapter.readSessionFromRequest(request);
    
    if (!session) {
      return NextResponse.json({ valid: false }, { status: 401 });
    }
    
    // The client will handle detailed validation of the session data
    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error('Error validating session:', error);
    return NextResponse.json({ error: 'Failed to validate session' }, { status: 500 });
  }
} 