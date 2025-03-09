import { db } from './config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  FirestoreError,
  limit
} from 'firebase/firestore';
import { PortfolioItem, PortfolioCategory, CategoryMetadata } from '@/types/portfolio';

// Map category names to their corresponding Firestore collection names
const COLLECTION_NAMES: Record<PortfolioCategory, string> = {
  photography: 'photography',
  film: 'film',
  webdev: 'webdev',
  nfts: 'nfts',
  dance: 'dance'
};

const MAX_RETRIES = 3;

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const retryOperation = async <T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof FirestoreError && error.code === 'unavailable' && retries > 0) {
      await wait(1000);
      return retryOperation(operation, retries - 1);
    }
    throw error;
  }
};

const handleFirebaseError = (error: unknown): string | null => {
  if (error instanceof FirestoreError) {
    console.error(`Firebase error (${error.code}):`, error.message);
    switch (error.code) {
      case 'permission-denied':
        return 'Unable to access this category. Please check your permissions.';
      case 'unavailable':
        return 'Service is temporarily unavailable. Please try again later.';
      case 'not-found':
        return null; // Return null for not-found to handle empty collections gracefully
      default:
        return 'An error occurred while fetching the data.';
    }
  }
  if (error instanceof Error) {
    console.error('Firebase operation error:', error);
    return error.message;
  }
  console.error('Unexpected error:', error);
  return 'An unexpected error occurred.';
};

export const getPortfolioItems = async (
  category: PortfolioCategory
): Promise<{ items: PortfolioItem[], error: string | null }> => {
  try {
    const collectionName = COLLECTION_NAMES[category];
    console.log(`DEBUG - Fetching items for category:`, category);
    console.log(`DEBUG - Using collection name:`, collectionName);
    
    const collectionRef = collection(db, collectionName);
    console.log(`DEBUG - Collection reference created`);
    
    // Simplest possible query - just get all documents
    const snapshot = await getDocs(collectionRef);
    console.log(`DEBUG - Fetch successful, found ${snapshot.docs.length} documents`);
    
    const items = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as PortfolioItem));

    return { items, error: null };
  } catch (error) {
    console.error('DEBUG - Full error object:', error);
    if (error instanceof FirestoreError) {
      console.error('DEBUG - Firebase Error Code:', error.code);
      console.error('DEBUG - Firebase Error Message:', error.message);
      
      // For permission errors, log additional details
      if (error.code === 'permission-denied') {
        console.error('DEBUG - Collection name:', COLLECTION_NAMES[category]);
        console.error('DEBUG - Full error details:', {
          name: error.name,
          code: error.code,
          message: error.message,
          stack: error.stack
        });
      }
    }
    const errorMessage = handleFirebaseError(error);
    if (errorMessage === null) {
      return { items: [], error: null };
    }
    return { items: [], error: errorMessage };
  }
};

export const getCategoryMetadata = async (
  category: PortfolioCategory
): Promise<{ metadata: CategoryMetadata | null, error: string | null }> => {
  try {
    const collectionName = COLLECTION_NAMES[category];
    const docRef = doc(db, collectionName, 'metadata');
    const docSnap = await retryOperation(() => getDoc(docRef));

    if (docSnap.exists()) {
      const metadata = { id: docSnap.id, ...docSnap.data() } as CategoryMetadata;
      return { metadata, error: null };
    }
    return { metadata: null, error: null };
  } catch (error) {
    return { metadata: null, error: handleFirebaseError(error) };
  }
};

export const addPortfolioItem = async (
  category: PortfolioCategory,
  item: Omit<PortfolioItem, 'id'>
): Promise<{ id: string | null, error: string | null }> => {
  try {
    const collectionName = COLLECTION_NAMES[category];
    const docRef = await retryOperation(() => 
      addDoc(collection(db, collectionName), item)
    );
    return { id: docRef.id, error: null };
  } catch (error) {
    return { id: null, error: handleFirebaseError(error) };
  }
};

export const updatePortfolioItem = async (
  category: PortfolioCategory,
  id: string,
  item: Partial<PortfolioItem>
): Promise<{ success: boolean, error: string | null }> => {
  try {
    const collectionName = COLLECTION_NAMES[category];
    await retryOperation(() => 
      updateDoc(doc(db, collectionName, id), item)
    );
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: handleFirebaseError(error) };
  }
};

export const deletePortfolioItem = async (
  category: PortfolioCategory,
  id: string
): Promise<{ success: boolean, error: string | null }> => {
  try {
    const collectionName = COLLECTION_NAMES[category];
    await retryOperation(() => 
      deleteDoc(doc(db, collectionName, id))
    );
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: handleFirebaseError(error) };
  }
};

export const updateCategoryMetadata = async (
  category: PortfolioCategory,
  metadata: Omit<CategoryMetadata, 'id'>
): Promise<{ success: boolean, error: string | null }> => {
  try {
    const collectionName = COLLECTION_NAMES[category];
    await retryOperation(() => 
      updateDoc(doc(db, collectionName, 'metadata'), metadata)
    );
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: handleFirebaseError(error) };
  }
}; 