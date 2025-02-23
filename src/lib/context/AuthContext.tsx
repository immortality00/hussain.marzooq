'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  getAuth,
  browserLocalPersistence,
  setPersistence,
  browserSessionPersistence
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
        sessionManager.initSession();
      } else {
        sessionManager.clearSession();
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

      await signInWithEmailAndPassword(auth, email, password);
      setLoginAttempts(0);
      router.push('/admin/dashboard');
    } catch (error: any) {
      setLoginAttempts(prev => {
        const newAttempts = prev + 1;
        if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
          setLockoutTimestamp(Date.now());
        }
        return newAttempts;
      });
      throw new Error(error.message);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      sessionManager.clearSession();
      router.push('/admin/login');
    } catch (error: any) {
      throw new Error(error.message);
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