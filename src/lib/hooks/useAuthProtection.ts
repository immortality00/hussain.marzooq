'use client';

import { useAuth } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function useAuthProtection() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [redirected, setRedirected] = useState(false);

  useEffect(() => {
    // Only redirect if loading is complete and still no user
    if (!loading) {
      if (!user && !redirected) {
        setRedirected(true);
        router.push('/admin/login');
      }
    }
  }, [user, loading, isAuthenticated, router, redirected]);

  return { user, loading, isAuthenticated };
} 