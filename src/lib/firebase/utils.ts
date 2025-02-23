import { db, storage } from './config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  DocumentData,
  CollectionReference,
  Query,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Firestore utilities
export async function getDocument<T = DocumentData>(
  collectionName: string,
  documentId: string
): Promise<T | null> {
  try {
    const docRef = doc(db, collectionName, documentId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as T) : null;
  } catch (error) {
    console.error('Error getting document:', error);
    return null;
  }
}

export async function getCollection<T = DocumentData>(
  collectionName: string,
  conditions?: {
    field: string;
    operator: '==' | '>' | '<' | '>=' | '<=';
    value: any;
  }[],
  orderByField?: string,
  limitCount?: number
): Promise<T[]> {
  try {
    let q: Query<DocumentData> = collection(db, collectionName);
    
    if (conditions) {
      conditions.forEach((condition) => {
        q = query(q, where(condition.field, condition.operator, condition.value));
      });
    }

    if (orderByField) {
      q = query(q, orderBy(orderByField));
    }

    if (limitCount) {
      q = query(q, limit(limitCount));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as T);
  } catch (error) {
    console.error('Error getting collection:', error);
    return [];
  }
}

// Storage utilities
export async function uploadFile(
  file: File,
  path: string
): Promise<string | null> {
  try {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return url;
  } catch (error) {
    console.error('Error uploading file:', error);
    return null;
  }
} 