import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence, initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Ensure all required environment variables are present
if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    !process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
  throw new Error('Missing required Firebase configuration values');
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase only once
let app: FirebaseApp;
if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    throw error;
  }
} else {
  app = getApps()[0];
}

// Initialize Firestore with settings for better offline behavior
const db = typeof window !== 'undefined' 
  ? initializeFirestore(app, {
      cacheSizeBytes: 50 * 1024 * 1024, // 50 MB
      experimentalForceLongPolling: true, // Better for problematic connections
    })
  : getFirestore(app);

// Enable offline persistence if in browser
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db)
    .then(() => {
      console.log("Firestore persistence enabled");
    })
    .catch((err) => {
      console.warn("Firestore persistence could not be enabled:", err.code);
    });
}

// Initialize other services
const auth = getAuth(app);
const storage = getStorage(app);

// Initialize Analytics conditionally (only in browser and production)
let analytics = null;
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  try {
    isSupported().then(supported => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    }).catch(error => {
      console.warn('Analytics initialization failed:', error);
    });
  } catch (error) {
    console.warn('Analytics setup failed:', error);
  }
}

// Helper function to check if Firebase is online
export const checkFirebaseConnection = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return true;
  
  if (!navigator.onLine) return false;
  
  // Try a simple network request to check connectivity
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    await fetch('https://www.googleapis.com/identitytoolkit/v3/relyingparty/downloadAccount', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ returnSecureToken: true }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return true;
  } catch (error) {
    console.warn('Firebase connection check failed:', error);
    return false;
  }
};

export { app, auth, db, storage, analytics }; 