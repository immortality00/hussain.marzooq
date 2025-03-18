import React from 'react';
import BackgroundAccent from '@/components/ui/BackgroundAccent';

/**
 * Example component showing how to add camera accents to a card grid layout
 * 
 * This demonstrates how to subtly incorporate camera elements into a grid of cards
 * or portfolio items while maintaining the main focus on your content.
 */
export default function CardGridAccentsExample() {
  // Example portfolio items
  const items = [
    { id: 1, title: 'Portrait Session', category: 'Photography' },
    { id: 2, title: 'Wedding Collection', category: 'Photography' },
    { id: 3, title: 'Travel Documentary', category: 'Film' },
    { id: 4, title: 'Fashion Editorial', category: 'Photography' },
    { id: 5, title: 'Product Showcase', category: 'Photography' },
    { id: 6, title: 'Music Video', category: 'Film' },
  ];

  return (
    <div className="relative py-16 bg-gray-900">
      {/* Section heading with camera accent behind it */}
      <div className="relative text-center mb-12">
        <BackgroundAccent
          type="camera"
          className="left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
          width={300}
          height={160}
          opacity={0.08}
        />
        
        <h2 className="relative z-10 text-3xl md:text-4xl font-script text-gold-500 mb-2">
          Portfolio Highlights
        </h2>
        <p className="text-gray-300">Explore my recent work</p>
      </div>

      {/* Container with background accents */}
      <div className="container mx-auto px-4 relative">
        {/* Top-right swirl accent */}
        <BackgroundAccent
          type="swirl"
          className="top-0 right-0"
          width={200}
          height={200}
          opacity={0.07}
          rotate={-15}
        />
        
        {/* Bottom-left film strip accent */}
        <BackgroundAccent
          type="film"
          className="bottom-0 left-0"
          width={300}
          height={80}
          opacity={0.08}
          rotate={10}
        />

        {/* Card grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {items.map((item) => (
            <div
              key={item.id}
              className="glass-card-gold p-6 rounded-lg hover:shadow-lg transition-all duration-300"
            >
              {/* This would typically contain an image */}
              <div className="bg-black/50 h-48 rounded-md mb-4"></div>
              
              <h3 className="text-white text-xl font-medium mb-1">{item.title}</h3>
              <p className="text-gold-200">{item.category}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 