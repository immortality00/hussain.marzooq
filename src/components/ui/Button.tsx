import React, { ButtonHTMLAttributes } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type ButtonVariant = 'gold' | 'gold-outline' | 'gold-gradient' | 'gold-glow' | 'default';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * Button component that adheres to the site's golden/orange color scheme
 * 
 * Features:
 * - Multiple variants: gold, gold-outline, gold-gradient, gold-glow
 * - Size options: sm, md (default), lg
 * - Can be rendered as a link when href is provided
 * - Maintains all standard button attributes
 */
export default function Button({
  variant = 'default',
  size = 'md',
  href,
  className = '',
  children,
  ...props
}: ButtonProps) {
  // Base button classes
  const baseClasses = 'inline-flex items-center justify-center font-medium focus:outline-none transition-all';
  
  // Variant classes
  const variantClasses = {
    gold: 'btn-gold',
    'gold-outline': 'btn-gold-outline',
    'gold-gradient': 'btn-gold-gradient',
    'gold-glow': 'btn-gold-glow',
    default: 'bg-blue-600 hover:bg-blue-700 text-white rounded py-2 px-4 transition-colors'
  };
  
  // Size classes
  const sizeClasses = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg'
  };
  
  // Combine all classes
  const buttonClasses = cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className
  );
  
  // Render as link if href is provided
  if (href) {
    return (
      <Link href={href} className={buttonClasses}>
        {children}
      </Link>
    );
  }
  
  // Otherwise render as button
  return (
    <button className={buttonClasses} {...props}>
      {children}
    </button>
  );
} 