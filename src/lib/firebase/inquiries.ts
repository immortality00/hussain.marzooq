import { db } from './config';
import { collection, query, orderBy, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Inquiry } from '@/types/contact';

export const getInquiries = async (): Promise<Inquiry[]> => {
  const q = query(
    collection(db, 'inquiries'),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    status: doc.data().status || 'new',
  } as Inquiry));
};

export const updateInquiryStatus = async (id: string, status: Inquiry['status']): Promise<void> => {
  const docRef = doc(db, 'inquiries', id);
  await updateDoc(docRef, {
    status,
    updatedAt: Date.now(),
  });
};

export const deleteInquiry = async (id: string): Promise<void> => {
  const docRef = doc(db, 'inquiries', id);
  await deleteDoc(docRef);
}; 