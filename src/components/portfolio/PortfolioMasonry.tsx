'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';

interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
}

// Sample portfolio items (replace with real data)
const portfolioItems: PortfolioItem[] = [
  {
    id: '1',
    title: 'Urban Photography',
    category: 'photography',
    image: '/images/portfolio/photo1.jpg',
    description: 'Urban landscape photography exploring city architecture'
  },
  // Add more items here
];

interface PortfolioMasonryProps {
  selectedCategory: string;
}

export default function PortfolioMasonry({ selectedCategory }: PortfolioMasonryProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const filteredItems = selectedCategory === 'all'
    ? portfolioItems
    : portfolioItems.filter(item => item.category === selectedCategory);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
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
            onHoverStart={() => setHoveredItem(item.id)}
            onHoverEnd={() => setHoveredItem(null)}
          >
            <motion.div
              className="relative aspect-[4/3] overflow-hidden rounded-xl"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              {/* Placeholder for when images are not available */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm" />
              
              {/* Image will be added here when available */}
              <div className="absolute inset-0 bg-gray-800/50" />

              {/* Content Overlay */}
              <motion.div
                className="absolute inset-0 p-6 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/50 to-transparent"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <motion.h3
                  className="text-xl font-bold text-white mb-2"
                  initial={{ y: 20, opacity: 0 }}
                  whileHover={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {item.title}
                </motion.h3>
                <motion.p
                  className="text-gray-300 text-sm"
                  initial={{ y: 20, opacity: 0 }}
                  whileHover={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  {item.description}
                </motion.p>
              </motion.div>

              {/* Category Tag */}
              <motion.div
                className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md bg-white/10"
                initial={{ opacity: 0, scale: 0.8 }}
                whileHover={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
              </motion.div>
            </motion.div>
          </motion.div>
        ))}

        {filteredItems.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="col-span-full text-center py-12"
          >
            <p className="text-gray-400 text-lg">
              No items found in this category yet.
            </p>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
} 