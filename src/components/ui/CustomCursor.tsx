import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
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
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - 12);
      cursorY.set(e.clientY - 12);
      dotX.set(e.clientX - 2);
      dotY.set(e.clientY - 2);
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

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
    window.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('mouseleave', handleMouseLeave);
      links.forEach(link => {
        link.removeEventListener('mouseenter', handleLinkHover);
        link.removeEventListener('mouseleave', handleLinkLeave);
      });
    };
  }, [cursorX, cursorY, dotX, dotY]);

  if (typeof window === 'undefined') return null;

  return (
    <>
      <motion.div
        className="custom-cursor"
        style={{
          opacity: isVisible ? 1 : 0,
          x: cursorXSpring,
          y: cursorYSpring,
          scale: 'var(--cursor-scale, 1)',
        }}
      >
        <motion.div
          className="absolute inset-0"
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          style={{ opacity: 0.2 }}
        />
      </motion.div>
      <motion.div
        className="custom-cursor-dot"
        style={{
          opacity: isVisible ? 1 : 0,
          x: dotXSpring,
          y: dotYSpring,
        }}
      />
    </>
  );
} 