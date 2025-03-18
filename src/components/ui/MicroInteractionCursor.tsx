'use client';

import React, { useEffect, useState, ReactElement } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';

interface MicroInteractionCursorProps {
  defaultEnabled?: boolean;
}

type CursorVariantType = 'default' | 'button' | 'card' | 'link' | 'text';

type MixBlendModeType = 'normal' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten' | 
  'color-dodge' | 'color-burn' | 'hard-light' | 'soft-light' | 'difference' | 
  'exclusion' | 'hue' | 'saturation' | 'color' | 'luminosity';

export default function MicroInteractionCursor({ defaultEnabled = true }: MicroInteractionCursorProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [cursorVariant, setCursorVariant] = useState<CursorVariantType>('default');
  const [cursorText, setCursorText] = useState('');
  const [cursorColor, setCursorColor] = useState('rgba(255, 255, 255, 0.3)');
  
  // Position values
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  // Spring physics for smooth movement
  const springConfig = { damping: 25, stiffness: 700 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  // Track if we should show the custom cursor
  const [isFallbackActive, setIsFallbackActive] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isEnabled = defaultEnabled;
    
    // Show the cursor after a short delay
    const timer = setTimeout(() => {
      setVisible(true);
    }, 1000);

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    // Detect interactive elements with data attributes
    const handleElementMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Only trigger for elements with our data attribute
      if (target.hasAttribute('data-cursor-interaction')) {
        const type = target.getAttribute('data-cursor-type') || 'button';
        const text = target.getAttribute('data-cursor-text') || '';
        const color = target.getAttribute('data-cursor-color') || '';
        
        // Update cursor state based on the element's data attributes
        setCursorVariant(type as CursorVariantType);
        setCursorText(text);
        if (color) setCursorColor(color);
      }
    };

    const handleElementMouseLeave = () => {
      setCursorVariant('default');
      setCursorText('');
      setCursorColor('rgba(255, 255, 255, 0.3)');
    };

    // Check if cursor is moving off the window
    const handleMouseLeave = () => {
      setVisible(false);
    };

    const handleMouseEnter = () => {
      setVisible(true);
    };

    // Handle errors by using fallback cursor
    const handleError = () => {
      console.warn('Custom cursor encountered an issue, falling back to default cursor');
      setIsFallbackActive(true);
    };

    try {
      if (isEnabled) {
        // Add event listeners
        window.addEventListener('mousemove', moveCursor);
        window.addEventListener('mouseleave', handleMouseLeave);
        window.addEventListener('mouseenter', handleMouseEnter);
        
        // Detect any element with our data attributes
        document.addEventListener('mouseover', handleElementMouseEnter);
        document.addEventListener('mouseout', handleElementMouseLeave);
      }
    // eslint-disable-next-line no-empty
    } catch {
      handleError();
    }

    return () => {
      clearTimeout(timer);
      if (isEnabled) {
        window.removeEventListener('mousemove', moveCursor);
        window.removeEventListener('mouseleave', handleMouseLeave);
        window.removeEventListener('mouseenter', handleMouseEnter);
        document.removeEventListener('mouseover', handleElementMouseEnter);
        document.removeEventListener('mouseout', handleElementMouseLeave);
      }
    };
  }, [cursorX, cursorY, defaultEnabled]);

  // Fall back to default cursor if needed
  if (!mounted || isFallbackActive) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed pointer-events-none z-[9999] rounded-full backdrop-blur-sm flex items-center justify-center"
          animate={cursorVariant}
          initial={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ 
            opacity: { duration: 0.2 },
            default: { duration: 0.2 }
          }}
          style={{ 
            width: getCursorSize().width,
            height: getCursorSize().height,
            x: cursorXSpring, 
            y: cursorYSpring,
            transform: 'translate(-50%, -50%)',
            backgroundColor: getCursorStyles().backgroundColor,
            borderColor: getCursorStyles().borderColor,
            borderWidth: getCursorStyles().borderWidth,
            mixBlendMode: getCursorStyles().mixBlendMode
          }}
        >
          {cursorText && (
            <motion.span 
              className="text-xs font-medium text-white whitespace-nowrap select-none"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              {cursorText}
            </motion.span>
          )}
          
          {cursorVariant !== 'default' && (
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Helper functions to simplify the main component
  function getCursorSize() {
    switch (cursorVariant) {
      case 'button':
        return { width: 60, height: 60 };
      case 'card':
        return { width: 24, height: 24 };
      case 'link':
        return { width: 40, height: 40 };
      case 'text':
        return { width: 80, height: 80 };
      default:
        return { width: 20, height: 20 };
    }
  }

  function getCursorStyles() {
    switch (cursorVariant) {
      case 'button':
        return { 
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderColor: 'transparent',
          borderWidth: 0,
          mixBlendMode: 'normal' as MixBlendModeType
        };
      case 'card':
        return { 
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: 'rgba(59, 130, 246, 0.5)',
          borderWidth: 2,
          mixBlendMode: 'normal' as MixBlendModeType
        };
      case 'link':
        return { 
          backgroundColor: 'rgba(124, 58, 237, 0.2)',
          borderColor: 'transparent',
          borderWidth: 0,
          mixBlendMode: 'normal' as MixBlendModeType
        };
      case 'text':
        return { 
          backgroundColor: 'rgba(239, 68, 68, 0.2)',
          borderColor: 'transparent',
          borderWidth: 0,
          mixBlendMode: 'normal' as MixBlendModeType
        };
      default:
        return { 
          backgroundColor: cursorColor,
          borderColor: 'transparent',
          borderWidth: 0,
          mixBlendMode: 'difference' as MixBlendModeType
        };
    }
  }
}

// Helper function to add cursor interaction to an element
export function withCursorInteraction(element: ReactElement, options: {
  type?: CursorVariantType;
  text?: string;
  color?: string;
}): ReactElement {
  const { type = 'button', text = '', color = '' } = options;
  
  // Add data attributes to the element
  const props = {
    'data-cursor-interaction': 'true',
    'data-cursor-type': type,
    'data-cursor-text': text,
    'data-cursor-color': color,
    style: { 
      ...(element.props as React.CSSProperties),
      cursor: 'none'
    }
  };

  return React.cloneElement(element, props);
} 