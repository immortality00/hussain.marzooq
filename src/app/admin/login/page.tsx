'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { motion } from 'framer-motion';
import { typography, colors, shadows, variants, forms } from '@/components/admin/designSystem';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const { login } = useAuth();

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
      return;
    }
    
    setError('');
    setLoading(true);
    setLoginSuccess(false);

    try {
      await login(email, password, rememberMe);
      setLoginSuccess(true);
      
      // Add a fallback redirect
      setTimeout(() => {
        if (window.location.pathname === '/admin/login') {
          console.log('Performing fallback navigation to dashboard');
          window.location.href = '/admin/dashboard';
        }
      }, 1000);
    } catch (error: unknown) {
      console.error('Authentication error occurred');
      
      if (!navigator.onLine) {
        setError('Your device is currently offline. Please check your internet connection and try again.');
      } else if (error instanceof Error) {
        if (error.message.includes('auth/wrong-password') || 
            error.message.includes('auth/user-not-found') || 
            error.message.includes('auth/invalid-credential')) {
          setError('Invalid email or password. Please try again.');
        } else if (error.message.includes('auth/too-many-requests')) {
          setError('Too many login attempts. Please try again later or reset your password.');
        } else if (error.message.includes('offline') || error.message.includes('network')) {
          setError('Cannot connect to the server. Please check your internet connection and try again.');
        } else {
          setError('Authentication failed. Please check your credentials and try again.');
        }
      } else {
        setError('An unexpected error occurred. Please try again later.');
      }
      
      setLoginSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  // Manual navigation function
  const goToDashboard = () => {
    window.location.href = '/admin/dashboard';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black py-12 px-4 sm:px-6 lg:px-8">
      {/* Subtle noise texture */}
      <div className="fixed inset-0 bg-noise opacity-[0.015] pointer-events-none" />
      
      {!isOnline && (
        <motion.div 
          className="fixed top-4 left-0 right-0 mx-auto w-full max-w-md z-50"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className={`${colors.status.warning.bg} ${colors.status.warning.border} ${colors.status.warning.text} p-4 rounded-lg border text-center shadow-lg`}>
            <p className="font-medium">⚠️ You are currently offline</p>
            <p className="text-sm mt-1">Some features may be unavailable until your connection is restored</p>
          </div>
        </motion.div>
      )}
      
      <motion.div 
        className="max-w-md w-full space-y-8"
        variants={variants.fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ staggerChildren: 0.1 }}
      >
        <motion.div variants={variants.fadeInUp}>
          <motion.h2 
            className={`mt-6 text-center ${typography.heading.h1} bg-gradient-to-r ${colors.accent.blue} ${typography.special.gradient}`}
          >
            Admin Login
          </motion.h2>
          <motion.p 
            className={`mt-2 text-center ${typography.body.base} ${colors.text.secondary}`}
            variants={variants.fadeInUp}
          >
            Secure access to portfolio management
          </motion.p>
        </motion.div>
        
        <motion.form 
          className="mt-8 space-y-6" 
          onSubmit={handleSubmit}
          variants={variants.fadeInUp}
        >
          <motion.div 
            className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6 shadow-lg"
            variants={variants.fadeInUp}
          >
            <div className="space-y-4">
              <div>
                <label htmlFor="email-address" className={forms.label}>
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={forms.input}
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className={forms.label}>
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className={forms.input}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center mt-4">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 bg-gray-800 border-gray-600 text-blue-500 focus:ring-blue-500 rounded"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="remember-me" className={`ml-2 ${typography.body.small} ${colors.text.secondary}`}>
                Remember me
              </label>
            </div>
          </motion.div>

          {error && (
            <motion.div 
              className={`${colors.status.error.bg} ${colors.status.error.border} ${colors.status.error.text} p-3 rounded-lg border`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}

          {loginSuccess && (
            <motion.div 
              className={`${colors.status.success.bg} ${colors.status.success.border} ${colors.status.success.text} p-3 rounded-lg border`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p>Login successful! You should be redirected automatically.</p>
              <motion.button 
                onClick={goToDashboard}
                className={`relative overflow-hidden w-full mt-2 px-4 py-2 bg-gradient-to-r ${colors.accent.teal} rounded-lg text-white font-medium tracking-wide shadow-lg`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.span 
                  className="absolute inset-0 bg-white/20"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6 }}
                />
                <span className="relative z-10">Go to Dashboard</span>
              </motion.button>
            </motion.div>
          )}

          <motion.div variants={variants.fadeInUp}>
            <motion.button
              type="submit"
              disabled={loading || !isOnline}
              className={`relative overflow-hidden w-full px-6 py-3 bg-gradient-to-r ${colors.accent.blue} text-white font-medium tracking-wide rounded-lg ${shadows.glow.blue} disabled:opacity-50`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.span 
                className="absolute inset-0 bg-white/20"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
              />
              <span className="relative z-10 flex items-center justify-center">
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : !isOnline ? 'Offline (Login Unavailable)' : 'Sign in'}
              </span>
            </motion.button>
          </motion.div>

          <motion.div 
            className={`text-center ${colors.text.secondary} ${typography.body.small}`}
            variants={variants.fadeInUp}
          >
            <p>Protected by enhanced security measures</p>
            <p className={`${typography.body.caption} mt-1 ${colors.text.muted}`}>Multiple failed attempts will result in temporary lockout</p>
          </motion.div>
        </motion.form>
      </motion.div>
    </div>
  );
} 