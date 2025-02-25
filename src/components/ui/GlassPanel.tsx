import { motion, MotionProps } from 'framer-motion';
import { ReactNode } from 'react';

interface GlassPanelProps extends MotionProps {
  children: ReactNode;
  className?: string;
  intensity?: 'low' | 'medium' | 'high';
  hover?: boolean;
  tilt?: boolean;
}

export default function GlassPanel({
  children,
  className = '',
  intensity = 'medium',
  hover = false,
  tilt = false,
  ...motionProps
}: GlassPanelProps) {
  const blurIntensity = {
    low: 'backdrop-blur-sm',
    medium: 'backdrop-blur-lg',
    high: 'backdrop-blur-2xl'
  };

  const bgOpacity = {
    low: 'bg-white/5',
    medium: 'bg-white/10',
    high: 'bg-white/15'
  };

  const baseClasses = `
    relative overflow-hidden rounded-2xl border border-white/10
    ${blurIntensity[intensity]} ${bgOpacity[intensity]}
    shadow-2xl shadow-black/5
  `;

  const hoverClasses = hover ? `
    before:absolute before:inset-0
    before:bg-gradient-to-br before:from-blue-500/20 before:via-purple-500/20 before:to-transparent
    before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500
    hover:border-white/20 hover:shadow-xl hover:shadow-blue-500/10
  ` : '';

  return (
    <motion.div
      className={`${baseClasses} ${hoverClasses} ${className}`}
      whileHover={tilt ? { scale: 1.02, rotateX: 2, rotateY: 2 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
} 