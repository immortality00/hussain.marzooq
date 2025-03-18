import React from 'react';
import { StaggerContainer, StaggerItem, FadeUp, LazyImage } from '../ui/AnimatedElements';
import { GoldHeading, GoldDivider, CameraBackdrop } from '../ui/GoldAccents';

// Example portfolio data
const portfolioItems = [
  {
    id: 1,
    title: 'Urban Elegance',
    category: 'Portrait',
    image: '/path/to/image1.jpg',
    thumbnail: '/path/to/thumbnail1.jpg',
  },
  {
    id: 2,
    title: 'Natural Light',
    category: 'Landscape',
    image: '/path/to/image2.jpg',
    thumbnail: '/path/to/thumbnail2.jpg',
  },
  {
    id: 3,
    title: 'Modern Architecture',
    category: 'Urban',
    image: '/path/to/image3.jpg',
    thumbnail: '/path/to/thumbnail3.jpg',
  },
  {
    id: 4,
    title: 'Wedding Moments',
    category: 'Event',
    image: '/path/to/image4.jpg',
    thumbnail: '/path/to/thumbnail4.jpg',
  },
  {
    id: 5,
    title: 'Abstract Forms',
    category: 'Creative',
    image: '/path/to/image5.jpg',
    thumbnail: '/path/to/thumbnail5.jpg',
  },
  {
    id: 6,
    title: 'Street Photography',
    category: 'Documentary',
    image: '/path/to/image6.jpg',
    thumbnail: '/path/to/thumbnail6.jpg',
  },
];

export const GoldPortfolioGridExample: React.FC = () => {
  return (
    <section className="py-20 gold-gradient-bg gold-noise relative">
      {/* Camera backdrop */}
      <CameraBackdrop position="center" size="w-96 h-96" opacity="opacity-[0.02]" />
      
      <div className="container mx-auto px-4">
        <FadeUp className="text-center mb-16">
          <GoldHeading 
            as="h2" 
            className="text-3xl md:text-5xl font-display font-bold text-white mb-4"
            withAccent
            shimmer
          >
            Portfolio Highlights
          </GoldHeading>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Explore a curated selection of my finest work, showcasing versatility across various photography styles
          </p>
        </FadeUp>
        
        <GoldDivider className="mb-12" />
        
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolioItems.map((item) => (
            <StaggerItem key={item.id}>
              <div className="gold-glass-card gold-accent-glow p-3">
                <div className="gold-image mb-4">
                  <LazyImage
                    src={item.image}
                    lowQualitySrc={item.thumbnail}
                    alt={item.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
                <div className="p-3">
                  <h3 className="text-xl font-medium text-white mb-1">{item.title}</h3>
                  <p className="text-sm text-gold-light">{item.category}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
        
        <FadeUp delay={0.5} className="mt-12 text-center">
          <a href="/portfolio" className="gold-link text-lg">
            View Full Portfolio
          </a>
        </FadeUp>
      </div>
    </section>
  );
};

export default GoldPortfolioGridExample; 