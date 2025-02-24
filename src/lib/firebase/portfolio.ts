import { db } from './config';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  orderBy,
  setDoc,
  enableNetwork,
  disableNetwork,
  waitForPendingWrites
} from 'firebase/firestore';
import { PortfolioItem, PortfolioCategory, CategoryMetadata } from '@/types/portfolio';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const retryOperation = async <T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> => {
  try {
    return await operation();
  } catch (error: any) {
    if (retries > 0 && error.code === 'unavailable') {
      await wait(RETRY_DELAY);
      // Try to reset network connection
      try {
        await disableNetwork(db);
        await enableNetwork(db);
        await waitForPendingWrites(db);
      } catch (networkError) {
        console.warn('Network reset failed:', networkError);
      }
      return retryOperation(operation, retries - 1);
    }
    throw error;
  }
};

export const getPortfolioItems = async (category: PortfolioCategory): Promise<PortfolioItem[]> => {
  try {
    return await retryOperation(async () => {
      const q = query(collection(db, category), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PortfolioItem));
    });
  } catch (error) {
    console.error(`Error fetching ${category} items:`, error);
    return [];
  }
};

export const getCategoryMetadata = async (category: PortfolioCategory): Promise<CategoryMetadata | null> => {
  try {
    return await retryOperation(async () => {
      const docRef = doc(db, category, 'metadata');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as CategoryMetadata;
      }
      return null;
    });
  } catch (error) {
    console.error(`Error fetching ${category} metadata:`, error);
    return null;
  }
};

export const addPortfolioItem = async (category: PortfolioCategory, item: Omit<PortfolioItem, 'id'>): Promise<string> => {
  return retryOperation(async () => {
    const docRef = await addDoc(collection(db, category), item);
    return docRef.id;
  });
};

export const updatePortfolioItem = async (category: PortfolioCategory, id: string, item: Partial<PortfolioItem>): Promise<void> => {
  return retryOperation(async () => {
    const docRef = doc(db, category, id);
    await updateDoc(docRef, { ...item, updatedAt: Date.now() });
  });
};

export const deletePortfolioItem = async (category: PortfolioCategory, id: string): Promise<void> => {
  return retryOperation(async () => {
    const docRef = doc(db, category, id);
    await deleteDoc(docRef);
  });
};

export const updateCategoryMetadata = async (
  category: PortfolioCategory,
  metadata: Omit<CategoryMetadata, 'id'>
): Promise<void> => {
  return retryOperation(async () => {
    const docRef = doc(db, category, 'metadata');
    await setDoc(docRef, { ...metadata, lastUpdated: Date.now() });
  });
}; 