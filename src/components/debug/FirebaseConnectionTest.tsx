import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, limit, query } from 'firebase/firestore';

export default function FirebaseConnectionTest() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Try to fetch a single document from any collection
        const q = query(collection(db, 'projects'), limit(1));
        await getDocs(q);
        setStatus('success');
      } catch (err) {
        console.error('Firebase connection test failed:', err);
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    testConnection();
  }, []);

  return (
    <div className="p-4 rounded-lg border">
      <h3 className="text-lg font-semibold mb-2">Firebase Connection Test</h3>
      <div className="space-y-2">
        <p>Status: {status}</p>
        {error && <p className="text-red-500">Error: {error}</p>}
      </div>
    </div>
  );
} 