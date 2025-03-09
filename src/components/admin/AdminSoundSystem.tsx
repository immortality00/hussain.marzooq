'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

interface SoundType {
  name: string;
  type: 'hover' | 'click' | 'success' | 'error' | 'notification';
  path: string;
}

// Sound presets with paths to audio files
const sounds: SoundType[] = [
  { name: 'Hover', type: 'hover', path: '/sounds/soft-hover.mp3' },
  { name: 'Click', type: 'click', path: '/sounds/soft-click.mp3' },
  { name: 'Success', type: 'success', path: '/sounds/success.mp3' },
  { name: 'Error', type: 'error', path: '/sounds/error.mp3' },
  { name: 'Notification', type: 'notification', path: '/sounds/notification.mp3' },
];

export default function AdminSoundSystem() {
  const pathname = usePathname();
  const [isMuted, setIsMuted] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({});
  const ambientRef = useRef<HTMLAudioElement | null>(null);
  
  const isAdminRoute = pathname?.startsWith('/admin');
  
  // Initialize sound system
  useEffect(() => {
    if (!isAdminRoute) return;
    
    // Create audio elements for each sound
    sounds.forEach(sound => {
      audioRefs.current[sound.type] = new Audio(sound.path);
      if (audioRefs.current[sound.type]) {
        audioRefs.current[sound.type]!.volume = 0.2;
      }
    });
    
    // Create ambient sound
    ambientRef.current = new Audio('/sounds/ambient-glow.mp3');
    if (ambientRef.current) {
      ambientRef.current.loop = true;
      ambientRef.current.volume = 0.08;
    }
    
    // Set up event listeners for interactive elements
    const handleButtonHover = () => {
      if (!isMuted && audioRefs.current.hover) {
        audioRefs.current.hover.currentTime = 0;
        audioRefs.current.hover.play().catch(e => console.log('Audio play failed:', e));
      }
    };
    
    const handleButtonClick = () => {
      if (!isMuted && audioRefs.current.click) {
        audioRefs.current.click.currentTime = 0;
        audioRefs.current.click.play().catch(e => console.log('Audio play failed:', e));
      }
    };
    
    // Add event listeners to interactive elements
    const buttons = document.querySelectorAll('button, a');
    buttons.forEach(button => {
      button.addEventListener('mouseenter', handleButtonHover);
      button.addEventListener('click', handleButtonClick);
    });
    
    // Clean up event listeners
    return () => {
      buttons.forEach(button => {
        button.removeEventListener('mouseenter', handleButtonHover);
        button.removeEventListener('click', handleButtonClick);
      });
      
      // Stop ambient sound
      if (ambientRef.current) {
        ambientRef.current.pause();
      }
    };
  }, [isAdminRoute, isMuted]);
  
  // Toggle ambient sound when mute state changes
  useEffect(() => {
    if (!ambientRef.current) return;
    
    if (isMuted) {
      ambientRef.current.pause();
    } else if (isActive) {
      ambientRef.current.play().catch(e => console.log('Ambient audio play failed:', e));
    }
  }, [isMuted, isActive]);
  
  // Play success sound
  const playSound = (type: 'hover' | 'click' | 'success' | 'error' | 'notification') => {
    if (isMuted || !audioRefs.current[type]) return;
    audioRefs.current[type]!.currentTime = 0;
    audioRefs.current[type]!.play().catch(e => console.log(`${type} audio play failed:`, e));
  };
  
  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isActive) setIsActive(true);
  };
  
  if (!isAdminRoute) return null;
  
  return (
    <div 
      className="fixed bottom-6 right-6 z-50"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <motion.button
        className="relative w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg group hover:bg-white/20"
        onClick={toggleMute}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          animate={{ opacity: isVisible ? 1 : 0.6 }}
          transition={{ duration: 0.2 }}
        >
          {isMuted ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
            </svg>
          )}
        </motion.div>
        
        {/* Tooltip */}
        <motion.div
          className="absolute top-0 transform -translate-y-full mb-2 px-3 py-1 bg-black/80 backdrop-blur-md rounded text-white text-xs whitespace-nowrap"
          initial={{ opacity: 0, y: 10 }}
          animate={{ 
            opacity: isVisible ? 1 : 0,
            y: isVisible ? 0 : 10,
          }}
          transition={{ duration: 0.2 }}
        >
          Sound {isMuted ? 'Off' : 'On'}
        </motion.div>
      </motion.button>
    </div>
  );
} 