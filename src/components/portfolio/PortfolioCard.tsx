'use client';

import { motion } from 'framer-motion';
import { PortfolioItem, PortfolioCategory } from '@/types/portfolio';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

interface PortfolioCardProps {
  item: PortfolioItem;
  category: PortfolioCategory;
}

export default function PortfolioCard({ item, category }: PortfolioCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Generate a background gradient based on category
  const getCategoryGradient = (category: string) => {
    const gradients: Record<string, string> = {
      photography: 'from-gold-500/20 to-orange-500/20',
      film: 'from-orange-500/20 to-amber-500/20',
      webdev: 'from-gold-400/20 to-gold-600/20',
      nfts: 'from-amber-400/20 to-orange-400/20',
      dance: 'from-orange-400/20 to-gold-500/20',
    };
    
    return gradients[category] || 'from-gold-500/20 to-orange-500/20';
  };

  // Get accent color for hover effects
  const getAccentColor = (category: PortfolioCategory) => {
    const colors: Record<string, string> = {
      photography: '#d4af37', // gold
      film: '#e67e22',        // orange
      webdev: '#f2d675',      // light gold
      nfts: '#fbbf24',        // amber
      dance: '#fdba74',       // light orange
    };
    return colors[category] || '#d4af37';
  };

  // Check if the image URL is internal or external
  const isInternalImage = (url?: string) => {
    if (!url) return false;
    return url.startsWith('/') || url.startsWith('data:');
  };

  return (
    <motion.div
      className="aspect-[4/3] h-full group relative rounded-2xl overflow-hidden glow-effect"
      whileHover={{ 
        scale: 1.03,
        y: -5,
        boxShadow: `0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1), 0 0 15px ${getAccentColor(category)}30`
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      data-portfolio-card="true"
      data-card-title={item.title}
      data-card-category={category}
    >
      {/* Card Background with glass effect */}
      <div className="absolute inset-0 backdrop-blur-xl bg-black/30 border border-white/10 z-0" />
      
      {/* Animated gradient background */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br ${getCategoryGradient(category)} opacity-0 group-hover:opacity-100 transition-all duration-500 z-0`}
        style={{
          backgroundSize: '200% 200%',
          animation: 'gradientBackground 8s ease infinite'
        }}
      />
      
      {/* Image (if available) */}
      {item.imageUrl && !imageError && (
        <div className="absolute inset-0 z-0 opacity-60 group-hover:opacity-40 transition-opacity duration-300">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />
          
          {isInternalImage(item.imageUrl) ? (
            // Use Next.js Image for internal URLs
            <Image
              src={item.imageUrl}
              alt={item.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
              priority={false}
              onError={() => setImageError(true)}
            />
          ) : (
            // Use CSS background for external URLs
            <div 
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url(${item.imageUrl})` }}
            />
          )}
        </div>
      )}
      
      {/* Glowing accent */}
      <motion.div 
        className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-70 z-0 transition-opacity duration-300"
        style={{
          background: `linear-gradient(130deg, transparent 40%, ${getAccentColor(category)} 90%)`,
          filter: 'blur(12px)'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 0.3 : 0 }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Content */}
      <div className="absolute inset-0 p-6 flex flex-col justify-end z-10">
        <motion.h3 
          className="text-xl font-bold text-white mb-2"
          initial={{ y: 0 }}
          animate={{ y: isHovered ? -5 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {item.title}
        </motion.h3>
        
        <motion.p 
          className="text-gray-300 text-sm"
          initial={{ opacity: 0.7, y: 0 }}
          animate={{ 
            opacity: isHovered ? 1 : 0.7,
            y: isHovered ? 0 : 5
          }}
          transition={{ duration: 0.3 }}
        >
          {item.description}
        </motion.p>
        
        {/* Tags */}
        <motion.div 
          className="flex flex-wrap gap-2 mt-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ 
            opacity: isHovered ? 1 : 0,
            y: isHovered ? 0 : 10
          }}
          transition={{ duration: 0.3 }}
        >
          {item.tags && item.tags.slice(0, 3).map((tag, index) => (
            <span 
              key={index} 
              className="text-xs py-1 px-2 rounded-full bg-white/10 backdrop-blur-md text-white/80"
            >
              {tag}
            </span>
          ))}
        </motion.div>
        
        {/* Links */}
        <motion.div 
          className="flex gap-3 mt-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ 
            opacity: isHovered ? 1 : 0,
            y: isHovered ? 0 : 10
          }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {item.liveUrl && (
            <Link 
              href={item.liveUrl} 
              target="_blank" 
              className="text-xs py-1 px-3 rounded-full bg-white/20 backdrop-blur-md text-white/90 hover:bg-white/30 transition-colors"
            >
              View Live
            </Link>
          )}
          
          {item.githubUrl && (
            <Link 
              href={item.githubUrl} 
              target="_blank" 
              className="text-xs py-1 px-3 rounded-full bg-white/10 backdrop-blur-md text-white/90 hover:bg-white/20 transition-colors"
            >
              GitHub
            </Link>
          )}
        </motion.div>
      </div>

      {/* Category Tag */}
      <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md bg-white/10 z-20">
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </div>
    </motion.div>
  );
} 