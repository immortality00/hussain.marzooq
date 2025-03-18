'use client';

import { PortfolioCategory } from '@/types/portfolio';
import PortfolioGrid from './PortfolioGrid';
import { motion } from 'framer-motion';
import ParallaxBackground from '@/components/effects/ParallaxBackground';

interface PortfolioPageProps {
  category: PortfolioCategory;
  title: string;
  description: string;
}

// Helper function to get category-specific gradient
const getCategoryGradient = (category: string) => {
  const gradients: Record<string, string> = {
    photography: 'from-gold-500 to-orange-500',
    film: 'from-orange-500 to-amber-500',
    webdev: 'from-gold-400 to-gold-600',
    nfts: 'from-amber-400 to-orange-400',
    dance: 'from-orange-400 to-gold-500',
  };
  
  return gradients[category] || 'from-gold-500 to-orange-500';
};

export default function PortfolioPage({ category, title, description }: PortfolioPageProps) {
  return (
    <main className="min-h-screen bg-black">
      {/* Header Section with Parallax */}
      <ParallaxBackground
        intensity={0.2}
        className="relative py-20 bg-gradient-to-b from-gray-900 to-black"
        mode="3d"
        floatingElements={true}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center relative z-10"
          >
            <motion.h1 
              className={`text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${getCategoryGradient(category)} mb-6 text-shadow animate-mask-reveal font-display`}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              {title}
            </motion.h1>
            
            <motion.div
              className="w-20 h-1 mx-auto mb-6 rounded-full bg-gradient-to-r from-gold-400 to-orange-400"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 80, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            />
            
            <motion.p 
              className="text-gray-300 text-lg max-w-3xl mx-auto mb-12"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {description}
            </motion.p>
          </motion.div>
        </div>
      </ParallaxBackground>
      
      {/* Portfolio Grid Section */}
      <ParallaxBackground
        intensity={0.1}
        className="py-12 bg-black"
        mode="3d"
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <PortfolioGrid category={category} />
        </div>
      </ParallaxBackground>
    </main>
  );
} 