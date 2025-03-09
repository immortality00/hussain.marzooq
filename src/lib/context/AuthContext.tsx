'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  browserLocalPersistence,
  setPersistence,
  browserSessionPersistence,
  AuthError
} from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useRouter } from 'next/navigation';
import { sessionManager } from '@/lib/utils/sessionManager';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  isAuthenticated: false,
});

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

// Helper function to set a secure cookie
const setSecureCookie = (name: string, value: string, maxAge = 3600) => {
  // Get the current domain
  const domain = window.location.hostname;
  // Set secure cookie with HttpOnly and SameSite flags
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Strict; ${window.location.protocol === 'https:' ? 'Secure;' : ''} domain=${domain}; HttpOnly`;
};

// Helper function to clear a secure cookie
const clearSecureCookie = (name: string) => {
  // Get the current domain
  const domain = window.location.hostname;
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict; ${window.location.protocol === 'https:' ? 'Secure;' : ''} domain=${domain}; HttpOnly`;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockoutTimestamp, setLockoutTimestamp] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      if (user) {
        // Initialize session and set auth cookie
        sessionManager.initSession();
        // Get user token and set as cookie for middleware authentication
        user.getIdToken().then(token => {
          // Use the secure cookie helper
          setSecureCookie('firebase-auth-token', token);
        });
      } else {
        sessionManager.clearSession();
        // Clear the auth cookie when logged out
        clearSecureCookie('firebase-auth-token');
      }
    });

    // Activity monitoring
    const activityHandler = () => {
      if (user) {
        sessionManager.updateActivity();
      }
    };

    // Session validation interval
    const sessionInterval = setInterval(() => {
      if (user && !sessionManager.isSessionValid()) {
        logout();
      }
    }, 60000); // Check every minute

    window.addEventListener('mousemove', activityHandler);
    window.addEventListener('keydown', activityHandler);

    return () => {
      unsubscribe();
      clearInterval(sessionInterval);
      window.removeEventListener('mousemove', activityHandler);
      window.removeEventListener('keydown', activityHandler);
    };
  }, [user]);

  const isLocked = () => {
    if (!lockoutTimestamp) return false;
    const now = Date.now();
    if (now - lockoutTimestamp > LOCKOUT_DURATION) {
      setLockoutTimestamp(null);
      setLoginAttempts(0);
      return false;
    }
    return true;
  };

  const login = async (email: string, password: string, rememberMe: boolean) => {
    try {
      if (isLocked()) {
        throw new Error('Account is temporarily locked. Please try again later.');
      }

      // Set persistence based on rememberMe
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);

      // Sign in and wait for credential
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setLoginAttempts(0);
      
      // Only redirect if we have a user
      if (userCredential.user) {
        // Safe logging without exposing details
        console.log('Login successful, initiating navigation');
        // Force a hard navigation to the dashboard
        window.location.href = '/admin/dashboard';
      }
    } catch (error: unknown) {
      // Generic logging without exposing detailed error
      console.error('Login failed: Authentication error');
      
      setLoginAttempts(prev => {
        const newAttempts = prev + 1;
        if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
          setLockoutTimestamp(Date.now());
        }
        return newAttempts;
      });
      throw error; // Re-throw for handling in the login component
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      sessionManager.clearSession();
      // Use the secure cookie helper
      clearSecureCookie('firebase-auth-token');
      router.push('/admin/login');
    } catch (error: unknown) {
      console.error('Logout error occurred');
      throw new Error('Failed to log out. Please try again.');
    }
  };

  const isAuthenticated = Boolean(user && sessionManager.isSessionValid());

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout,
      isAuthenticated 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 