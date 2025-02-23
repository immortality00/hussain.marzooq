import { User } from 'firebase/auth';

const SESSION_KEY = 'auth_session';
const SESSION_EXPIRY = 3600000; // 1 hour in milliseconds

interface SessionData {
  timestamp: number;
  lastActivity: number;
}

export const sessionManager = {
  initSession: () => {
    const session: SessionData = {
      timestamp: Date.now(),
      lastActivity: Date.now(),
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  },

  updateActivity: () => {
    const session = sessionManager.getSession();
    if (session) {
      session.lastActivity = Date.now();
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }
  },

  getSession: (): SessionData | null => {
    const sessionStr = sessionStorage.getItem(SESSION_KEY);
    return sessionStr ? JSON.parse(sessionStr) : null;
  },

  clearSession: () => {
    sessionStorage.removeItem(SESSION_KEY);
  },

  isSessionValid: (): boolean => {
    const session = sessionManager.getSession();
    if (!session) return false;

    const now = Date.now();
    const isExpired = now - session.timestamp > SESSION_EXPIRY;
    const isInactive = now - session.lastActivity > SESSION_EXPIRY / 2;

    return !isExpired && !isInactive;
  },
}; 