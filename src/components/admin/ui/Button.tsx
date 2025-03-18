'use client';

import React from 'react';
import { motion } from 'framer-motion';

// Button variants
type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'outline' | 'ghost';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  // Variant styles
  const variantStyles = {
    primary: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md shadow-blue-900/20',
    secondary: 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-md shadow-purple-900/20',
    success: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md shadow-green-900/20',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md shadow-red-900/20',
    outline: 'bg-transparent border border-white/20 hover:bg-white/5 text-white',
    ghost: 'bg-transparent hover:bg-white/5 text-white',
  };

  // Size styles
  const sizeStyles = {
    small: 'text-xs px-3 py-1.5 rounded-md',
    medium: 'text-sm px-4 py-2 rounded-lg',
    large: 'text-base px-6 py-3 rounded-lg',
  };

  // Base classes
  const baseClasses = `
    relative font-medium transition-all duration-200
    inline-flex items-center justify-center gap-2
    ${isLoading || disabled ? 'opacity-70 cursor-not-allowed' : 'transform hover:-translate-y-0.5 active:translate-y-0'}
    ${fullWidth ? 'w-full' : ''}
    ${sizeStyles[size]}
    ${variantStyles[variant]}
    ${className}
  `;

  // For focus management, important for keyboard navigation
  const [isRingVisible, setIsRingVisible] = React.useState(false);

  return (
    <motion.button
      type={type}
      className={`
        ${baseClasses}
        ${isRingVisible ? 'ring-2 ring-blue-400 ring-offset-1 ring-offset-black' : ''}
      `}
      disabled={isLoading || disabled}
      whileTap={{ scale: 0.98 }}
      whileHover={!isLoading && !disabled ? { scale: 1.02 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 10 }}
      onFocus={() => setIsRingVisible(true)}
      onBlur={() => setIsRingVisible(false)}
      {...props}
    >
      {/* Loading spinner */}
      {isLoading && (
        <span className="absolute inset-0 flex items-center justify-center bg-inherit rounded-lg">
          <svg 
            className="animate-spin h-5 w-5 text-white/70" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
            aria-hidden="true"
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
        </span>
      )}
      
      {/* Button content */}
      <span className={`flex items-center justify-center gap-2 ${isLoading ? 'invisible' : 'visible'}`}>
        {leftIcon && <span className="inline-flex">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="inline-flex">{rightIcon}</span>}
      </span>
    </motion.button>
  );
} 