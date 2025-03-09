'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { colors, typography } from '@/components/admin/designSystem';
import { checkFirebaseConnection } from '@/lib/firebase/config';

interface ConnectionStatusProps {
  position?: 'top' | 'bottom';
  showOfflineOnly?: boolean;
}

export default function ConnectionStatus({ 
  position = 'top',
  showOfflineOnly = false 
}: ConnectionStatusProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(true);
  const [showStatus, setShowStatus] = useState(false);
  const [checkingConnection, setCheckingConnection] = useState(false);

  // Monitor browser online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      checkFirebaseConnectionStatus();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setIsFirebaseConnected(false);
    };
    
    // Set initial states
    setIsOnline(navigator.onLine);
    
    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Initial check for Firebase connection
    checkFirebaseConnectionStatus();
    
    // Set up periodic checks when online
    const intervalId = setInterval(() => {
      if (navigator.onLine) {
        checkFirebaseConnectionStatus();
      }
    }, 30000); // Every 30 seconds
    
    // Clean up
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, []);

  // Determine whether to show the status
  useEffect(() => {
    if (showOfflineOnly) {
      setShowStatus(!isOnline || !isFirebaseConnected);
    } else {
      setShowStatus(true);
    }
  }, [isOnline, isFirebaseConnected, showOfflineOnly]);

  // Check Firebase connection
  const checkFirebaseConnectionStatus = async () => {
    if (checkingConnection) return;
    
    setCheckingConnection(true);
    try {
      const connected = await checkFirebaseConnection();
      setIsFirebaseConnected(connected);
    } catch (error) {
      console.error('Error checking Firebase connection:', error);
      setIsFirebaseConnected(false);
    } finally {
      setCheckingConnection(false);
    }
  };

  if (!showStatus) return null;

  const positionClass = position === 'top' 
    ? 'top-4 left-0 right-0' 
    : 'bottom-4 left-0 right-0';

  let statusType: 'success' | 'warning' | 'error' = 'success';
  let statusText = 'Connected';
  let statusDescription = 'Your device is online and connected to all services';

  if (!isOnline) {
    statusType = 'error';
    statusText = 'Offline';
    statusDescription = 'Your device is currently offline. Some features may be unavailable';
  } else if (!isFirebaseConnected) {
    statusType = 'warning';
    statusText = 'Limited Connection';
    statusDescription = 'Connected to internet but backend services are unreachable';
  }

  return (
    <AnimatePresence>
      <motion.div 
        className={`fixed ${positionClass} mx-auto w-full max-w-md z-50 px-4`}
        initial={{ opacity: 0, y: position === 'top' ? -20 : 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: position === 'top' ? -20 : 20 }}
      >
        <div className={`
          ${colors.status[statusType].bg} 
          ${colors.status[statusType].border} 
          ${colors.status[statusType].text} 
          p-3 rounded-lg border text-center shadow-lg flex items-center justify-center
        `}>
          <div className="flex-1 text-left flex items-center">
            <div className={`w-3 h-3 rounded-full ${
              statusType === 'success' ? 'bg-green-500' : 
              statusType === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
            } mr-2 animate-pulse`}></div>
            <div>
              <p className="font-medium">{statusText}</p>
              <p className={`${typography.body.small} mt-0.5`}>{statusDescription}</p>
            </div>
          </div>
          
          {statusType !== 'success' && (
            <button 
              onClick={checkFirebaseConnectionStatus}
              disabled={checkingConnection}
              className="ml-2 p-1.5 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Retry connection"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-5 w-5 ${checkingConnection ? 'animate-spin' : ''}`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                />
              </svg>
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
} 