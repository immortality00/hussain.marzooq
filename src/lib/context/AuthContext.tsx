'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  browserLocalPersistence,
  setPersistence,
  browserSessionPersistence
} from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useRouter } from 'next/navigation';
import { logger } from '@/lib/utils/logger';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  authError: string | null;
}

// Create a custom type that extends User to include stsTokenManager
interface ExtendedUser extends User {
  stsTokenManager?: {
    expirationTime: number;
  };
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  isAuthenticated: false,
  authError: null
});

// Constants for authentication
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds
const COOKIE_SET_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

/**
 * Set auth cookie using server endpoint with retry logic
 */
const setAuthCookie = async (token: string, expiresIn: number): Promise<boolean> => {
  let retries = 0;
  
  while (retries < COOKIE_SET_RETRIES) {
    try {
      // Add a unique request ID to prevent caching
      const requestId = Date.now().toString();
      
      const response = await fetch(`/api/auth/setAuthCookie?_=${requestId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, expiresIn }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        logger.info('Auth cookie set successfully');
        return true;
      }
      
      logger.warn(`Failed to set auth cookie (attempt ${retries + 1}/${COOKIE_SET_RETRIES}):`, data.error);
      retries++;
      
      // Wait before retry
      if (retries < COOKIE_SET_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      }
    } catch (error) {
      logger.error(`Error setting auth cookie (attempt ${retries + 1}/${COOKIE_SET_RETRIES}):`, error);
      retries++;
      
      // Wait before retry
      if (retries < COOKIE_SET_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      }
    }
  }
  
  // All retries failed
  return false;
};

/**
 * Verify that the auth cookie was set properly
 */
const verifyCookieSet = async (): Promise<boolean> => {
  try {
    const response = await fetch('/api/auth/session');
    const data = await response.json();
    
    if (data.authenticated) {
      logger.info('Auth cookie verification successful');
      return true;
    } else {
      logger.warn('Auth cookie verification failed:', data.error || 'Cookie not found');
      return false;
    }
  } catch (error) {
    logger.error('Error verifying auth cookie:', error);
    return false;
  }
};

/**
 * Clear auth cookie using server endpoint
 */
const clearAuthCookie = async (): Promise<boolean> => {
  try {
    const response = await fetch('/api/auth/setAuthCookie', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    
    if (data.success) {
      logger.info('Auth cookie cleared successfully');
      return true;
    } else {
      logger.warn('Failed to clear auth cookie:', data.error);
      return false;
    }
  } catch (error) {
    logger.error('Error clearing auth cookie:', error);
    return false;
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  // isOnline is used by offline indicators in the UI and in the login process
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [authError, setAuthError] = useState<string | null>(null);
  // loginAttempts is used to prevent brute force attempts
  const [loginAttempts, setLoginAttempts] = useState<number>(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const router = useRouter();

  // Track whether the client is online
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Function to check if the user's session is valid
  const isSessionValid = (): boolean => {
    if (!user) return false;
    
    try {
      // Check if the user has a valid ID token
      // Cast to extended user type to access stsTokenManager
      const extendedUser = user as ExtendedUser;
      const tokenExpiration = extendedUser.stsTokenManager?.expirationTime || 0;
      const now = Date.now();
      
      // Return true if token is not expired
      return tokenExpiration > now;
    } catch (error) {
      logger.error('Error checking session validity:', error);
      return false;
    }
  };

  // Set up auth state change listener
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Only set up listener if auth is available
    if (!auth) {
      console.error('Firebase Auth is not initialized');
      setLoading(false);
      setAuthError('Authentication service is not available. Please try again later.');
      return;
    }
    
    // Function to handle auth state changes
    const handleAuthStateChanged = async (authUser: User | null) => {
      setLoading(true);
      
      if (authUser) {
        try {
          // User is signed in
          setUser(authUser);
          
          // Get the ID token with a refresh
          const token = await authUser.getIdToken(true);
          const tokenResult = await authUser.getIdTokenResult();
          
          // Set the auth cookie
          const expiresIn = new Date(tokenResult.expirationTime).getTime() - Date.now();
          await setAuthCookie(token, expiresIn);
          
          // Verify the cookie was set
          const cookieVerified = await verifyCookieSet();
          
          if (!cookieVerified) {
            logger.warn('Cookie verification failed, attempting to refresh token and try again');
            
            // Try one more time with a fresh token
            const freshToken = await authUser.getIdToken(true);
            const freshTokenResult = await authUser.getIdTokenResult();
            const freshExpiresIn = new Date(freshTokenResult.expirationTime).getTime() - Date.now();
            
            await setAuthCookie(freshToken, freshExpiresIn);
            const secondVerification = await verifyCookieSet();
            
            if (!secondVerification) {
              logger.error('Cookie verification failed after refresh attempt');
              setAuthError('Failed to set authentication cookie. Please refresh the page or try again later.');
            } else {
              setAuthError(null);
            }
          } else {
            setAuthError(null);
          }
        } catch (error) {
          logger.error('Error in auth state change handling:', error);
          setAuthError('An error occurred while managing your session. Please try again.');
        }
      } else {
        // User is signed out
        setUser(null);
        
        // Clear the auth cookie
        await clearAuthCookie();
      }
      
      setLoading(false);
    };
    
    // We know auth is non-null at this point, safe to use it
    const unsubscribe = onAuthStateChanged(auth, handleAuthStateChanged);
    
    // Unsubscribe on cleanup
    return () => unsubscribe();
  }, []);

  const isLocked = () => {
    if (!lockoutUntil) return false;
    const now = Date.now();
    if (now - lockoutUntil > LOCKOUT_DURATION) {
      setLockoutUntil(null);
      setLoginAttempts(0);
      return false;
    }
    return true;
  };

  const login = async (email: string, password: string, rememberMe: boolean) => {
    try {
      console.log('Starting login process...');
      setAuthError(null);
      
      // Check if account is locked due to too many failed attempts
      if (isLocked()) {
        const error = 'Account is temporarily locked. Please try again later.';
        setAuthError(error);
        throw new Error(error);
      }

      // Check if auth is initialized
      if (!auth) {
        const error = 'Authentication service is not initialized';
        console.error(error);
        setAuthError(error);
        throw new Error(error);
      }

      // Set persistence based on rememberMe
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      console.log('Persistence set:', rememberMe ? 'local' : 'session');

      // Sign in and wait for credential
      console.log('Signing in with email and password...');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Sign in successful, user obtained');
      setLoginAttempts(0);
      
      // Only redirect if we have a user
      if (userCredential.user) {
        console.log('User authenticated successfully:', userCredential.user.uid);
        
        try {
          // Get token and set auth cookie via server API
          console.log('Getting user token...');
          const token = await userCredential.user.getIdToken();
          console.log('Token obtained, setting auth cookie with CSRF protection...');
          
          // Set the cookie with retry logic
          const cookieResult = await setAuthCookie(token, 3600);
          
          if (!cookieResult) {
            console.error('Failed to set auth cookie after multiple retries');
            // Continue with navigation anyway
          }
          
          // Verify the cookie was set properly
          const cookieVerified = await verifyCookieSet();
          if (!cookieVerified) {
            console.warn('Auth cookie verification failed, but continuing with navigation');
          }
          
          // Use window.location for more reliable navigation
          console.log('Navigating to dashboard using window.location...');
          window.location.href = '/admin/dashboard';
        } catch (error) {
          console.error('Error during post-authentication process:', error);
          
          if (error instanceof Error) {
            setAuthError(`Authentication error: ${error.message}`);
          } else {
            setAuthError('Authentication error occurred');
          }
          
          // Even if setting cookie fails, try to navigate
          console.log('Error encountered, trying direct navigation as fallback');
          window.location.href = '/admin/dashboard';
        }
      } else {
        const error = 'Authentication succeeded but user information is missing';
        console.error(error);
        setAuthError(error);
        throw new Error(error);
      }
    } catch (error: unknown) {
      // Log error details for debugging
      if (error instanceof Error) {
        console.error('Login failed:', error.message);
        setAuthError(error.message);
      } else {
        console.error('Login failed with unknown error:', error);
        setAuthError('An unknown error occurred during login');
      }
      
      setLoginAttempts(prev => {
        const newAttempts = prev + 1;
        if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
          setLockoutUntil(Date.now());
          setAuthError(`Too many failed login attempts. Account locked for ${LOCKOUT_DURATION / 60000} minutes.`);
        }
        return newAttempts;
      });
      throw error; // Re-throw for handling in the login component
    }
  };

  const logout = async () => {
    try {
      console.log('Logging out user...');
      
      // First clear the cookie
      const cookieCleared = await clearAuthCookie();
      if (!cookieCleared) {
        console.warn('Failed to clear auth cookie during logout');
      }
      
      // Check if auth is initialized
      if (!auth) {
        const error = 'Authentication service is not initialized';
        console.error(error);
        setAuthError(error);
        throw new Error(error);
      }
      
      // Then sign out from Firebase
      await signOut(auth);
      console.log('User signed out successfully');
      
      // Navigate to login page
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error occurred:', error);
      if (error instanceof Error) {
        setAuthError(`Logout error: ${error.message}`);
      } else {
        setAuthError('An error occurred during logout');
      }
      throw new Error('Failed to log out. Please try again.');
    }
  };

  const isAuthenticated = Boolean(user && isSessionValid());

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout,
      isAuthenticated,
      authError
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 