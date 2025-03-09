'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function AdminCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isPointer, setIsPointer] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isHoveringButton, setIsHoveringButton] = useState(false);
  const pathname = usePathname();
  
  // Only use custom cursor on admin routes
  const isAdminRoute = pathname?.startsWith('/admin');

  useEffect(() => {
    if (!isAdminRoute) return;
    
    // Initialize cursor position
    setPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      
      // Check if the cursor is over an interactive element
      const target = e.target as HTMLElement;
      const isInteractive = 
        target.tagName === 'BUTTON' || 
        target.tagName === 'A' || 
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' ||
        target.closest('button') !== null || 
        target.closest('a') !== null;
        
      setIsPointer(isInteractive);
      
      // Check if hovering over a button specifically
      const isButton = 
        target.tagName === 'BUTTON' || 
        target.closest('button') !== null || 
        target.tagName === 'A' || 
        target.closest('a') !== null;
        
      setIsHoveringButton(isButton);
    };
    
    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    
    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isAdminRoute]);
  
  if (!isAdminRoute) return null;
  
  // Sizes for different cursor states
  const baseSize = isPointer ? 40 : 24;
  const innerSize = isPointer ? 8 : 4;
  
  return (
    <>
      {/* Main cursor ring */}
      <motion.div
        className="fixed pointer-events-none z-[100] rounded-full border-2 border-white mix-blend-difference"
        animate={{
          x: position.x - baseSize / 2,
          y: position.y - baseSize / 2,
          scale: isClicking ? 0.8 : 1,
          opacity: isVisible ? 1 : 0,
          width: isPointer ? (isHoveringButton ? 60 : 40) : 24,
          height: isPointer ? (isHoveringButton ? 60 : 40) : 24,
        }}
        transition={{
          type: 'spring',
          damping: 30,
          stiffness: 400,
          opacity: { duration: 0.2 },
        }}
      />
      
      {/* Inner cursor dot */}
      <motion.div
        className="fixed pointer-events-none z-[100] rounded-full bg-white mix-blend-difference"
        animate={{
          x: position.x - innerSize / 2,
          y: position.y - innerSize / 2,
          scale: isClicking ? 0.5 : 1,
          opacity: isVisible ? 1 : 0,
          width: innerSize,
          height: innerSize,
        }}
        transition={{
          type: 'spring',
          damping: 25,
          stiffness: 700,
          opacity: { duration: 0.2 },
        }}
      />
      
      {/* Glow effect for hovering on buttons */}
      {isHoveringButton && (
        <motion.div
          className="fixed pointer-events-none z-[99] rounded-full bg-white/20 backdrop-blur-sm"
          animate={{
            x: position.x - 70 / 2,
            y: position.y - 70 / 2,
            scale: isClicking ? 0.8 : 1,
            opacity: isHoveringButton ? 0.5 : 0,
            width: 70,
            height: 70,
          }}
          transition={{
            type: 'spring',
            damping: 20,
            stiffness: 300,
          }}
        />
      )}
    </>
  );
} 