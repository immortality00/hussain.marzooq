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
        
        // Load both items and metadata in parallel
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

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading {category} items...</div>
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
    <div>
      {metadata?.aboutText && (
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{metadata.aboutText}</p>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-lg text-gray-600">No {category} items found.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
            >
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
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