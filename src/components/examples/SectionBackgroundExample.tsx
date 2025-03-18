import React from 'react';
import { StaticBackgroundAccent } from '@/components/ui/BackgroundAccent';

/**
 * Example component showing how to add camera accents to a section background
 * 
 * This demonstrates a more subtle approach that can be applied to any section
 * of your website where you want to reinforce the camera/photography theme.
 */
export default function SectionBackgroundExample() {
  return (
    <section className="relative py-16 overflow-hidden">
      {/* Semi-transparent background with blur effect */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-0"></div>
      
      {/* Multiple camera accents with different sizes and rotations */}
      <div className="absolute inset-0 z-0">
        <StaticBackgroundAccent
          type="camera"
          className="top-[10%] left-[5%] w-[200px] h-[150px] opacity-5"
          style={{ transform: 'rotate(-10deg)' }}
        />
        
        <StaticBackgroundAccent
          type="camera"
          className="top-[60%] right-[8%] w-[180px] h-[120px] opacity-5"
          style={{ transform: 'rotate(15deg) scaleX(-1)' }}
        />
        
        <StaticBackgroundAccent
          type="swirl"
          className="bottom-[10%] left-[15%] w-[150px] h-[150px] opacity-8"
          style={{ transform: 'rotate(20deg)' }}
        />
      </div>
      
      {/* Section content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-script text-gold-500 mb-6 text-center">
            Behind the Lens
          </h2>
          
          <div className="glass-card-gold p-8 rounded-xl">
            <p className="text-white mb-4">
              This section demonstrates how to use camera silhouettes as subtle background elements
              while maintaining focus on the actual content.
            </p>
            <p className="text-white mb-4">
              The accents use low opacity and are positioned strategically to create depth
              without competing with text or images.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
} 