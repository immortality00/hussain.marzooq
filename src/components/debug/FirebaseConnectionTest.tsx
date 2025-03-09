'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, limit, query } from 'firebase/firestore';

export default function FirebaseConnectionTest() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<string | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      console.log('Testing Firebase connection...');
      try {
        // Try to fetch from a collection that definitely exists
        // Try multiple collections to ensure at least one exists
        const collections = ['photography', 'film', 'webdev', 'nfts', 'dance'];
        let success = false;
        
        for (const collectionName of collections) {
          try {
            console.log(`Trying to fetch from ${collectionName} collection...`);
            const q = query(collection(db, collectionName), limit(1));
            const snapshot = await getDocs(q);
            console.log(`Successfully fetched from ${collectionName}, found ${snapshot.docs.length} documents`);
            success = true;
            setStatus('success');
            setDetails(`Connected to Firestore. Found ${snapshot.docs.length} documents in '${collectionName}'.`);
            break; // Exit the loop on first success
          } catch (collErr) {
            console.log(`Error with ${collectionName}:`, collErr);
            // Continue to next collection
          }
        }
        
        if (!success) {
          throw new Error('Could not connect to any known collection');
        }
      } catch (err) {
        console.error('Firebase connection test failed:', err);
        setStatus('error');
        if (err instanceof Error) {
          setError(err.message);
          setDetails(err.stack || 'No stack trace available');
        } else {
          setError('Unknown error');
          setDetails(JSON.stringify(err));
        }
      }
    };

    testConnection();
  }, []);

  return (
    <div className="p-4 rounded-lg border">
      <h3 className="text-lg font-semibold mb-2">Firebase Connection Test</h3>
      <div className="space-y-2">
        <p>Status: <span className={status === 'success' ? 'text-green-500' : status === 'error' ? 'text-red-500' : 'text-yellow-500'}>{status}</span></p>
        {error && (
          <div className="text-red-500">
            <p>Error: {error}</p>
            <details className="mt-2">
              <summary className="cursor-pointer">Details</summary>
              <pre className="p-2 mt-2 bg-gray-100 rounded text-xs overflow-auto">{details}</pre>
            </details>
          </div>
        )}
        {status === 'success' && details && (
          <p className="text-green-500">{details}</p>
        )}
      </div>
    </div>
  );
} 