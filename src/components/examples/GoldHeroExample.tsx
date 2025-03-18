import React from 'react';
import { FadeUp, TextReveal } from '../ui/AnimatedElements';
import { GoldHeading, CameraBackdrop, GlowContainer } from '../ui/GoldAccents';

export const GoldHeroExample: React.FC = () => {
  return (
    <section className="relative h-screen flex items-center overflow-hidden gold-rays">
      {/* Background image */}
      <img 
        src="/path/to/hero-image.jpg" 
        alt="Hero background"
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* Overlay with glass effect */}
      <div className="absolute inset-0 bg-black/60"></div>
      
      {/* Camera backdrop elements */}
      <CameraBackdrop position="top-right" size="w-64 h-64" opacity="opacity-[0.03]" />
      <CameraBackdrop position="bottom-left" size="w-72 h-72" opacity="opacity-[0.025]" />
      
      {/* Content container */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl">
          <GlowContainer>
            <div className="gold-glass gold-accent-border rounded-xl p-8 md:p-10">
              <TextReveal>
                <GoldHeading as="h1" className="text-4xl md:text-6xl font-display font-bold text-white mb-4" shimmer>
                  Capturing Moments
                </GoldHeading>
              </TextReveal>
              
              <FadeUp delay={0.3} className="mb-8">
                <p className="text-lg text-gray-200">
                  Professional photography that tells your unique story with authentic emotion and timeless elegance.
                </p>
              </FadeUp>
              
              <FadeUp delay={0.5}>
                <button className="admin-button-gold px-6 py-3 rounded-lg gold-pulse">
                  View Portfolio
                </button>
              </FadeUp>
            </div>
          </GlowContainer>
        </div>
      </div>
    </section>
  );
};

export default GoldHeroExample; 