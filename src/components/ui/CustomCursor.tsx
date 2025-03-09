'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function CustomCursor() {
  const [mounted, setMounted] = useState(false);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 700 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);
  const dotXSpring = useSpring(dotX, { damping: 50, stiffness: 800 });
  const dotYSpring = useSpring(dotY, { damping: 50, stiffness: 800 });

  useEffect(() => {
    setMounted(true);
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - 12);
      cursorY.set(e.clientY - 12);
      dotX.set(e.clientX - 2);
      dotY.set(e.clientY - 2);
    };

    // Add link hover effect
    const handleLinkHover = () => {
      document.documentElement.style.setProperty('--cursor-scale', '1.5');
    };

    const handleLinkLeave = () => {
      document.documentElement.style.setProperty('--cursor-scale', '1');
    };

    const links = document.querySelectorAll('a, button');
    links.forEach(link => {
      link.addEventListener('mouseenter', handleLinkHover);
      link.addEventListener('mouseleave', handleLinkLeave);
    });

    window.addEventListener('mousemove', moveCursor);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      links.forEach(link => {
        link.removeEventListener('mouseenter', handleLinkHover);
        link.removeEventListener('mouseleave', handleLinkLeave);
      });
    };
  }, [cursorX, cursorY, dotX, dotY]);

  if (!mounted) return null;

  return (
    <>
      <motion.div
        className="fixed pointer-events-none z-50 w-6 h-6 rounded-full bg-white/30 backdrop-blur-sm border border-white/50"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          scale: 'var(--cursor-scale, 1)',
        }}
      >
        <motion.div
          className="absolute inset-0 rounded-full bg-white/10"
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      </motion.div>
      <motion.div
        className="fixed pointer-events-none z-50 w-1 h-1 rounded-full bg-white"
        style={{
          x: dotXSpring,
          y: dotYSpring,
        }}
      />
    </>
  );
} 