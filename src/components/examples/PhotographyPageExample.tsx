import React from 'react';
import BackgroundAccent from '@/components/ui/BackgroundAccent';

/**
 * Example component showing how to place camera accents in the Photography page
 * 
 * This is a reference component that demonstrates how to incorporate the camera
 * accents into a page layout. You can merge the relevant parts into your actual page components.
 */
export default function PhotographyPageExample() {
  return (
    <div className="relative min-h-screen py-20 bg-black">
      {/* Camera accent in the top-right corner */}
      <BackgroundAccent
        type="camera"
        className="top-10 right-10 md:top-20 md:right-20"
        width={300}
        height={200}
        opacity={0.05}
        rotate={-15}
      />
      
      {/* Camera accent behind the heading */}
      <BackgroundAccent
        type="camera"
        className="top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        width={400}
        height={300}
        opacity={0.08}
      />
      
      {/* Film strip accent along the bottom */}
      <BackgroundAccent
        type="film"
        className="bottom-20 left-0 w-full"
        width={800}
        height={100}
        opacity={0.1}
      />
      
      {/* Swirl accent in the bottom-left corner */}
      <BackgroundAccent
        type="swirl"
        className="bottom-40 left-20"
        width={250}
        height={250}
        opacity={0.07}
        rotate={30}
      />

      {/* Page content (would go here) */}
      <div className="container mx-auto px-4 relative z-10">
        <h1 className="text-4xl md:text-6xl font-script text-gold-500 text-center mb-12">
          Photography Portfolio
        </h1>
        
        {/* Content sections would go here */}
        <div className="bg-black/30 backdrop-blur-sm p-8 rounded-lg glass-gold">
          <p className="text-white text-lg mb-8">
            This demonstrates how the camera accents would be positioned behind the actual content,
            providing subtle visual elements without distracting from the photographs or text.
          </p>
        </div>
      </div>
    </div>
  );
} 