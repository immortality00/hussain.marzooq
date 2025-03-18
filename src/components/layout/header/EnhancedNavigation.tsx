import { useState, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import styles from './NavigationStyles.module.css';

interface EnhancedNavigationProps {
  children: ReactNode;
  scrollThreshold?: number;
  isMobileMenuOpen?: boolean;
}

// List of pages that should have transparent navbar by default
const TRANSPARENT_PAGES = ['/', '/about', '/photography', '/film'];

/**
 * EnhancedNavigation component
 * 
 * Wraps the existing Navigation component and adds scroll-based
 * glassmorphic effects with gold theme styling.
 */
export default function EnhancedNavigation({ 
  children, 
  scrollThreshold = 100,
  isMobileMenuOpen = false
}: EnhancedNavigationProps) {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname() || '';
  
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      
      // Set scrolled state if user has scrolled past threshold
      setScrolled(currentScrollPos > scrollThreshold);
    };
    
    // Initial check on mount
    handleScroll();
    
    // Add scroll event listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrollThreshold]);
  
  // Check if current page should have transparent navbar by default
  const shouldBeTransparent = TRANSPARENT_PAGES.includes(pathname);
  
  // Force glassmorphic effect when mobile menu is open or scrolled
  const shouldShowGlassmorphic = scrolled || isMobileMenuOpen;
  
  // Determine the appropriate background style based on page and scroll state
  const getNavStyle = () => {
    if (shouldShowGlassmorphic) {
      return styles.navGlassmorphic;
    }
    
    if (shouldBeTransparent) {
      return styles.navTransparent;
    }
    
    return styles.navSemiTransparent;
  };
  
  return (
    <div 
      className={`
        ${styles.navContainer} 
        ${styles.navTransition}
        ${getNavStyle()}
        sticky top-0 z-90
      `}
    >
      {/* Brand identity gold accent bar */}
      <div 
        className={`
          ${styles.brandBar} 
          ${shouldShowGlassmorphic || !shouldBeTransparent ? styles.brandBarVisible : ''}
        `} 
        aria-hidden="true"
      >
        {/* Logo removed to prevent duplication */}
      </div>
      
      {/* Gold gradient overlay that appears on scroll */}
      <div 
        className={`
          ${styles.navGradient} 
          ${shouldShowGlassmorphic ? styles.navGradientVisible : ''}
        `} 
        aria-hidden="true"
      />
      
      {/* Pass through the original Navigation component */}
      {children}
    </div>
  );
} 