import React from 'react';
import BackgroundAccent from '@/components/ui/BackgroundAccent';
import { motion } from 'framer-motion';

/**
 * Example component showing how to add camera accents to a hero section
 * 
 * This demonstrates how to subtly incorporate camera elements into the hero
 * area while maintaining the main focus on your content.
 */
export default function HeroAccentExample() {
  return (
    <div className="relative min-h-screen flex items-center justify-center">
      {/* Decorative background with camera accents */}
      <BackgroundAccent
        type="camera"
        className="top-20 right-[5%] transform"
        width={240}
        height={180}
        opacity={0.07}
        rotate={-10}
      />
      
      <BackgroundAccent
        type="swirl"
        className="bottom-[15%] left-[10%]"
        width={200}
        height={200}
        opacity={0.08}
      />
      
      <BackgroundAccent
        type="camera"
        className="bottom-[10%] right-[15%]"
        width={180}
        height={140}
        opacity={0.05}
        rotate={15}
        flip
      />

      {/* Hero content */}
      <div className="container mx-auto px-4 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-script text-gold-500 mb-4">
            Capturing Moments
          </h1>
          
          <p className="text-xl md:text-2xl text-white mb-8 max-w-3xl mx-auto">
            Photography and film that tells your story with elegance and emotion
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-gold">
              View Portfolio
            </button>
            <button className="btn-gold-outline">
              Contact Me
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 