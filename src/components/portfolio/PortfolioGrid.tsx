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
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Monitor online/offline status
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOffline(!navigator.onLine);

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
        
        // Load data in parallel with error handling for each request
        const [itemsResult, metadataResult] = await Promise.allSettled([
          getPortfolioItems(category),
          getCategoryMetadata(category)
        ]);

        // Handle portfolio items result
        if (itemsResult.status === 'fulfilled') {
          setItems(itemsResult.value);
        } else {
          console.error('Error loading items:', itemsResult.reason);
        }

        // Handle metadata result
        if (metadataResult.status === 'fulfilled') {
          setMetadata(metadataResult.value);
        } else {
          console.error('Error loading metadata:', metadataResult.reason);
        }

        // Set error if both requests failed
        if (itemsResult.status === 'rejected' && metadataResult.status === 'rejected') {
          throw new Error('Failed to load portfolio data');
        }
      } catch (err) {
        console.error('Error loading portfolio data:', err);
        setError('Failed to load portfolio items. Please check your connection and try again.');
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
        <div className="text-center p-8">
          <div className="text-red-600 mb-4">{error}</div>
          {isOffline && (
            <div className="text-amber-600">
              You are currently offline. Some content may not be available.
            </div>
          )}
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {isOffline && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
          <p className="text-amber-700">
            You are currently offline. Some content may not be up to date.
          </p>
        </div>
      )}

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