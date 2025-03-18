import { ReactNode, Suspense } from 'react';
import { motion } from 'framer-motion';
import styles from './HeroStyles.module.css';

interface EnhancedHeroProps {
  children: ReactNode;
  className?: string;
}

/**
 * EnhancedHero component
 * 
 * This component is designed to wrap around the existing Hero section content
 * to add glassmorphic effects and animations without affecting the existing functionality.
 */
export default function EnhancedHero({ 
  children, 
  className = ''
}: EnhancedHeroProps) {
  // Animation variants for staggered children animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Suspense fallback={null}>
        {/* Glassmorphic overlay with blur effect */}
        <div className={styles.glassOverlay} />
        
        {/* Animated glowing accent elements */}
        <div className={styles.glowAccent} style={{ top: '20%', left: '15%' }} />
        <div className={styles.glowAccent} style={{ top: '60%', right: '20%' }} />
      </Suspense>
      
      {/* Pass through the original content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10"
      >
        {children}
      </motion.div>
    </div>
  );
}

/**
 * GlassmorphicPanel component
 * 
 * A reusable component that adds a glassmorphic panel effect
 * while preserving the content inside.
 */
export function GlassmorphicPanel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`${styles.glassPanel} ${className}`}>
      {children}
    </div>
  );
}

/**
 * AnimatedText component
 * 
 * A component that adds fade-in or slide-in animations to text elements.
 */
export function AnimatedText({ 
  children, 
  animation = 'fade', 
  delay = 1, 
  className = '' 
}: { 
  children: ReactNode; 
  animation?: 'fade' | 'slide'; 
  delay?: 1 | 2 | 3;
  className?: string;
}) {
  const animationClass = animation === 'fade' ? styles.animateFadeIn : styles.animateSlideIn;
  const delayClass = styles[`delay${delay}`];
  
  return (
    <div className={`${animationClass} ${delayClass} ${className}`}>
      {children}
    </div>
  );
} 