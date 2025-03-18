'use client';

import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { useRef, useEffect } from 'react';

interface ParallaxBackgroundProps {
  children: React.ReactNode;
  intensity?: number;
  className?: string;
  backgroundImage?: string;
  floatingElements?: boolean;
  mode?: '3d' | 'standard';
}

export default function ParallaxBackground({
  children,
  intensity = 0.2,
  className = '',
  backgroundImage,
  floatingElements = false,
  mode = 'standard',
}: ParallaxBackgroundProps) {
  const ref = useRef<HTMLDivElement>(null);
  
  // Mouse position for subtle 3D effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Apply spring physics for smoother motion
  const springX = useSpring(x, { stiffness: 50, damping: 15 });
  const springY = useSpring(y, { stiffness: 50, damping: 15 });

  // Scroll-based parallax
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const scrollY = useTransform(scrollYProgress, [0, 1], ['0%', `${intensity * 100}%`]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1 + intensity]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0.6]);
  
  // Determine how much elements should move based on mouse position
  useEffect(() => {
    if (typeof window !== 'undefined' && mode === '3d') {
      const handleMouseMove = (e: MouseEvent) => {
        // Calculate mouse position relative to center of screen
        // and normalize to values between -1 and 1
        const normalizedX = (e.clientX / window.innerWidth - 0.5) * 2;
        const normalizedY = (e.clientY / window.innerHeight - 0.5) * 2;
        
        x.set(normalizedX * intensity * 15);
        y.set(normalizedY * intensity * 15);
      };
      
      window.addEventListener('mousemove', handleMouseMove);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
      };
    }
  }, [intensity, mode, x, y]);

  return (
    <div 
      ref={ref} 
      className={`relative overflow-hidden ${className}`}
      style={mode === '3d' ? { position: 'relative', perspective: '1000px' } : { position: 'relative' }}
    >
      {/* Parallax Background */}
      <motion.div
        className="absolute inset-0 -z-10"
        style={{
          y: scrollY,
          scale,
          opacity,
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          rotateX: mode === '3d' ? springY : 0,
          rotateY: mode === '3d' ? springX : 0,
        }}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50" />
        
        {/* Animated Patterns */}
        <motion.div
          className="absolute inset-0 opacity-30 mix-blend-overlay"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            backgroundSize: '30px 30px',
          }}
          animate={{
            backgroundPosition: ['0px 0px', '30px 30px'],
          }}
          transition={{
            duration: 20,
            ease: 'linear',
            repeat: Infinity,
          }}
        />

        {/* Moving Gradient */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent)',
            backgroundSize: '200% 200%',
          }}
          animate={{
            backgroundPosition: ['0% 0%', '200% 200%'],
          }}
          transition={{
            duration: 15,
            ease: 'linear',
            repeat: Infinity,
          }}
        />
        
        {/* Floating Elements (optional) */}
        {floatingElements && (
          <>
            {/* Floating Circle Elements */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-white/10 backdrop-blur-sm"
                style={{
                  width: `${20 + Math.random() * 40}px`,
                  height: `${20 + Math.random() * 40}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  opacity: 0.3 + Math.random() * 0.4,
                  filter: 'blur(1px)',
                }}
                animate={{
                  y: [
                    Math.random() * 20, 
                    -Math.random() * 20,
                    Math.random() * 20
                  ],
                  x: [
                    Math.random() * 20, 
                    -Math.random() * 20, 
                    Math.random() * 20
                  ],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 5 + Math.random() * 10,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
            
            {/* Glowing Points */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={`glow-${i}`}
                className="absolute rounded-full"
                style={{
                  width: `${2 + Math.random() * 4}px`,
                  height: `${2 + Math.random() * 4}px`,
                  background: `radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  opacity: 0.5 + Math.random() * 0.5,
                  boxShadow: `0 0 10px 2px rgba(255,255,255,0.3)`,
                }}
                animate={{
                  opacity: [0.3, 0.8, 0.3],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: 2 + Math.random() * 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </>
        )}
      </motion.div>

      {/* Content */}
      <motion.div 
        className="relative z-10"
        style={mode === '3d' ? {
          transformStyle: 'preserve-3d',
          rotateX: mode === '3d' ? springY.get() * -0.2 : 0,
          rotateY: mode === '3d' ? springX.get() * -0.2 : 0
        } : undefined}
      >
        {children}
      </motion.div>
    </div>
  );
} 