import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { getRepository } from '@/lib/database/strategy';
import { v4 as uuidv4 } from 'uuid';

// Define the User type
interface User {
  id: string;
  email: string;
  name?: string;
  password?: string;
  emailVerified?: Date;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Interface for refresh tokens
interface RefreshToken {
  id: string;
  userId: string;
  token: string;
  family: string;
  expiresAt: Date;
  createdAt: Date;
  used: boolean;
}

// Generate a secure random token
const generateToken = () => uuidv4();

// Generate a token family ID to track chains of refresh tokens
const generateTokenFamily = () => uuidv4();

// Token expiration times
const ACCESS_TOKEN_EXPIRY = 60 * 60; // 1 hour in seconds
const REFRESH_TOKEN_EXPIRY = 14 * 24 * 60 * 60; // 14 days in seconds

// Function to create a new refresh token
const createRefreshToken = async (userId: string, family?: string): Promise<string> => {
  const tokenRepository = getRepository<RefreshToken>('refreshTokens');
  
  const token = generateToken();
  const tokenFamily = family || generateTokenFamily();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + REFRESH_TOKEN_EXPIRY * 1000);
  
  await tokenRepository.create({
    userId,
    token,
    family: tokenFamily,
    expiresAt,
    used: false
  });
  
  return token;
};

// Function to validate a refresh token and issue a new one
export const rotateRefreshToken = async (token: string): Promise<{ newToken: string, userId: string } | null> => {
  const tokenRepository = getRepository<RefreshToken>('refreshTokens');
  
  // Find the token
  const tokens = await tokenRepository.getAll({
    where: { token }
  });
  
  if (tokens.length === 0) {
    return null; // Token not found
  }
  
  const refreshToken = tokens[0];
  
  // Check if token has been used before (potential token reuse attack)
  if (refreshToken.used) {
    console.warn(`Token reuse detected for userId: ${refreshToken.userId}, family: ${refreshToken.family}`);
    
    // Potential reuse attack - invalidate ALL tokens for this user
    // This is more secure than just invalidating the family
    const userTokens = await tokenRepository.getAll({
      where: { userId: refreshToken.userId }
    });
    
    // Delete all tokens for this user
    for (const userToken of userTokens) {
      await tokenRepository.delete(userToken.id);
    }
    
    // Track this incident for security monitoring
    // In a real app, you might want to log this to a security monitoring system
    try {
      await getRepository('securityEvents').create({
        type: 'token_reuse_attack',
        userId: refreshToken.userId,
        details: {
          tokenFamily: refreshToken.family,
          detectedAt: new Date()
        },
        severity: 'high',
        createdAt: new Date()
      });
    } catch (err) {
      // Don't block the security response if logging fails
      console.error('Failed to log security event:', err);
    }
    
    return null;
  }
  
  // Check if token is expired
  if (new Date() > new Date(refreshToken.expiresAt)) {
    await tokenRepository.delete(refreshToken.id);
    return null;
  }
  
  // Mark the current token as used
  await tokenRepository.update(refreshToken.id, { used: true });
  
  // Create a new token in the same family
  const newToken = await createRefreshToken(refreshToken.userId, refreshToken.family);
  
  return {
    newToken,
    userId: refreshToken.userId
  };
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        try {
          // Use our repository pattern to get the user from Firebase
          const userRepository = getRepository<User>('users');
          // Use the findUnique method we added for compatibility
          const user = await userRepository.findUnique({ email: credentials.email });

          if (!user || !user.password) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: ACCESS_TOKEN_EXPIRY, // 1 hour instead of 30 days
  },
  callbacks: {
    jwt: async ({ token, user, trigger, session }) => {
      // When a user signs in, add their ID to the token
      if (user) {
        token.id = user.id;
        token.email = user.email;
        
        // Generate a refresh token when a user first signs in
        const refreshToken = await createRefreshToken(user.id);
        token.refreshToken = refreshToken;
      }
      
      // Handle token refresh
      if (trigger === 'update' && session?.refreshToken) {
        const result = await rotateRefreshToken(session.refreshToken);
        if (result) {
          token.refreshToken = result.newToken;
        }
      }
      
      return token;
    },
    session: async ({ session, token }) => {
      if (token) {
        session.user = {
          ...session.user,
          id: token.id as string,
        };
        
        // Pass refresh token to the session so it can be used for refreshing
        session.refreshToken = token.refreshToken as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
  
  // Add custom events for logging
  events: {
    async signIn({ user }) {
      console.log(`User signed in: ${user.email}`);
    },
    async signOut({ token }) {
      console.log(`User signed out: ${token.email}`);
      // TODO: Invalidate refresh tokens on sign out
    },
  },
}; 