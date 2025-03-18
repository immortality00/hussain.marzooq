'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';

interface SimplePageTransitionProps {
  children: ReactNode;
  mode?: 'fade' | 'slide' | 'both';
  duration?: number;
}

/**
 * A minimal page transition component that provides gentle animations between routes.
 * This component is designed to be a lighter alternative to the main PageTransition,
 * focusing only on simple fade or slide effects without overlays.
 * 
 * @param children The page content
 * @param mode Animation type: 'fade', 'slide', or 'both' (default: 'fade')
 * @param duration Animation duration in seconds (default: 0.3)
 */
export default function SimplePageTransition({ 
  children, 
  mode = 'fade',
  duration = 0.3 
}: SimplePageTransitionProps) {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  
  // Ensure component is mounted before animating
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Get variants based on animation mode
  const getVariants = () => {
    switch (mode) {
      case 'slide':
        return {
          initial: { opacity: 1, y: 10 },
          enter: { opacity: 1, y: 0 },
          exit: { opacity: 1, y: -10 }
        };
      case 'both':
        return {
          initial: { opacity: 0, y: 10 },
          enter: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -10 }
        };
      case 'fade':
      default:
        return {
          initial: { opacity: 0 },
          enter: { opacity: 1 },
          exit: { opacity: 0 }
        };
    }
  };

  // Don't animate on first render
  if (!isMounted) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial="initial"
        animate="enter"
        exit="exit"
        variants={getVariants()}
        transition={{ 
          duration, 
          ease: 'easeInOut' 
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
} 