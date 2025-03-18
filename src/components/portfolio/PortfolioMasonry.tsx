'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { PortfolioItem } from '@/types/portfolio';

// Sample items for demonstration
const sampleItems: PortfolioItem[] = [
  {
    id: 'sample-1',
    title: 'Nature Photography Collection',
    description: 'A series of landscape and wildlife photographs capturing the beauty of natural environments.',
    category: 'photography',
    imageUrl: '/images/portfolio/photography-1.jpg',
    featured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['nature', 'wildlife']
  },
  {
    id: 'sample-2',
    title: 'Short Film: "Echoes"',
    description: 'A narrative short film exploring themes of memory and identity through visual storytelling.',
    category: 'film',
    imageUrl: '/images/portfolio/film-1.jpg',
    featured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['narrative', 'drama']
  },
  {
    id: 'sample-3',
    title: 'E-Commerce Platform',
    description: 'A fully responsive e-commerce solution built with React, Next.js, and integrated payment processing.',
    category: 'webdev',
    imageUrl: '/images/portfolio/webdev-1.jpg',
    featured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['react', 'e-commerce']
  },
  {
    id: 'sample-4',
    title: 'Abstract NFT Collection',
    description: 'A collection of generative art pieces exploring geometric abstraction as unique digital assets.',
    category: 'nfts',
    imageUrl: '/images/portfolio/nft-1.jpg',
    featured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['generative', 'abstract']
  },
  {
    id: 'sample-5',
    title: 'Contemporary Dance Performance',
    description: 'A modern dance piece exploring themes of isolation and connection through movement.',
    category: 'dance',
    imageUrl: '/images/portfolio/dance-1.jpg',
    featured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['contemporary', 'performance']
  },
  {
    id: 'sample-6',
    title: 'Urban Photography Series',
    description: 'Street photography capturing the essence and energy of city life across different metropolises.',
    category: 'photography',
    imageUrl: '/images/portfolio/photography-2.jpg',
    featured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['urban', 'street']
  }
];

interface PortfolioMasonryProps {
  selectedCategory: string;
}

export default function PortfolioMasonry({ selectedCategory }: PortfolioMasonryProps) {
  // Define filtered items based on selected category
  const filteredItems = selectedCategory === 'all' 
    ? sampleItems
    : sampleItems.filter(item => item.category === selectedCategory.toLowerCase());

  // Define category colors for visual enhancement
  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'photography': return 'from-blue-500 to-purple-500';
      case 'film': return 'from-purple-500 to-pink-500';
      case 'webdev': return 'from-cyan-500 to-blue-500';
      case 'nfts': return 'from-emerald-500 to-teal-500';
      case 'dance': return 'from-rose-500 to-orange-500';
      default: return 'from-gold-500 to-orange-500';
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8"
      >
        {filteredItems.map((item, index) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{
              duration: 0.4,
              delay: index * 0.1,
              ease: [0.43, 0.13, 0.23, 0.96]
            }}
            className="relative group"
          >
            <Link href={`/${item.category || 'all'}/${item.id}`}>
              <motion.div
                className="relative aspect-[4/3] overflow-hidden rounded-lg md:rounded-xl"
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: '0 15px 30px -10px rgba(0, 0, 0, 0.5), 0 5px 15px -5px rgba(0, 0, 0, 0.3), 0 0 10px rgba(212, 175, 55, 0.2)'
                }}
                transition={{ duration: 0.3 }}
              >
                {/* Image with proper fallback */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900">
                  {item.imageUrl && (
                    <Image 
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-all duration-700 group-hover:scale-110 md:group-hover:opacity-70"
                      onError={(e) => {
                        // If image fails to load, we'll rely on the gradient background
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  )}
                </div>

                {/* Glass Effect Border - visible on mobile */}
                <div className="absolute inset-0 border border-white/10 rounded-lg md:rounded-xl md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 opacity-100" />

                {/* Category accent light - visible on mobile */}
                <div className={`absolute inset-0 bg-gradient-to-tr ${getCategoryColor(item.category || '')} opacity-10 md:opacity-0 md:group-hover:opacity-20 transition-opacity duration-500`} />

                {/* Featured item indicator - always visible on mobile */}
                {item.featured && (
                  <div className="absolute top-2 md:top-4 left-2 md:left-4 flex items-center gap-1 px-2 py-1 md:px-3 md:py-1 rounded-full backdrop-blur-md bg-gold-500/20 border border-gold-500/30 text-xs font-medium text-gold-200 z-20 md:opacity-0 md:group-hover:opacity-100 opacity-100">
                    <svg className="w-3 h-3 text-gold-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span>Featured</span>
                  </div>
                )}

                {/* Content Overlay - always visible on mobile */}
                <motion.div
                  className="absolute inset-0 p-3 md:p-6 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/60 to-transparent md:transform md:translate-y-4 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 transition-all duration-300 opacity-100 translate-y-0"
                >
                  <motion.h3
                    className="text-lg md:text-xl lg:text-2xl font-bold text-white mb-1 md:mb-2 drop-shadow-md line-clamp-2"
                  >
                    {item.title}
                  </motion.h3>
                  <motion.p
                    className="text-gray-300 text-xs md:text-sm lg:text-base line-clamp-2 hidden md:block"
                  >
                    {item.description}
                  </motion.p>
                  
                  <motion.div
                    className="mt-2 md:mt-4 flex"
                  >
                    <div className="px-3 py-1.5 md:px-4 md:py-2 bg-gradient-to-r from-gold-500 to-orange-600 rounded-lg text-white text-xs md:text-sm font-medium shadow-lg flex items-center gap-2 md:opacity-0 md:group-hover:opacity-100 md:transition-opacity md:duration-500 md:delay-100 md:transform md:translate-y-4 md:group-hover:translate-y-0 opacity-100 translate-y-0">
                      View Details
                      <span className="text-xs md:text-sm">→</span>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Category Tag */}
                <div
                  className="absolute top-2 md:top-4 right-2 md:right-4 px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs font-medium backdrop-blur-md bg-white/10 border border-white/20 z-20 opacity-100 group-hover:bg-gradient-to-r group-hover:from-gold-500 group-hover:to-orange-500 transition-all duration-300"
                >
                  {item.category ? 
                    item.category.charAt(0).toUpperCase() + item.category.slice(1) : 
                    'Unknown'
                  }
                </div>
              </motion.div>
            </Link>
          </motion.div>
        ))}

        {filteredItems.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="col-span-full text-center py-8 md:py-16"
          >
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 md:p-8 max-w-md mx-auto border border-white/10">
              <div className="text-gold-500 mb-2 md:mb-3 text-2xl md:text-3xl">✨</div>
              <h3 className="text-lg md:text-xl font-display font-bold text-white mb-1 md:mb-2">No Items Found</h3>
              <p className="text-gray-400 text-sm md:text-base">
                No items found in this category yet. Check back soon for new additions to the portfolio.
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
} 