'use client';

import { AnimatePresence, motion, Variants } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { ReactNode, useState, useEffect } from 'react';

type TransitionType = 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'none';

interface MinimalPageTransitionProps {
  children: ReactNode;
  type?: TransitionType;
  duration?: number;
  delay?: number;
  delayChildren?: number;
  staggerChildren?: number;
  skipInitialTransition?: boolean;
}

/**
 * A minimal page transition component with multiple predefined transitions.
 * This component is designed to be a drop-in replacement for the existing PageTransition,
 * but with more options and a simpler implementation.
 *
 * @example
 * ```tsx
 * // In layout.tsx
 * <MinimalPageTransition type="fade" duration={0.3}>
 *   {children}
 * </MinimalPageTransition>
 * ```
 */
export default function MinimalPageTransition({
  children,
  type = 'fade',
  duration = 0.3,
  delay = 0,
  delayChildren = 0,
  staggerChildren = 0.05,
  skipInitialTransition = true,
}: MinimalPageTransitionProps) {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  // Handle mounting
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);
  
  // Handle first render - skip animation if required
  if (!isMounted && skipInitialTransition) {
    return <>{children}</>;
  }

  // Define transition variants based on type
  const getVariants = (): Variants => {
    switch (type) {
      case 'none':
        return {};
      case 'slide-up':
        return {
          initial: { opacity: 0, y: 15 },
          animate: { 
            opacity: 1, 
            y: 0,
            transition: {
              duration,
              delay,
              delayChildren,
              staggerChildren,
            }
          },
          exit: { opacity: 0, y: -15 }
        };
      case 'slide-down':
        return {
          initial: { opacity: 0, y: -15 },
          animate: { 
            opacity: 1, 
            y: 0,
            transition: {
              duration,
              delay,
              delayChildren,
              staggerChildren,
            }
          },
          exit: { opacity: 0, y: 15 }
        };
      case 'slide-left':
        return {
          initial: { opacity: 0, x: 15 },
          animate: { 
            opacity: 1, 
            x: 0,
            transition: {
              duration,
              delay,
              delayChildren,
              staggerChildren,
            }
          },
          exit: { opacity: 0, x: -15 }
        };
      case 'slide-right':
        return {
          initial: { opacity: 0, x: -15 },
          animate: { 
            opacity: 1, 
            x: 0,
            transition: {
              duration,
              delay,
              delayChildren,
              staggerChildren,
            }
          },
          exit: { opacity: 0, x: 15 }
        };
      case 'fade':
      default:
        return {
          initial: { opacity: 0 },
          animate: { 
            opacity: 1,
            transition: {
              duration,
              delay,
              delayChildren,
              staggerChildren,
            }
          },
          exit: { opacity: 0 }
        };
    }
  };

  return (
    <AnimatePresence mode="wait" initial={!skipInitialTransition}>
      <motion.div 
        key={pathname}
        variants={getVariants()}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration }}
        className="min-h-screen"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * For use with MinimalPageTransition for staggered children animations
 */
export function TransitionItem({ children, className = '' }: { children: ReactNode, className?: string }) {
  return (
    <motion.div
      variants={{
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
} 