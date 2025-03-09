'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import AdminCursor from '@/components/admin/AdminCursor';
import AdminSoundSystem from '@/components/admin/AdminSoundSystem';
import ConnectionStatus from '@/components/admin/ConnectionStatus';
import { variants, transitions } from '@/components/admin/designSystem';

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
      <>
        <AdminCursor />
        <AdminSoundSystem />
        <ConnectionStatus showOfflineOnly={true} />
        {children}
      </>
    );
  }

  return (
    <>
      {/* Admin UI Enhancements */}
      <AdminCursor />
      <AdminSoundSystem />
      <ConnectionStatus position="top" showOfflineOnly={true} />
      
      {/* Authentication Check */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transitions.default}
            className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-black text-white"
          >
            <div className="fixed inset-0 bg-noise opacity-[0.015] pointer-events-none" />
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 2,
              }}
              className="text-3xl font-display text-blue-300"
            >
              Loading
            </motion.div>
            <div className="mt-3 flex space-x-1">
              {[0, 1, 2].map(i => (
                <motion.div 
                  key={i}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 1.5, 
                    delay: i * 0.2,
                  }}
                  className="w-2 h-2 rounded-full bg-blue-400"
                />
              ))}
            </div>
          </motion.div>
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
                className="relative overflow-hidden px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.5)] font-medium tracking-wide"
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
            className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white relative"
          >
            <div className="fixed inset-0 bg-noise opacity-[0.015] pointer-events-none" />
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 