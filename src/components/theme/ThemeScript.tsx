'use client';

import { useEffect } from 'react';

/**
 * ThemeScript is a component that injects a small inline script to prevent
 * flash of wrong theme.
 * 
 * The script runs before React hydration to set the initial theme.
 */
export default function ThemeScript() {
  useEffect(() => {
    const script = document.createElement('script');
    script.innerHTML = `
      try {
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } catch (_) {}
    `;
    document.head.appendChild(script);
  }, []);

  return null;
} 