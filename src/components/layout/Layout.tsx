'use client';

import { ReactNode } from 'react';
import Navigation from './header/Navigation';
import CustomCursor from '../ui/CustomCursor';
import SoundSystem from '../ui/SoundSystem';
import { motion } from 'framer-motion';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <CustomCursor />
      <SoundSystem />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white relative overflow-hidden"
      >
        {/* Background Noise */}
        <div className="fixed inset-0 bg-noise opacity-[0.015] pointer-events-none" />
        
        {/* Navigation */}
        <Navigation menuOpen={false} setMenuOpen={() => {}} />
        
        {/* Main Content */}
        <main className="relative">
          {children}
        </main>
      </motion.div>
    </>
  );
} 