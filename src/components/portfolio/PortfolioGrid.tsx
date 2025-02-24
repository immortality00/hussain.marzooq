'use client';

import { useEffect, useState } from 'react';
import { PortfolioItem, PortfolioCategory, CategoryMetadata } from '@/types/portfolio';
import { getPortfolioItems, getCategoryMetadata } from '@/lib/firebase/portfolio';

interface PortfolioGridProps {
  category: PortfolioCategory;
}

export default function PortfolioGrid({ category }: PortfolioGridProps) {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [metadata, setMetadata] = useState<CategoryMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [loadedItems, categoryMetadata] = await Promise.all([
          getPortfolioItems(category),
          getCategoryMetadata(category)
        ]);
        
        setItems(loadedItems);
        setMetadata(categoryMetadata);
      } catch (err) {
        console.error('Error loading portfolio data:', err);
        setError('Failed to load portfolio items. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [category]);

  const renderPlaceholder = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
        >
          <div className="aspect-w-16 aspect-h-9 bg-gray-200 animate-pulse" />
          <div className="p-6">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-full mb-2 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="bg-gray-50 rounded-lg p-6 mb-8 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
        {renderPlaceholder()}
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <div className="prose max-w-none">
          {metadata?.aboutText ? (
            <p className="text-gray-700 whitespace-pre-wrap">{metadata.aboutText}</p>
          ) : (
            <div className="text-center py-8">
              <p className="text-xl text-gray-500 font-semibold">About This Category</p>
              <p className="text-gray-400 mt-2">Coming Soon</p>
            </div>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12">
          <div className="text-center">
            <div className="text-5xl mb-4">✨</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No {category} items yet
            </h3>
            <p className="text-gray-500">
              Check back soon for amazing {category} content!
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group"
            >
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-gray-600">{item.description}</p>
                <div className="mt-4 text-sm text-gray-500">
                  Added {new Date(item.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 