'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export default function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
  isLoading = false,
}: ConfirmationDialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = React.useState(false);
  
  // Handle mounting state for SSR
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Handle keyboard navigation and escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Tab') {
        // Trap focus within dialog
        if (!document.activeElement) return;
        
        const focusableElements = [
          confirmButtonRef.current,
          cancelButtonRef.current,
        ].filter(Boolean) as HTMLElement[];
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (!e.shiftKey && document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        } else if (e.shiftKey && document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      }
    };

    // Auto-focus cancel button when dialog opens
    if (cancelButtonRef.current) {
      setTimeout(() => cancelButtonRef.current?.focus(), 50);
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scrolling when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle click outside of dialog to close
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  // Type-specific styles
  const typeStyles = {
    danger: {
      icon: '⚠️',
      confirmBtn: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white',
      title: 'text-red-400',
    },
    warning: {
      icon: '⚠️',
      confirmBtn: 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white',
      title: 'text-yellow-400',
    },
    info: {
      icon: 'ℹ️',
      confirmBtn: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white',
      title: 'text-blue-400',
    }
  };

  // Exit if not mounted (SSR)
  if (!mounted) return null;

  // Portal to body to avoid z-index issues  
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dialog-title"
          aria-describedby="dialog-description"
        >
          {/* Backdrop */}
          <motion.div
            ref={overlayRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleOverlayClick}
          />
          
          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', bounce: 0.1 }}
            className="relative bg-gray-900 border border-white/10 rounded-xl shadow-2xl max-w-md w-full mx-auto overflow-hidden"
          >
            {/* Dialog header */}
            <div className="p-5 border-b border-white/10 flex items-start gap-3">
              <span className="text-2xl">{typeStyles[type].icon}</span>
              <div>
                <h2 
                  id="dialog-title" 
                  className={`text-lg font-medium ${typeStyles[type].title}`}
                >
                  {title}
                </h2>
                <p 
                  id="dialog-description" 
                  className="mt-1 text-sm text-gray-300"
                >
                  {message}
                </p>
              </div>
            </div>
            
            {/* Dialog actions */}
            <div className="p-4 flex justify-end gap-3 bg-black/20">
              <button
                ref={cancelButtonRef}
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                disabled={isLoading}
              >
                {cancelText}
              </button>
              <button
                ref={confirmButtonRef}
                onClick={onConfirm}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${typeStyles[type].confirmBtn} ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
} 