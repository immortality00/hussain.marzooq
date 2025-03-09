'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PortfolioItem, PortfolioCategory } from '@/types/portfolio';
import { getPortfolioItems } from '@/lib/firebase/portfolio';
import GlassPanel from '../ui/GlassPanel';

interface PortfolioGridProps {
  category: PortfolioCategory;
}

export default function PortfolioGrid({ category }: PortfolioGridProps) {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { items: portfolioItems, error: fetchError } = await getPortfolioItems(category);
        
        // If there's an error, set it and return early
        if (fetchError) {
          setError(fetchError);
          return;
        }

        // No error, set the items (even if empty)
        setItems(portfolioItems);
      } catch (err) {
        console.error(`Unexpected error in ${category} loadData:`, err);
        setError('An unexpected error occurred while loading the portfolio items.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [category]);

  const renderPlaceholder = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, index) => (
        <GlassPanel
          key={index}
          className="aspect-[4/3] animate-pulse"
          intensity="low"
        >
          <div className="h-full bg-white/5" />
        </GlassPanel>
      ))}
    </div>
  );

  if (loading) {
    return renderPlaceholder();
  }

  if (error) {
    return (
      <GlassPanel className="p-6 text-center" intensity="low">
        <p className="text-red-400 mb-4">{error}</p>
        {isOffline && (
          <p className="text-amber-400">
            You appear to be offline. Please check your internet connection.
          </p>
        )}
      </GlassPanel>
    );
  }

  if (items.length === 0) {
    return (
      <GlassPanel className="p-6 text-center" intensity="low">
        <p className="text-gray-400">No items found in this category.</p>
      </GlassPanel>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <GlassPanel
            className="aspect-[4/3] group relative overflow-hidden"
            intensity="low"
            hover={true}
          >
            {/* Content */}
            <div className="absolute inset-0 p-6 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/50 to-transparent">
              <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
              <p className="text-gray-300 text-sm">{item.description}</p>
            </div>

            {/* Category Tag */}
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md bg-white/10">
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </div>
          </GlassPanel>
        </motion.div>
      ))}
    </div>
  );
} 