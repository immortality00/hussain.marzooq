import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Validate Firebase configuration
const validateFirebaseConfig = () => {
  const requiredVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID'
  ];
  
  // In development mode, be more lenient with validation
  if (process.env.NODE_ENV === 'development') {
    // Just check if major variables are present
    const hasMajorVars = 
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    
    if (!hasMajorVars) {
      console.warn('Missing critical Firebase configuration variables in development mode');
      return false;
    }
    
    return true;
  }
  
  // For production, check if variables are completely missing
  const missingVars = requiredVars.filter(varName => 
    !process.env[varName]
  );
  
  if (missingVars.length > 0) {
    console.warn(`Missing Firebase configuration variables: ${missingVars.join(', ')}`);
    return false;
  }
  
  return true;
}

// Define Firebase configuration
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
let app: FirebaseApp | null = null;
let auth: ReturnType<typeof getAuth> | null = null;
let db: ReturnType<typeof getFirestore> | null = null;
let storage: ReturnType<typeof getStorage> | null = null;
let analytics: ReturnType<typeof getAnalytics> | null = null;

try {
  const isConfigValid = validateFirebaseConfig();
  
  // Only proceed with initialization if config is valid
  if (isConfigValid) {
    // Initialize or get the Firebase app
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
      console.log('Firebase initialized successfully');
    } else {
      app = getApps()[0];
    }

    // Initialize Firebase Auth (non-null assertion is safe here since we just initialized the app)
    auth = getAuth(app!);
    
    // Connect to Auth emulator in development if enabled
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true' && auth) {
      try {
        connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
        console.log('Connected to Firebase Auth emulator');
      } catch (error) {
        console.warn('Failed to connect to Firebase Auth emulator:', error);
      }
    }

    // Initialize Firestore with settings for better offline behavior
    if (app) {
      db = typeof window !== 'undefined' 
        ? initializeFirestore(app, {
            localCache: persistentLocalCache({
              cacheSizeBytes: 10 * 1024 * 1024, // 10 MB
              tabManager: persistentMultipleTabManager()
            })
          })
        : getFirestore(app);

      // Initialize Storage
      storage = getStorage(app);

      // Initialize Analytics conditionally (only in browser and production)
      if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
        try {
          isSupported().then(supported => {
            if (supported && app) {
              analytics = getAnalytics(app);
              console.log('Firebase Analytics initialized');
            }
          }).catch(error => {
            console.warn('Analytics initialization failed:', error);
          });
        } catch (error) {
          console.warn('Analytics setup failed:', error);
        }
      }
    }
  } else {
    console.error('Firebase initialization skipped due to invalid configuration');
  }
} catch (error) {
  console.error('Firebase initialization failed:', error);
}

// Helper function to check if Firebase is online
export const checkFirebaseConnection = async (): Promise<boolean> => {
  // If we're on the server, assume we're connected
  if (typeof window === 'undefined') return true;
  
  // First check if the browser is online at all
  if (!navigator.onLine) return false;
  
  try {
    // Check if our Firebase app is initialized properly
    const isAppInitialized = !!app && Object.keys(app).length > 0;
    
    // Check if auth is initialized 
    const isAuthInitialized = !!auth && Object.keys(auth).length > 0;
    
    if (!isAppInitialized || !isAuthInitialized) {
      console.warn('Firebase not fully initialized during connection check');
      return false;
    }
    
    // Skip actual network connection check in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Assuming Firebase is connected');
      return true;
    }
    
    // Validate that Firebase project ID exists before trying to connect
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    if (!projectId || projectId === 'your-project-id') {
      console.warn('Firebase project ID not properly configured');
      return false;
    }
    
    // Do a lightweight Firestore operation to test connectivity
    if (db) {
      // Set a small timeout for the operation
      const timeout = new Promise<boolean>((_, reject) => 
        setTimeout(() => reject(new Error('Firebase connection timeout')), 5000)
      );
      
      // Try to fetch the Firestore app info which is a lightweight operation
      const connectionTest = new Promise<boolean>(async (resolve) => {
        try {
          // We're using a try-catch in case the fetch fails due to CORS or network issues
          const response = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`, { 
            method: 'HEAD',
            cache: 'no-store'
          });
          
          if (response.ok) {
            console.log('Firebase connection test successful');
            resolve(true);
          } else {
            console.warn(`Firebase connection test failed with status: ${response.status}`);
            resolve(false);
          }
        } catch (error) {
          console.log('Firebase connection test failed:', error);
          resolve(false);
        }
      });
      
      // Race the connection test against the timeout
      return await Promise.race([connectionTest, timeout])
        .catch((error) => {
          console.error('Firebase connection check error:', error);
          return false;
        });
    }
    
    return false;
  } catch (error) {
    // If we can't even check initialization status, we're definitely not connected
    console.error('Error checking Firebase connection status:', error);
    return false;
  }
};

export { app, auth, db, storage, analytics }; 