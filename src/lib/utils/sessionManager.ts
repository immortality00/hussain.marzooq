import { v4 as uuidv4 } from 'uuid';

const SESSION_KEY = 'auth_session';
const SESSION_EXPIRY = 3600000; // 1 hour in milliseconds

interface SessionData {
  id: string;          // Unique session ID
  timestamp: number;   // Session creation time
  lastActivity: number; // Last activity time
  userAgent: string;   // Browser user agent for validation
}

// Helper to safely store data in storage
const safelyStoreData = (key: string, data: unknown) => {
  try {
    const serialized = JSON.stringify(data);
    sessionStorage.setItem(key, serialized);
    return true;
  } catch (_error) {
    console.error('Error storing session data');
    return false;
  }
};

// Helper to safely retrieve data from storage
const safelyRetrieveData = <T>(key: string): T | null => {
  try {
    const serialized = sessionStorage.getItem(key);
    if (!serialized) return null;
    return JSON.parse(serialized) as T;
  } catch (_error) {
    console.error('Error retrieving session data');
    return null;
  }
};

export const sessionManager = {
  initSession: () => {
    // Create a new secure session with additional validation data
    const session: SessionData = {
      id: uuidv4(), // Add a unique ID for this session
      timestamp: Date.now(),
      lastActivity: Date.now(),
      userAgent: navigator.userAgent, // Store user agent for validation
    };
    
    return safelyStoreData(SESSION_KEY, session);
  },

  updateActivity: () => {
    const session = sessionManager.getSession();
    if (session) {
      // Validate session before updating
      if (session.userAgent !== navigator.userAgent) {
        console.error('Session validation failed: User agent mismatch');
        sessionManager.clearSession();
        return false;
      }
      
      session.lastActivity = Date.now();
      return safelyStoreData(SESSION_KEY, session);
    }
    return false;
  },

  getSession: (): SessionData | null => {
    const session = safelyRetrieveData<SessionData>(SESSION_KEY);
    
    // Return null if session doesn't exist or is invalid
    if (!session) return null;
    
    // Validate that the current user agent matches the one from session creation
    if (session.userAgent !== navigator.userAgent) {
      console.error('Session validation failed: User agent mismatch');
      sessionManager.clearSession();
      return null;
    }
    
    return session;
  },

  clearSession: () => {
    try {
      sessionStorage.removeItem(SESSION_KEY);
      return true;
    } catch (_error) {
      console.error('Error clearing session');
      return false;
    }
  },

  isSessionValid: (): boolean => {
    const session = sessionManager.getSession();
    if (!session) return false;

    const now = Date.now();
    const isExpired = now - session.timestamp > SESSION_EXPIRY;
    const isInactive = now - session.lastActivity > SESSION_EXPIRY / 2;
    
    // If session is expired or inactive, clear it
    if (isExpired || isInactive) {
      sessionManager.clearSession();
      return false;
    }

    return true;
  },
}; 