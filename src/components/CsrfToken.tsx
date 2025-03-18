import { useEffect, useState } from 'react';
import { logger } from '@/lib/utils/logger';

/**
 * Component to include a CSRF token in forms
 * Fetches a token from the server and includes it as a hidden input
 */
const CsrfToken = () => {
  const [token, setToken] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Add cache-busting parameter
        const response = await fetch(`/api/csrf?_=${Date.now()}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          // Ensure we're not using a cached response
          cache: 'no-store',
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch CSRF token: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data.token) {
          throw new Error('No token received from server');
        }
        
        setToken(data.token);
      } catch (error) {
        logger.error('Error fetching CSRF token:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch CSRF token');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCsrfToken();
  }, []);

  if (isLoading) {
    // Don't render anything while loading to avoid form submission before token is ready
    return null;
  }

  if (error) {
    // In production, you might want to handle this differently
    logger.warn(`CSRF token error: ${error}`);
    
    // Return an empty div to avoid breaking layout while still allowing form submission
    // This is a fallback, but ideally your server should reject requests without valid CSRF tokens
    return <div data-testid="csrf-error" className="hidden"></div>;
  }

  // Return a hidden input with the CSRF token
  return (
    <input 
      type="hidden" 
      name="csrfToken" 
      value={token} 
      data-testid="csrf-token-input"
    />
  );
};

export default CsrfToken; 