'use client';

import { useState, useEffect } from 'react';
import { HomePageContent, AboutPageContent, ContactPageContent } from '@/lib/api/pageContentService';
import { PortfolioCategory } from '@/types/portfolio';

// The types of content that can be previewed
export type PreviewContentType = 
  | { type: 'home'; content: Partial<HomePageContent> }
  | { type: 'about'; content: Partial<AboutPageContent> }
  | { type: 'contact'; content: Partial<ContactPageContent> }
  | { type: 'portfolio'; category: PortfolioCategory; title?: string; description?: string };

interface ContentPreviewProps {
  content: PreviewContentType;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  className?: string;
}

const ContentPreview: React.FC<ContentPreviewProps> = ({
  content,
  isExpanded = false,
  onToggleExpand,
  className = '',
}) => {
  // State to track refresh indicator
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Listen for content update events to refresh the preview
  useEffect(() => {
    const handleContentUpdate = (event: Event) => {
      // Check if the event is for the current content type
      const customEvent = event as CustomEvent;
      const pageName = customEvent.detail?.pageName;
      
      if (
        (content.type === 'home' && pageName === 'home') ||
        (content.type === 'about' && pageName === 'about') ||
        (content.type === 'contact' && pageName === 'contact') ||
        (content.type === 'portfolio' && pageName?.startsWith(content.category))
      ) {
        // Force a refresh of the preview
        setRefreshKey(prev => prev + 1);
      }
    };
    
    // Add event listener
    window.addEventListener('content-updated', handleContentUpdate);
    
    // Cleanup
    return () => {
      window.removeEventListener('content-updated', handleContentUpdate);
    };
  }, [content]);
  
  const renderHomePreview = (homeContent: Partial<HomePageContent>) => (
    <div className="space-y-3">
      <div className="relative h-32 w-full rounded-lg overflow-hidden bg-gradient-to-r from-blue-900 to-purple-900">
        {homeContent.hero?.backgroundImage && (
          <div className="absolute inset-0 opacity-40">
            <div 
              className="w-full h-full bg-center bg-cover"
              style={{ backgroundImage: `url(${homeContent.hero.backgroundImage})` }}
            />
          </div>
        )}
        <div className="absolute inset-0 flex flex-col justify-center p-4 text-center">
          <h3 className="text-xl font-bold text-white truncate">
            {homeContent.hero?.title || 'Your Hero Title'}
          </h3>
          <p className="text-sm text-white/80 mt-1 truncate">
            {homeContent.hero?.subtitle || 'Your subtitle goes here'}
          </p>
        </div>
      </div>
      
      {isExpanded && (
        <div className="pt-3 border-t border-white/10">
          <h4 className="text-sm font-semibold mb-1">Introduction</h4>
          <h5 className="text-xs font-medium text-white/90 mb-1">
            {homeContent.introduction?.title || 'Introduction Title'}
          </h5>
          <p className="text-xs text-white/70 line-clamp-3">
            {homeContent.introduction?.content || 'Your introduction text will appear here.'}
          </p>
        </div>
      )}
    </div>
  );

  const renderAboutPreview = (aboutContent: Partial<AboutPageContent>) => (
    <div className="space-y-3">
      <div className="relative h-28 w-full rounded-lg overflow-hidden bg-gradient-to-r from-indigo-900 to-purple-900">
        {aboutContent.hero?.backgroundImage && (
          <div className="absolute inset-0 opacity-40">
            <div 
              className="w-full h-full bg-center bg-cover"
              style={{ backgroundImage: `url(${aboutContent.hero.backgroundImage})` }}
            />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <h3 className="text-lg font-bold text-white">
            {aboutContent.hero?.title || 'About Page'}
          </h3>
        </div>
      </div>
      
      {isExpanded && (
        <>
          <div className="flex items-center gap-3 pt-2">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-lg">
              👤
            </div>
            <div>
              <h4 className="text-sm font-semibold">
                {aboutContent.personalInfo?.name || 'Your Name'}
              </h4>
              <p className="text-xs text-white/70">
                {aboutContent.personalInfo?.location || 'Your Location'}
              </p>
            </div>
          </div>
          
          <div className="pt-2 border-t border-white/10">
            <p className="text-xs text-white/70 line-clamp-3">
              {aboutContent.biography?.content || 'Your biography text will appear here.'}
            </p>
          </div>
        </>
      )}
    </div>
  );

  const renderContactPreview = (contactContent: Partial<ContactPageContent>) => (
    <div className="space-y-3">
      <div className="relative h-24 w-full rounded-lg overflow-hidden bg-gradient-to-r from-blue-900 to-teal-900">
        {contactContent.hero?.backgroundImage && (
          <div className="absolute inset-0 opacity-40">
            <div 
              className="w-full h-full bg-center bg-cover"
              style={{ backgroundImage: `url(${contactContent.hero.backgroundImage})` }}
            />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <h3 className="text-lg font-bold text-white">
            {contactContent.hero?.title || 'Contact Page'}
          </h3>
        </div>
      </div>
      
      {isExpanded && (
        <>
          <div className="pt-2 grid grid-cols-1 gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs">✉️</span>
              <span className="text-xs text-white/80 truncate">
                {contactContent.contactInfo?.email || 'email@example.com'}
              </span>
            </div>
            {contactContent.contactInfo?.phone && (
              <div className="flex items-center gap-2">
                <span className="text-xs">📱</span>
                <span className="text-xs text-white/80 truncate">
                  {contactContent.contactInfo.phone}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-xs">📍</span>
              <span className="text-xs text-white/80 truncate">
                {contactContent.contactInfo?.address || 'Your Location'}
              </span>
            </div>
          </div>
          
          <div className="pt-2 border-t border-white/10 flex gap-3">
            {contactContent.socialMedia?.instagram && (
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">
                📸
              </div>
            )}
            {contactContent.socialMedia?.twitter && (
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">
                🐦
              </div>
            )}
            {contactContent.socialMedia?.linkedin && (
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">
                💼
              </div>
            )}
            {contactContent.socialMedia?.youtube && (
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">
                📺
              </div>
            )}
            {contactContent.socialMedia?.vimeo && (
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">
                🎬
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );

  const renderPortfolioPreview = (category: PortfolioCategory, title?: string, description?: string) => {
    const getCategoryIcon = (cat: PortfolioCategory) => {
      switch(cat) {
        case 'photography': return '📸';
        case 'film': return '🎬';
        case 'webdev': return '💻';
        case 'nfts': return '🎨';
        case 'dance': return '💃';
        default: return '📁';
      }
    };
    
    const getCategoryTitle = (cat: PortfolioCategory) => {
      switch(cat) {
        case 'photography': return 'Photography';
        case 'film': return 'Films';
        case 'webdev': return 'Web Development';
        case 'nfts': return 'NFTs';
        case 'dance': return 'Dance';
        default: return 'Portfolio';
      }
    };
    
    return (
      <div className="space-y-3">
        <div className="relative h-24 w-full rounded-lg overflow-hidden bg-gradient-to-r from-gray-800 to-gray-900">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-3xl">{getCategoryIcon(category)}</div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2 text-center">
            <h3 className="text-sm font-semibold text-white">
              {title || getCategoryTitle(category)}
            </h3>
          </div>
        </div>
        
        {isExpanded && description && (
          <div className="pt-2">
            <p className="text-xs text-white/70 line-clamp-3">
              {description}
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderPreviewContent = () => {
    switch (content.type) {
      case 'home':
        return renderHomePreview(content.content);
      case 'about':
        return renderAboutPreview(content.content);
      case 'contact':
        return renderContactPreview(content.content);
      case 'portfolio':
        return renderPortfolioPreview(content.category, content.title, content.description);
      default:
        return <div className="p-4 text-center text-sm">Preview not available</div>;
    }
  };

  return (
    <div className={`bg-gray-800/80 backdrop-blur-md border border-gray-700/50 rounded-lg overflow-hidden ${className}`}>
      {/* Preview Header */}
      <div className="border-b border-gray-700/70 py-3 px-4 flex justify-between items-center">
        <h4 className="font-medium text-white">Preview</h4>
        
        {onToggleExpand && (
          <button 
            onClick={onToggleExpand}
            className="p-1 rounded hover:bg-gray-700/50 text-gray-400 hover:text-white"
          >
            {isExpanded ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 1v4m0 0h-4m4 0l-5-5" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.4 4.4m0 0l-4.4 4.4m4.4-4.4H3" />
              </svg>
            )}
          </button>
        )}
      </div>
      
      {/* Preview Content */}
      <div className={`p-4 ${isExpanded ? '' : 'max-h-64 overflow-y-auto'}`}>
        <div className="pointer-events-none" key={`preview-${refreshKey}`}>
          {renderPreviewContent()}
        </div>
      </div>
    </div>
  );
};

export default ContentPreview; 