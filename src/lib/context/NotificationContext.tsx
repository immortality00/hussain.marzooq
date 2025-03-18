'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  showNotification: (type: NotificationType, message: string, duration?: number) => void;
  hideNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  showNotification: () => {},
  hideNotification: () => {},
});

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback(
    (type: NotificationType, message: string, duration = 5000) => {
      const id = Date.now().toString();
      const newNotification = { id, type, message, duration };
      
      setNotifications((prev) => [...prev, newNotification]);
      
      if (duration > 0) {
        setTimeout(() => {
          hideNotification(id);
        }, duration);
      }
      
      return id;
    },
    []
  );

  const hideNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notifications, showNotification, hideNotification }}
    >
      {children}
      <NotificationDisplay />
    </NotificationContext.Provider>
  );
};

const NotificationDisplay: React.FC = () => {
  const { notifications, hideNotification } = useNotification();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md pointer-events-none">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto"
          >
            <div 
              className={`
                p-4 rounded-lg shadow-lg backdrop-blur-lg border flex items-start gap-3
                ${notification.type === 'success' ? 'bg-green-900/20 border-green-700/30 text-green-400' : ''}
                ${notification.type === 'error' ? 'bg-red-900/20 border-red-700/30 text-red-400' : ''}
                ${notification.type === 'warning' ? 'bg-yellow-900/20 border-yellow-700/30 text-yellow-400' : ''}
                ${notification.type === 'info' ? 'bg-blue-900/20 border-blue-700/30 text-blue-400' : ''}
              `}
            >
              {/* Icon based on notification type */}
              <span className="text-xl mt-0.5">
                {notification.type === 'success' && '✓'}
                {notification.type === 'error' && '✕'}
                {notification.type === 'warning' && '⚠'}
                {notification.type === 'info' && 'ℹ'}
              </span>
              
              {/* Message content */}
              <div className="flex-1">
                <p className="text-sm font-medium">{notification.message}</p>
              </div>
              
              {/* Close button */}
              <button 
                onClick={() => hideNotification(notification.id)}
                className="text-sm opacity-70 hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}; 