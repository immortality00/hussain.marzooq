import { db } from './config';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, getDoc, query, orderBy, setDoc } from 'firebase/firestore';
import { PortfolioItem, PortfolioCategory, CategoryMetadata } from '@/types/portfolio';

export const getPortfolioItems = async (category: PortfolioCategory): Promise<PortfolioItem[]> => {
  const q = query(collection(db, category), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PortfolioItem));
};

export const addPortfolioItem = async (category: PortfolioCategory, item: Omit<PortfolioItem, 'id'>): Promise<string> => {
  const docRef = await addDoc(collection(db, category), item);
  return docRef.id;
};

export const updatePortfolioItem = async (category: PortfolioCategory, id: string, item: Partial<PortfolioItem>): Promise<void> => {
  const docRef = doc(db, category, id);
  await updateDoc(docRef, { ...item, updatedAt: Date.now() });
};

export const deletePortfolioItem = async (category: PortfolioCategory, id: string): Promise<void> => {
  const docRef = doc(db, category, id);
  await deleteDoc(docRef);
};

// New functions for category metadata
export const getCategoryMetadata = async (category: PortfolioCategory): Promise<CategoryMetadata | null> => {
  try {
    const docRef = doc(db, category, 'metadata');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as CategoryMetadata;
    }
    return null;
  } catch (error) {
    console.error('Error getting category metadata:', error);
    return null;
  }
};

export const updateCategoryMetadata = async (
  category: PortfolioCategory,
  metadata: Omit<CategoryMetadata, 'id'>
): Promise<void> => {
  const docRef = doc(db, category, 'metadata');
  await setDoc(docRef, { ...metadata, lastUpdated: Date.now() });
}; 