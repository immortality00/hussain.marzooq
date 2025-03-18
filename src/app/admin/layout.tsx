'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import AdminCursor from '@/components/admin/AdminCursor';
import AdminSoundSystem from '@/components/admin/AdminSoundSystem';
// ConnectionStatus will be used in specific components, not in the layout directly
import { variants } from '@/components/admin/designSystem';
import { NotificationProvider } from '@/lib/context/NotificationContext';
import './adminStyles.css';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Add custom body class for admin pages
    document.body.classList.add('admin-mode');
    
    return () => {
      document.body.classList.remove('admin-mode');
    };
  }, []);

  // Don't render anything until component has mounted
  if (!mounted) {
    return null;
  }

  // For login page, don't show admin layout, but still add cursor and sound
  if (isLoginPage) {
    return (
      <NotificationProvider>
        <AdminCursor />
        <AdminSoundSystem />
        {children}
      </NotificationProvider>
    );
  }

  // Main admin layout with navigation sidebar
  return (
    <NotificationProvider>
      <AdminCursor />
      <AdminSoundSystem />
      
      <AnimatePresence mode="wait">
        {loading ? (
          // Loading state
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black">
            <div className="fixed inset-0 bg-noise opacity-[0.015] pointer-events-none" />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-full border-t-2 border-blue-500 w-10 h-10 animate-spin"
            />
          </div>
        ) : !user ? (
          <motion.div 
            key="unauthorized"
            variants={variants.fadeIn}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-black text-white p-4"
          >
            <div className="fixed inset-0 bg-noise opacity-[0.015] pointer-events-none" />
            <motion.div
              variants={variants.textReveal}
              className="text-3xl md:text-4xl font-display font-bold text-red-400 mb-4 text-center"
            >
              Authentication Required
            </motion.div>
            <motion.div 
              variants={variants.fadeInUp}
              custom={1}
              className="mb-8 text-gray-300 max-w-md text-center"
            >
              You need to be logged in to access the admin area. Your session may have expired.
            </motion.div>
            <motion.div
              variants={variants.fadeInUp}
              custom={2}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link 
                href="/admin/login"
                className="admin-button-gold relative overflow-hidden px-8 py-3 rounded-lg font-medium tracking-wide"
              >
                <motion.span 
                  className="absolute inset-0 bg-white/20"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6 }}
                />
                <span className="relative z-10">Go to Login</span>
              </Link>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div 
            key="content"
            variants={variants.fadeIn}
            initial="hidden"
            animate="visible"
            className="min-h-screen admin-dashboard text-white relative"
          >
            {/* Camera background elements */}
            <div className="camera-backdrop camera-top-right" />
            <div className="camera-backdrop camera-bottom-left" />
            <div className="camera-backdrop camera-center" />
            
            <div className="fixed inset-0 bg-noise opacity-[0.015] pointer-events-none" />
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </NotificationProvider>
  );
} 