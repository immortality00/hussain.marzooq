'use client';

import React from 'react';
import { motion } from 'framer-motion';

type LoadingSize = 'small' | 'medium' | 'large';
type LoadingType = 'spinner' | 'dots' | 'pulse';

interface LoadingIndicatorProps {
  size?: LoadingSize;
  type?: LoadingType;
  text?: string;
  textPosition?: 'left' | 'right' | 'bottom';
  className?: string;
  color?: string;
}

const sizeMap = {
  small: {
    spinner: 'h-4 w-4',
    dots: 'h-1.5 w-1.5',
    container: 'text-xs',
  },
  medium: {
    spinner: 'h-8 w-8',
    dots: 'h-2.5 w-2.5',
    container: 'text-sm',
  },
  large: {
    spinner: 'h-12 w-12',
    dots: 'h-3 w-3',
    container: 'text-base',
  },
};

export default function LoadingIndicator({
  size = 'medium',
  type = 'spinner',
  text,
  textPosition = 'right',
  className = '',
  color = 'text-blue-500'
}: LoadingIndicatorProps) {
  
  const renderLoader = () => {
    switch (type) {
      case 'spinner':
        return (
          <div className={`${sizeMap[size].spinner} ${color}`} aria-hidden="true">
            <svg 
              className="animate-spin h-full w-full" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              ></circle>
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        );
        
      case 'dots':
        return (
          <div className="flex space-x-2" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className={`${sizeMap[size].dots} rounded-full ${color}`}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 1.2, 
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        );
        
      case 'pulse':
        return (
          <motion.div
            className={`${sizeMap[size].spinner} ${color} rounded-full`}
            initial={{ opacity: 0.6, scale: 0.8 }}
            animate={{ 
              opacity: [0.6, 1, 0.6],
              scale: [0.8, 1.2, 0.8]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 1.5,
              ease: "easeInOut"
            }}
            aria-hidden="true"
          />
        );
    }
  };

  // Flex direction based on text position
  const flexDirection = {
    left: 'flex-row-reverse',
    right: 'flex-row',
    bottom: 'flex-col',
  };

  return (
    <div className={`flex items-center justify-center ${flexDirection[textPosition]} gap-3 ${className}`} role="status">
      {renderLoader()}
      
      {text && (
        <span className={`${sizeMap[size].container} text-gray-300`}>
          {text}
        </span>
      )}
      
      {/* Screen reader only text if no visible text is provided */}
      {!text && (
        <span className="sr-only">Loading...</span>
      )}
    </div>
  );
} 