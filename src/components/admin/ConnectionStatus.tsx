'use client';

import { useState, useEffect } from 'react';
import { checkFirebaseConnection } from '@/lib/firebase/config';

interface ConnectionStatusProps {
  showOfflineOnly?: boolean;
  className?: string;
}

export default function ConnectionStatus({ 
  showOfflineOnly = false,
  className = ''
}: ConnectionStatusProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(true);
  const [showStatus, setShowStatus] = useState(false);
  const [checkingConnection, setCheckingConnection] = useState(false);

  // Monitor browser online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Only check Firebase connection when we're actually online
      checkFirebaseConnectionStatus();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setIsFirebaseConnected(false);
    };
    
    // Set initial state for browser connectivity
    setIsOnline(navigator.onLine);
    
    // Add event listeners for browser connectivity
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Initial check for Firebase connection (only if online)
    if (navigator.onLine) {
      checkFirebaseConnectionStatus();
    }
    
    // Set up periodic checks with a reasonable interval (2 minutes)
    // to avoid unnecessary network traffic
    const intervalId = setInterval(() => {
      if (navigator.onLine) {
        checkFirebaseConnectionStatus();
      }
    }, 120000); // Every 2 minutes
    
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
      // Set Firebase connection to true regardless of the actual connection
      // This prevents CORS errors and 404 errors in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Skipping real Firebase connection check in development mode');
        setIsFirebaseConnected(true);
        return;
      }
      
      // Only perform real check in production
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

  let statusType: 'success' | 'warning' | 'error' = 'success';
  let statusTooltip = 'Connected to all services';

  if (!isOnline) {
    statusType = 'error';
    statusTooltip = 'Your device is offline';
  } else if (!isFirebaseConnected) {
    statusType = 'warning';
    statusTooltip = 'Limited backend connection';
  }

  const statusColor = 
    statusType === 'success' ? 'bg-green-500' : 
    statusType === 'warning' ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div 
      className={`relative group ${className}`}
      role="status"
      aria-label={`Connection status: ${statusTooltip}`}
    >
      <div 
        className={`w-3 h-3 rounded-full ${statusColor} ${statusType !== 'success' ? 'animate-pulse' : ''}`}
        onClick={checkFirebaseConnectionStatus}
      ></div>
      
      {/* Tooltip */}
      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        {statusTooltip}
      </div>
    </div>
  );
} 