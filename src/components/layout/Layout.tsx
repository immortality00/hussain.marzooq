'use client';

import { ReactNode, useEffect, useState } from 'react';
import Navigation from './header/Navigation';
import EnhancedNavigation from './header/EnhancedNavigation';
import CustomCursor from '../ui/CustomCursor';
import SoundSystem from '../ui/SoundSystem';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  
  // Check if current route is an admin route
  const isAdminRoute = pathname?.startsWith('/admin');

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // For admin routes, just render the children without portfolio styling
  if (isAdminRoute) {
    return <>{children}</>;
  }

  // For non-admin routes, render the full portfolio layout
  return (
    <>
      {mounted && <CustomCursor />}
      {mounted && <SoundSystem />}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white relative overflow-hidden"
      >
        {/* Background Noise */}
        <div className="fixed inset-0 bg-noise opacity-[0.015] pointer-events-none" />
        
        {/* Enhanced Navigation with glassmorphic scroll effect */}
        <EnhancedNavigation scrollThreshold={100} isMobileMenuOpen={menuOpen}>
          <Navigation menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
        </EnhancedNavigation>
        
        {/* Main Content */}
        <main className="relative">
          {children}
        </main>
      </motion.div>
    </>
  );
} 