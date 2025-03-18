'use client';

import React, { useEffect } from 'react';

/**
 * This component adds cursor effects specifically to portfolio cards.
 * It uses a data attribute approach which works with any existing card component
 * without requiring modification of the component itself.
 * 
 * Usage:
 * 1. Import and add <PortfolioCardCursorEffect /> once at the top of your component
 * 2. Add the "data-portfolio-card" attribute to your card components
 * 3. Optionally add data-card-title or data-card-category for specific text
 */
export default function PortfolioCardCursorEffect() {
  useEffect(() => {
    // Find all portfolio cards
    const portfolioCards = document.querySelectorAll('[data-portfolio-card]');
    
    // Apply cursor interaction attributes to each card
    portfolioCards.forEach(card => {
      // Already has cursor interaction
      if (card.hasAttribute('data-cursor-interaction')) return;
      
      // Get custom title or category if available
      const title = card.getAttribute('data-card-title') || '';
      const category = card.getAttribute('data-card-category') || '';
      const displayText = title || category || 'View';
      
      // Add cursor interaction attributes
      card.setAttribute('data-cursor-interaction', 'true');
      card.setAttribute('data-cursor-type', 'card');
      card.setAttribute('data-cursor-text', displayText);
      
      // Add hover style (optional)
      card.classList.add('cursor-none');
      
      // Optional: Add color based on category
      if (category) {
        let color = '';
        switch (category.toLowerCase()) {
          case 'photography':
            color = 'rgba(59, 130, 246, 0.2)'; // blue
            break;
          case 'film':
            color = 'rgba(139, 92, 246, 0.2)'; // purple
            break;
          case 'webdev':
            color = 'rgba(6, 182, 212, 0.2)'; // cyan
            break;
          case 'nfts':
            color = 'rgba(16, 185, 129, 0.2)'; // emerald
            break;
          case 'dance':
            color = 'rgba(244, 63, 94, 0.2)'; // rose
            break;
        }
        
        if (color) {
          card.setAttribute('data-cursor-color', color);
        }
      }
    });
    
    return () => {
      // Clean up is optional since attributes are harmless if component is removed
    };
  }, []);

  // This is a utility component that doesn't render anything
  return null;
}

/**
 * Helper function to add cursor interaction to elements via a React hook
 * Usage: `usePortfolioCardEffect(ref)`
 */
export function usePortfolioCardEffect(ref: React.RefObject<HTMLElement>) {
  useEffect(() => {
    if (!ref.current) return;
    
    const element = ref.current;
    
    // Get custom title or category if available
    const title = element.getAttribute('data-card-title') || '';
    const category = element.getAttribute('data-card-category') || '';
    const displayText = title || category || 'View';
    
    // Add cursor interaction attributes
    element.setAttribute('data-cursor-interaction', 'true');
    element.setAttribute('data-cursor-type', 'card');
    element.setAttribute('data-cursor-text', displayText);
    element.style.cursor = 'none';
    
    // Cleanup when component unmounts
    return () => {
      element.removeAttribute('data-cursor-interaction');
      element.removeAttribute('data-cursor-type');
      element.removeAttribute('data-cursor-text');
      element.style.cursor = '';
    };
  }, [ref]);
} 