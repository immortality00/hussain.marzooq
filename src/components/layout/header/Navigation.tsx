'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import GlassPanel from '@/components/ui/GlassPanel';
import IconSystem from '@/components/ui/IconSystem';
import SparkleWrapper from '@/components/ui/Sparkle';
import Logo from '@/components/ui/Logo';
import styles from './NavigationStyles.module.css';

interface NavigationProps {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
}

const navLinks = [
  { href: '/', label: 'Home', type: 'home' },
  { href: '/about', label: 'About', type: 'about' },
  { href: '/photography', label: 'Photography', type: 'photography' },
  { href: '/film', label: 'Film', type: 'film' },
  { href: '/webdev', label: 'Web Dev', type: 'webdev' },
  { href: '/nfts', label: 'NFTs', type: 'nfts' },
  { href: '/dance', label: 'Dance', type: 'dance' },
  { href: '/contact', label: 'Contact', type: 'contact' },
] as const;

// Memoized navigation link component for better performance
const NavigationLink = React.memo(({ 
  link, 
  isActive,
  onClick
}: { 
  link: typeof navLinks[number];
  isActive: boolean;
  onClick?: () => void;
}) => {
  return (
    <SparkleWrapper active={isActive}>
      <Link
        href={link.href}
        className={`flex items-center space-x-3 p-3 rounded-lg ${
          isActive
            ? 'bg-white/10 text-white font-medium'
            : 'text-gray-300 hover:bg-white/5 hover:text-white'
        }`}
        onClick={onClick}
      >
        <IconSystem type={link.type} size={20} className="text-current" />
        <span className="font-medium">{link.label}</span>
      </Link>
    </SparkleWrapper>
  );
});

NavigationLink.displayName = 'NavigationLink';

export default function Navigation({ menuOpen, setMenuOpen }: NavigationProps) {
  const pathname = usePathname();

  // Handle link click with special case for homepage
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    setMenuOpen(false);
    
    // Force full page reload when navigating to home to avoid empty page issue
    if (href === '/') {
      e.preventDefault();
      window.location.href = '/';
    }
  };

  return (
    <GlassPanel
      intensity="transparent"
      className="relative z-95 transition-all duration-300"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <nav className="relative flex items-center justify-between h-20 px-1 sm:px-3 lg:px-5">
        {/* Logo */}
        <SparkleWrapper>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-shrink-0 -ml-1 sm:-ml-2"
          >
            <Link 
              href="/" 
              onClick={(e) => handleNavClick(e, '/')}
              className="flex items-center gold-shine pt-2"
            >
              <Logo size="md" className="h-16 w-auto mr-4" withLink={false} withGlow={true} />
              <span className="font-display text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gold-400 to-orange-400 text-shadow-sm whitespace-nowrap">
                Hussain Marzooq
              </span>
            </Link>
          </motion.div>
        </SparkleWrapper>

        {/* Desktop Navigation */}
        <div className="hidden md:block md:ml-auto">
          <ul className="flex items-center justify-end space-x-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <motion.li
                  key={link.href}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center"
                >
                  <SparkleWrapper active={isActive}>
                    <Link
                      href={link.href}
                      style={isActive ? { 
                        borderBottom: '3px solid #d4af37', 
                        position: 'relative'
                      } : undefined}
                      className={`relative font-sans px-3 py-2 transition-colors duration-200 gold-nav-link ${styles.desktopNavItem} ${
                        isActive
                          ? `text-white font-medium gold-nav-active gold-horizontal-highlight`
                          : 'text-gray-400 hover:text-white'
                      }`}
                      onClick={(e) => handleNavClick(e, link.href)}
                    >
                      <motion.span
                        className="relative z-10 inline-flex items-center gap-2 whitespace-nowrap"
                        whileHover={{ y: -2 }}
                        whileTap={{ y: 0 }}
                      >
                        <IconSystem type={link.type} size={16} />
                        {link.label}
                      </motion.span>
                    </Link>
                  </SparkleWrapper>
                </motion.li>
              );
            })}
          </ul>
        </div>

        {/* Mobile Menu Button - Improved tap target and feedback */}
        <button
          type="button"
          className={`md:hidden inline-flex items-center justify-center p-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 bg-white/5 focus:outline-none gold-menu-toggle ${styles.menuToggle} ${menuOpen ? styles.menuToggleActive : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
        >
          <span className="sr-only">Open main menu</span>
          <div className="w-6 h-6 flex flex-col justify-center items-center">
            <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
            <span className={`block w-5 h-0.5 bg-current mt-1 transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-current mt-1 transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
          </div>
        </button>
      </nav>

      {/* Mobile Menu Backdrop Overlay */}
      {menuOpen && (
        <div 
          className={`${styles.mobileMenuOverlay} ${menuOpen ? styles.mobileMenuOverlayVisible : ''}`}
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Menu - Fixed position instead of absolute, always on top */}
      {menuOpen && (
        <div className={`fixed inset-x-0 top-16 z-100 md:hidden ${styles.mobileMenuContainer}`}>
          <GlassPanel 
            intensity="high" 
            className={`m-2 p-4 mt-2 gold-mobile-menu ${styles.mobileMenu}`}
            gradientBorder={true}
          >
            <ul className="space-y-3">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <li key={link.href}>
                    <SparkleWrapper active={isActive}>
                      <Link
                        href={link.href}
                        style={isActive ? { 
                          borderBottom: '3px solid #d4af37', 
                          position: 'relative'
                        } : undefined}
                        className={`flex items-center relative space-x-3 p-3 rounded-lg ${styles.mobileMenuLink} ${
                          isActive
                            ? `text-white gold-text-pulse`
                            : 'text-gray-300 hover:text-white'
                        }`}
                        onClick={(e) => handleNavClick(e, link.href)}
                      >
                        <IconSystem type={link.type} size={20} className="text-current" />
                        <span className="font-medium">{link.label}</span>
                      </Link>
                    </SparkleWrapper>
                  </li>
                );
              })}
            </ul>
          </GlassPanel>
        </div>
      )}
    </GlassPanel>
  );
} 