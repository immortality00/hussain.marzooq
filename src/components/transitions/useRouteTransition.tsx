'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

type TransitionState = 'entering' | 'entered' | 'exiting' | 'exited';

interface UseRouteTransitionOptions {
  /**
   * Delay before starting the exit animation in milliseconds
   */
  exitDelay?: number;
  
  /**
   * Duration of the transition in milliseconds
   */
  duration?: number;
}

/**
 * A hook that provides transition state information based on route changes.
 * This can be used to manually trigger animations in components without 
 * wrapping the entire application.
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { state, isVisible } = useRouteTransition();
 *   
 *   // Use the state to conditionally apply classes or animations
 *   return (
 *     <div className={`my-component ${state === 'entering' ? 'fade-in' : state === 'exiting' ? 'fade-out' : ''}`}>
 *       {isVisible && <div>My content</div>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useRouteTransition(options: UseRouteTransitionOptions = {}) {
  const { exitDelay = 0, duration = 300 } = options;
  const pathname = usePathname();
  const [state, setState] = useState<TransitionState>('entered');
  const [prevPathname, setPrevPathname] = useState(pathname);
  
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    // If the pathname changed
    if (pathname !== prevPathname) {
      // Start exit animation
      setState('exiting');
      
      // After the exit animation, update the path and start entering
      timeoutId = setTimeout(() => {
        setPrevPathname(pathname);
        setState('entering');
        
        // After the enter animation is complete
        const enterTimeout = setTimeout(() => {
          setState('entered');
        }, duration);
        
        return () => clearTimeout(enterTimeout);
      }, exitDelay + duration);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [pathname, prevPathname, exitDelay, duration]);
  
  // Content should be visible during entering and entered states
  const isVisible = state === 'entering' || state === 'entered';
  
  return { state, isVisible, pathname };
}

/**
 * CSS classes that can be used with the useRouteTransition hook.
 * Simply import these and apply them conditionally based on the transition state.
 */
export const transitionClasses = {
  fadeIn: 'animate-fadeIn',
  fadeOut: 'animate-fadeOut',
  slideIn: 'animate-slideIn',
  slideOut: 'animate-slideOut',
  // Add more animation classes as needed
};

// Add these to your global CSS file:
/*
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes slideIn {
  from { transform: translateY(10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes slideOut {
  from { transform: translateY(0); opacity: 1; }
  to { transform: translateY(-10px); opacity: 0; }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease forwards;
}

.animate-fadeOut {
  animation: fadeOut 0.3s ease forwards;
}

.animate-slideIn {
  animation: slideIn 0.3s ease forwards;
}

.animate-slideOut {
  animation: slideOut 0.3s ease forwards;
}
*/ 