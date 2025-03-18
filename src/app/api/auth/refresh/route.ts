import { NextResponse } from 'next/server';
import { rotateRefreshToken } from '@/lib/auth/authOptions';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/authOptions';
import { getRepository } from '@/lib/database/strategy';

interface User {
  id: string;
  email: string;
  name?: string;
}

/**
 * Handles token refresh requests
 * POST /api/auth/refresh
 */
export async function POST() {
  try {
    // Get current session
    const session = await getServerSession(authOptions);
    
    // If no session or refresh token, return unauthorized
    if (!session || !session.refreshToken) {
      return NextResponse.json(
        { error: 'No valid session found' },
        { status: 401 }
      );
    }
    
    // Rotate the refresh token
    const result = await rotateRefreshToken(session.refreshToken);
    
    if (!result) {
      return NextResponse.json(
        { error: 'Invalid or expired refresh token' },
        { status: 401 }
      );
    }
    
    // Get user data to include in response
    const userRepository = getRepository<User>('users');
    const user = await userRepository.getById(result.userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Return new tokens and minimal user data
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      refreshToken: result.newToken
    });
    
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: 'Failed to refresh token' },
      { status: 500 }
    );
  }
} 