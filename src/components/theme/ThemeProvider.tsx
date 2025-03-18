'use client';

import { createContext, useState, useEffect, useContext, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Hook to use theme in components
 */
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * ThemeProvider manages theme state and synchronizes with system preferences
 */
export default function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  // Function to safely set theme and update localStorage and DOM
  const setTheme = (newTheme: Theme) => {
    // Update state
    setThemeState(newTheme);
    
    // Update localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme);
    }
    
    // Update DOM
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Effect to initialize theme from localStorage or system preference
  useEffect(() => {
    // Read from localStorage or use system preference
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    const systemTheme: Theme = window.matchMedia('(prefers-color-scheme: dark)').matches 
      ? 'dark' 
      : 'light';
    
    setThemeState(storedTheme || systemTheme);
    setMounted(true);
    
    // Listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Only render children after mounted to avoid hydration mismatch
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {mounted ? children : null}
    </ThemeContext.Provider>
  );
} 