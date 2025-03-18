import { NextRequest, NextResponse } from 'next/server';
import { SessionAdapter } from '@/lib/utils/sessionAdapter';

// PUT /api/session/activity - Update last activity timestamp
export async function PUT(request: NextRequest) {
  try {
    // Verify session exists
    const session = await SessionAdapter.readSessionFromRequest(request);
    
    if (!session) {
      return NextResponse.json({ error: 'No active session' }, { status: 401 });
    }
    
    // Since we're just validating the session exists,
    // the client will handle updating the activity timestamp
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating session activity:', error);
    return NextResponse.json({ error: 'Failed to update session activity' }, { status: 500 });
  }
} 