import { db } from './config';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, getDoc, query, orderBy } from 'firebase/firestore';
import { PortfolioItem, PortfolioCategory } from '@/types/portfolio';

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