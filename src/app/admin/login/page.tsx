'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { typography, colors, shadows } from '@/components/admin/designSystem';
import { useRouter } from 'next/navigation';
import GlassPanel from '@/components/ui/GlassPanel';
import { useNotification } from '@/lib/context/NotificationContext';
import Button from '@/components/admin/ui/Button';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const { login } = useAuth();
  const router = useRouter();
  const { showNotification } = useNotification();

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    // Set initial state
    setIsOnline(navigator.onLine);
    
    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Clean up
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if online before attempting login
    if (!isOnline) {
      setError('Your device appears to be offline. Please check your internet connection and try again.');
      showNotification('error', 'Network offline. Please check your connection.');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      await login(email, password, rememberMe);
      
      // If we get here, login was successful
      setLoginSuccess(true);
      showNotification('success', 'Login successful. Redirecting to dashboard...');
      
      // Wait a moment to show success animation before redirect
      setTimeout(() => {
        router.push('/admin/dashboard');
      }, 1500);
      
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to login. Please check your credentials and try again.';
      setError(errorMessage);
      showNotification('error', 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const formAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  const titleAnimation = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        delay: 0.2,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  // Animated background elements
  const circleVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        duration: 1.5,
        ease: [0.16, 1, 0.3, 1],
      }
    }
  };

  // Text animation for letter-by-letter reveal
  const letterContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
        delayChildren: 0.3
      }
    }
  };

  const letterVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  // Function for letter animation
  const AnimatedText = ({ text, className }: { text: string, className?: string }) => (
    <motion.span
      variants={letterContainerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {text.split('').map((char, index) => (
        <motion.span
          key={index}
          variants={letterVariants}
          className="inline-block"
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </motion.span>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 via-indigo-950/30 to-black p-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="fixed inset-0 bg-noise opacity-[0.015] pointer-events-none" />
      
      {/* Animated decorative circles */}
      <motion.div 
        className="absolute top-[15%] right-[15%] w-64 h-64 rounded-full bg-gradient-to-r from-blue-600/10 to-purple-600/10 blur-3xl"
        variants={circleVariants}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.2 }}
      />
      <motion.div 
        className="absolute bottom-[20%] left-[10%] w-80 h-80 rounded-full bg-gradient-to-r from-cyan-500/10 to-teal-500/10 blur-3xl"
        variants={circleVariants}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.4 }}
      />
      
      {/* Light beams */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-1/3 bg-gradient-to-b from-blue-500/20 to-transparent opacity-30 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 w-1/4 h-1/3 bg-gradient-to-t from-purple-500/20 to-transparent opacity-30 blur-3xl" />
      
      {/* Content */}
      <div className="relative z-10 max-w-md w-full">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={titleAnimation}
          className="text-center mb-8"
        >
          <div className="mb-3 overflow-hidden">
            <motion.h1 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className={`${typography.heading.display2} mb-0 inline-block ${typography.special.gradient} bg-gradient-to-r ${colors.accent.blue} ${shadows.text.lg}`}
            >
              <AnimatedText text="Admin Portal" />
            </motion.h1>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className={`${typography.body.base} ${colors.text.secondary} max-w-md`}
          >
            Sign in to access your portfolio management dashboard
          </motion.p>
        </motion.div>

        <GlassPanel 
          intensity="medium" 
          className="w-full" 
          gradientBorder={true}
          hasShadow={true}
          animateEntry={true}
          tilt={true}
          hover={true}
        >
          <div className="p-8">
            <AnimatePresence mode="wait">
              {loginSuccess ? (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center py-8"
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                    className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 border border-green-500/30 mb-6"
                  >
                    <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                  <motion.h2 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className={`${typography.heading.h2} mb-3 ${colors.text.primary}`}
                  >
                    Login Successful
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className={`${typography.body.base} ${colors.text.secondary} mb-6`}
                  >
                    Redirecting you to the dashboard...
                  </motion.p>
                  <div className="h-1.5 w-full bg-gray-200/10 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500"
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 1.5, ease: "easeInOut" }}
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.form 
                  key="form"
                  onSubmit={handleSubmit}
                  variants={formAnimation}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, y: 20 }}
                  className="space-y-6"
                >
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex justify-center mb-6"
                  >
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                    </div>
                  </motion.div>
                  
                  {/* Email Field */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <label htmlFor="email" className={`block mb-2 ${typography.body.small} font-medium ${colors.text.secondary}`}>
                      Email Address
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </span>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:outline-none text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-200"
                        placeholder="your@email.com"
                      />
                    </div>
                  </motion.div>

                  {/* Password Field */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label htmlFor="password" className={`block mb-2 ${typography.body.small} font-medium ${colors.text.secondary}`}>
                      Password
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </span>
                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:outline-none text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-200"
                        placeholder="••••••••"
                      />
                    </div>
                  </motion.div>

                  {/* Remember Me */}
                  <motion.div 
                    className="flex items-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="relative inline-flex items-center">
                      <input
                        id="remember-me"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="sr-only"
                      />
                      <div 
                        className={`w-5 h-5 border ${rememberMe ? 'bg-blue-500 border-blue-600' : 'bg-white/5 border-white/20'} rounded transition-colors duration-200 flex items-center justify-center`}
                        onClick={() => setRememberMe(!rememberMe)}
                      >
                        {rememberMe && (
                          <motion.svg 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-3 h-3 text-white" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </motion.svg>
                        )}
                      </div>
                      <label htmlFor="remember-me" className={`ml-2 block ${typography.body.small} ${colors.text.secondary} cursor-pointer`}>
                        Remember me
                      </label>
                    </div>
                  </motion.div>

                  {/* Error Message */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="py-2 px-3 bg-red-900/20 border border-red-700/30 rounded-lg overflow-hidden"
                      >
                        <p className="text-sm text-red-400">{error}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Offline Warning */}
                  <AnimatePresence>
                    {!isOnline && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="py-2 px-3 bg-yellow-900/20 border border-yellow-700/30 rounded-lg overflow-hidden"
                      >
                        <p className="text-sm text-yellow-400">
                          You appear to be offline. Please check your internet connection.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Login Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Button
                      type="submit"
                      variant="primary" 
                      size="large"
                      isLoading={loading}
                      disabled={loading || !isOnline}
                      className="w-full relative overflow-hidden group"
                    >
                      <motion.span 
                        className="absolute inset-0 w-full bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                        initial={{ x: '-100%' }}
                        animate={{ x: '100%' }}
                        transition={{ 
                          repeat: Infinity, 
                          duration: 2,
                          ease: "linear",
                          repeatDelay: 1
                        }}
                      />
                      Sign In
                    </Button>
                  </motion.div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </GlassPanel>
        
        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-6"
        >
          <p className={`${typography.body.small} ${colors.text.muted}`}>
            Secure login • Portfolio Admin
          </p>
        </motion.div>
      </div>
    </div>
  );
}