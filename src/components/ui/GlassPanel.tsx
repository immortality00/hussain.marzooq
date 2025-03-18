import { motion, MotionProps } from 'framer-motion';
import { ReactNode } from 'react';

interface GlassPanelProps extends MotionProps {
  children: ReactNode;
  className?: string;
  intensity?: 'low' | 'medium' | 'high' | 'transparent';
  hover?: boolean;
  tilt?: boolean;
  gradientBorder?: boolean;
  hasShadow?: boolean;
  animateEntry?: boolean;
}

export default function GlassPanel({
  children,
  className = '',
  intensity = 'medium',
  hover = false,
  tilt = false,
  gradientBorder = false,
  hasShadow = true,
  animateEntry = false,
  ...motionProps
}: GlassPanelProps) {
  const blurIntensity = {
    transparent: 'backdrop-blur-none',
    low: 'backdrop-blur-sm',
    medium: 'backdrop-blur-lg',
    high: 'backdrop-blur-2xl'
  };

  const bgOpacity = {
    transparent: 'bg-transparent',
    low: 'bg-white/5',
    medium: 'bg-white/10',
    high: 'bg-white/15'
  };

  // Basic border styles without gradient
  const borderStyles = intensity === 'transparent' 
    ? 'border-transparent' 
    : 'border-white/10';

  const baseClasses = `
    relative overflow-hidden rounded-2xl border ${borderStyles}
    ${blurIntensity[intensity]} ${bgOpacity[intensity]}
    ${hasShadow ? 'shadow-2xl shadow-black/10' : ''}
    transition-all duration-300
  `;

  const hoverClasses = hover ? `
    hover:border-white/20 hover:shadow-xl hover:shadow-gold-500/10
  ` : '';

  // Entry animation props
  const entryAnimation = animateEntry ? {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  } : {};

  // Hover animation props
  const hoverAnimation = tilt ? {
    whileHover: { scale: 1.02, rotateX: 2, rotateY: 2 },
    transition: { type: 'spring', stiffness: 300, damping: 20 }
  } : {};

  return (
    <div className="relative">
      {/* Gradient border element if enabled */}
      {gradientBorder && (
        <div className="absolute inset-0 p-[1px] rounded-2xl bg-gradient-to-r from-gold-500/30 via-orange-500/20 to-gold-400/30" />
      )}
      
      <motion.div
        className={`${baseClasses} ${hoverClasses} ${className} ${gradientBorder ? 'border-transparent relative z-10 bg-black/40' : ''}`}
        {...entryAnimation}
        {...hoverAnimation}
        {...motionProps}
      >
        {children}
      </motion.div>
    </div>
  );
} 