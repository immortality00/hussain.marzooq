import { db as firestore } from '../firebase/config';
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit as firestoreLimit,
  DocumentData,
  CollectionReference,
  Query
} from 'firebase/firestore';
import { validatePortfolioItem, validateInquiry, validateCategoryMetadata, PortfolioItem, Inquiry, CategoryMetadata } from './validator';

// Define a generic interface for data repository operations
export interface DataRepository<T> {
  getAll(options?: QueryOptions): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  findUnique(where: Record<string, unknown>): Promise<T | null>;
}

// Query options interface for filtering, sorting, etc.
export interface QueryOptions {
  where?: Record<string, unknown>;
  orderBy?: string;
  limit?: number;
}

// Configuration for database operations
export interface DatabaseConfig {
  collectionMappings: Record<string, string>;
}

// Default database configuration - maps entity names to Firebase collection names
const defaultDatabaseConfig: DatabaseConfig = {
  collectionMappings: {
    // User management
    'users': 'users',
    
    // Session management
    'refreshTokens': 'refreshTokens',
    
    // Content management
    'pageContent': 'pageContent',
    
    // Portfolio collections
    'photography': 'photography',
    'film': 'film',
    'webdev': 'webdev',
    'nfts': 'nfts',
    'dance': 'dance',
    
    // Inquiries
    'inquiries': 'inquiries',
    
    // Category metadata
    'categories': 'categories'
  }
};

// Function to validate data based on collection name
function validateData(collectionName: string, data: Record<string, unknown>): { valid: boolean; errors: string[] } {
  switch (collectionName) {
    case 'photography':
    case 'film':
    case 'webdev':
    case 'nfts':
    case 'dance':
      return validatePortfolioItem(data as PortfolioItem);
      
    case 'inquiries':
      return validateInquiry(data as Inquiry);
      
    case 'categories':
      return validateCategoryMetadata(data as CategoryMetadata);
      
    default:
      // For collections without specific validation
      return { valid: true, errors: [] };
  }
}

// Firebase repository implementation with validation
class FirebaseRepository<T extends { id?: string }> implements DataRepository<T & { id: string }> {
  private collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  async getAll(options?: QueryOptions): Promise<(T & { id: string })[]> {
    try {
      let q: Query<DocumentData> = collection(firestore, this.collectionName) as CollectionReference<DocumentData>;
      
      // Apply where conditions if provided
      if (options?.where) {
        Object.entries(options.where).forEach(([field, value]) => {
          q = query(q, where(field, '==', value));
        });
      }
      
      // Apply orderBy if provided
      if (options?.orderBy) {
        q = query(q, orderBy(options.orderBy));
      }
      
      // Apply limit if provided
      if (options?.limit) {
        q = query(q, firestoreLimit(options.limit));
      }
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as (T & { id: string })[];
    } catch (error) {
      console.error(`Error getting documents from ${this.collectionName}:`, error);
      return [];
    }
  }

  async getById(id: string): Promise<(T & { id: string }) | null> {
    try {
      const docRef = doc(firestore, this.collectionName, id);
      const snapshot = await getDoc(docRef);
      
      if (!snapshot.exists()) {
        return null;
      }
      
      return {
        ...snapshot.data(),
        id: snapshot.id
      } as (T & { id: string });
    } catch (error) {
      console.error(`Error getting document ${id} from ${this.collectionName}:`, error);
      return null;
    }
  }

  async findUnique(where: Record<string, unknown>): Promise<(T & { id: string }) | null> {
    try {
      // We'll implement this for compatible API with existing code that used Prisma
      const results = await this.getAll({ where, limit: 1 });
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error(`Error finding unique document in ${this.collectionName}:`, error);
      return null;
    }
  }

  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T & { id: string }> {
    try {
      const now = new Date();
      const dataWithTimestamps = {
        ...data,
        createdAt: now,
        updatedAt: now
      };
      
      // Validate data against security rules
      const validation = validateData(this.collectionName, dataWithTimestamps);
      
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }
      
      const docRef = await addDoc(collection(firestore, this.collectionName), dataWithTimestamps);
      
      // Type assertion to ensure compatibility
      return {
        ...dataWithTimestamps,
        id: docRef.id
      } as unknown as (T & { id: string });
    } catch (error) {
      console.error(`Error creating document in ${this.collectionName}:`, error);
      throw error;
    }
  }

  async update(id: string, data: Partial<T>): Promise<(T & { id: string }) | null> {
    try {
      // Get the existing document first
      const existingDoc = await this.getById(id);
      
      if (!existingDoc) {
        return null;
      }
      
      const dataWithTimestamp = {
        ...data,
        updatedAt: new Date()
      };
      
      // Validate the complete document after update
      const updatedData = {
        ...existingDoc,
        ...dataWithTimestamp
      };
      
      const validation = validateData(this.collectionName, updatedData);
      
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }
      
      const docRef = doc(firestore, this.collectionName, id);
      await updateDoc(docRef, dataWithTimestamp);
      
      // Get the updated document
      const updatedDoc = await getDoc(docRef);
      
      if (!updatedDoc.exists()) {
        return null;
      }
      
      return {
        ...updatedDoc.data(),
        id: updatedDoc.id
      } as (T & { id: string });
    } catch (error) {
      console.error(`Error updating document ${id} in ${this.collectionName}:`, error);
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const docRef = doc(firestore, this.collectionName, id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error(`Error deleting document ${id} from ${this.collectionName}:`, error);
      return false;
    }
  }
}

// Helper function to get a repository with the generic type inferred
export function getRepository<T extends { id: string }>(entityName: string): DataRepository<T> {
  const collectionName = defaultDatabaseConfig.collectionMappings[entityName] || entityName;
  return new FirebaseRepository<T>(collectionName) as DataRepository<T>;
}

// Export the database config for potential external customization
export { defaultDatabaseConfig }; 