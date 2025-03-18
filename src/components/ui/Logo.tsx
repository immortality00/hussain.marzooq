import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import styles from './Logo.module.css';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  withLink?: boolean;
  animated?: boolean;
  withGlow?: boolean;
}

export default function Logo({
  size = 'md',
  className = '',
  withLink = true,
  animated = false,
  withGlow = false,
}: LogoProps) {
  // Define dimensions based on size
  const dimensions = {
    sm: { width: 80, height: 80 },
    md: { width: 120, height: 120 },
    lg: { width: 180, height: 180 },
  };

  const { width, height } = dimensions[size];
  
  // Logo content with optional animation
  const logoContent = animated ? (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        'relative', 
        withGlow ? styles.logoGoldGlow : '',
        animated ? styles.logoAnimated : '',
        className
      )}
      style={{ width, height }}
    >
      <Image
        src="/images/branding/logo.png"
        alt="Hussain Marzooq - Filmmaker & Photographer"
        fill
        sizes={`${width}px`}
        priority
        className="object-contain"
      />
    </motion.div>
  ) : (
    <div 
      className={cn(
        'relative', 
        withGlow ? styles.logoGoldGlow : '',
        animated ? styles.logoAnimated : '',
        className
      )} 
      style={{ width, height }}
    >
      <Image
        src="/images/branding/logo.png"
        alt="Hussain Marzooq - Filmmaker & Photographer"
        fill
        sizes={`${width}px`}
        priority
        className="object-contain"
      />
    </div>
  );

  // Return with or without link wrapper
  return withLink ? (
    <Link href="/" aria-label="Home">
      {logoContent}
    </Link>
  ) : (
    logoContent
  );
} 