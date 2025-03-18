import { motion } from 'framer-motion';
import React from 'react';

interface AnimationProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  duration?: number;
}

// Fade-up animation with customizable delay
export const FadeUp: React.FC<AnimationProps> = ({ 
  children, 
  delay = 0, 
  className = '',
  duration = 0.7
}) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-100px' }}
    transition={{ 
      duration: duration, 
      delay: delay, 
      ease: [0.22, 1, 0.36, 1] 
    }}
    className={className}
  >
    {children}
  </motion.div>
);

// Fade-in animation
export const FadeIn: React.FC<AnimationProps> = ({ 
  children, 
  delay = 0, 
  className = '' 
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    viewport={{ once: true }}
    transition={{ 
      duration: 0.8, 
      delay: delay, 
      ease: "easeOut" 
    }}
    className={className}
  >
    {children}
  </motion.div>
);

interface StaggerProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  delayStart?: number;
}

// Staggered children animation
export const StaggerContainer: React.FC<StaggerProps> = ({ 
  children, 
  className = '',
  staggerDelay = 0.1,
  delayStart = 0
}) => (
  <motion.div
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: '-50px' }}
    variants={{
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: staggerDelay,
          delayChildren: delayStart
        }
      }
    }}
    className={className}
  >
    {children}
  </motion.div>
);

interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
}

export const StaggerItem: React.FC<StaggerItemProps> = ({ 
  children, 
  className = '' 
}) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: { 
          type: "spring", 
          stiffness: 300, 
          damping: 24 
        }
      }
    }}
    className={className}
  >
    {children}
  </motion.div>
);

// Text reveal animation for headings
export const TextReveal: React.FC<AnimationProps> = ({ 
  children, 
  className = '' 
}) => (
  <div className="overflow-hidden">
    <motion.div
      initial={{ y: "100%" }}
      whileInView={{ y: 0 }}
      viewport={{ once: true }}
      transition={{ 
        duration: 0.8, 
        ease: [0.22, 1, 0.36, 1]
      }}
      className={className}
    >
      {children}
    </motion.div>
  </div>
);

// Scale animation
export const ScaleIn: React.FC<AnimationProps> = ({ 
  children, 
  delay = 0, 
  className = '' 
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ 
      duration: 0.5, 
      delay: delay,
      ease: [0.22, 1, 0.36, 1]
    }}
    className={className}
  >
    {children}
  </motion.div>
);

// Lazy loaded image with blur-up effect
interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  lowQualitySrc?: string;
  width?: number;
  height?: number;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  lowQualitySrc = '',
  width,
  height
}) => {
  const [loaded, setLoaded] = React.useState(false);
  const [imageSrc, setImageSrc] = React.useState(lowQualitySrc || src);

  React.useEffect(() => {
    // Only load high quality image if component is mounted
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setImageSrc(src);
      setLoaded(true);
    };
  }, [src]);

  return (
    <motion.img
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      animate={{ opacity: loaded ? 1 : 0.6 }}
      transition={{ duration: 0.5 }}
      className={`transition duration-500 ${className} ${!loaded ? 'blur-sm' : 'blur-0'}`}
    />
  );
}; 