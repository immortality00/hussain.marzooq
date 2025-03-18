import React from 'react';
import Button from '@/components/ui/Button';

/**
 * ButtonExamples component
 * 
 * Demonstrates the different button variants and sizes available
 * in the golden/orange color scheme that matches the logo.
 */
export default function ButtonExamples() {
  return (
    <div className="p-8 space-y-8 bg-gray-900">
      <div>
        <h2 className="text-2xl font-script text-gold-500 mb-4">Button Variants</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="gold">Gold Button</Button>
          <Button variant="gold-outline">Gold Outline</Button>
          <Button variant="gold-gradient">
            <span>Gold Gradient</span>
          </Button>
          <Button variant="gold-glow">Gold Glow</Button>
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-script text-gold-500 mb-4">Button Sizes</h2>
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="gold" size="sm">Small</Button>
          <Button variant="gold" size="md">Medium</Button>
          <Button variant="gold" size="lg">Large</Button>
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-script text-gold-500 mb-4">Link Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="gold" href="/photography">Photography</Button>
          <Button variant="gold-outline" href="/film">Film</Button>
          <Button variant="gold-gradient" href="/contact">
            <span>Contact Me</span>
          </Button>
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-script text-gold-500 mb-4">Button States</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="gold">Default</Button>
          <Button variant="gold" className="opacity-75" disabled>Disabled</Button>
          <Button variant="gold" className="animate-pulse">Loading</Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Integration Example
 * 
 * This shows how to integrate the Button component with the new styling
 * across multiple pages/components in your application.
 */
export function IntegrationExample() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-medium">Call to Action Section</h3>
        <Button variant="gold">Sign Up</Button>
      </div>
      
      <div className="p-6 border border-gray-200 rounded-lg">
        <h3 className="text-xl font-medium mb-2">Newsletter</h3>
        <p className="mb-4">Subscribe to receive updates about my latest work.</p>
        <div className="flex gap-2">
          <input 
            type="email" 
            placeholder="Your email" 
            className="flex-1 px-4 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none"
          />
          <Button variant="gold-gradient">
            <span>Subscribe</span>
          </Button>
        </div>
      </div>
      
      <div className="flex gap-4 justify-center">
        <Button variant="gold-outline" href="/portfolio">View Portfolio</Button>
        <Button variant="gold" href="/contact">Get in Touch</Button>
      </div>
    </div>
  );
} 