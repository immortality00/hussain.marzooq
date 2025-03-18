import React, { useEffect, useState, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  setIsAuthenticated: (value: boolean) => void;
  setIsLoading: (value: boolean) => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = React.createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  setIsAuthenticated: () => {},
  setIsLoading: () => {},
});

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let validationTimeout: NodeJS.Timeout;
    let retryCount = 0;
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 5000; // 5 seconds

    const validateSession = async () => {
      if (!isMounted) return;

      try {
        const response = await fetch('/api/session/validate', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Session validation failed');
        }

        const data = await response.json();
        
        if (isMounted) {
          setIsAuthenticated(data.valid);
          if (!data.valid) {
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error('Session validation error:', error);
        
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          validationTimeout = setTimeout(validateSession, RETRY_DELAY);
        } else {
          if (isMounted) {
            setIsAuthenticated(false);
            setIsLoading(false);
          }
        }
      }
    };

    // Initial validation
    validateSession();

    // Set up periodic validation with a longer interval (5 minutes)
    const intervalId = setInterval(validateSession, 5 * 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      if (validationTimeout) {
        clearTimeout(validationTimeout);
      }
    };
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, setIsAuthenticated, setIsLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
export { AuthProvider }; 