'use client';

import React from 'react';
import MicroInteractionCursor, { withCursorInteraction } from './MicroInteractionCursor';
import Link from 'next/link';

/**
 * This component demonstrates how to use the MicroInteractionCursor with different
 * types of interactive elements.
 * 
 * To use these micro-interactions in your own components:
 * 1. Add the MicroInteractionCursor component to your layout or page
 * 2. Apply data attributes to elements you want to have custom cursor effects
 * 3. Or use the withCursorInteraction helper for React components
 */
export default function CursorInteractionExamples() {
  return (
    <div className="p-8">
      {/* Add the cursor component (normally you'd add this once in a layout) */}
      <MicroInteractionCursor defaultEnabled={true} />
      
      <h2 className="text-2xl font-bold mb-8">Cursor Interaction Examples</h2>
      
      <div className="space-y-12">
        {/* Method 1: Using data attributes directly */}
        <section className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Method 1: Using data attributes</h3>
          <div className="flex flex-wrap gap-4">
            <button
              className="px-6 py-3 bg-blue-500 rounded-md hover:bg-blue-600 transition-colors"
              data-cursor-interaction="true"
              data-cursor-type="button"
              data-cursor-text="Click me!"
            >
              Hover me (Button)
            </button>
            
            <a 
              href="#" 
              className="px-6 py-3 bg-purple-500 rounded-md hover:bg-purple-600 transition-colors"
              data-cursor-interaction="true"
              data-cursor-type="link"
              data-cursor-text="Visit"
            >
              Hover me (Link)
            </a>
            
            <div 
              className="w-48 h-32 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-md flex items-center justify-center"
              data-cursor-interaction="true"
              data-cursor-type="card"
              data-cursor-color="rgba(16, 185, 129, 0.2)" // Emerald color
            >
              Hover me (Card)
            </div>
            
            <span 
              className="px-6 py-3 bg-rose-500 rounded-md inline-block"
              data-cursor-interaction="true"
              data-cursor-type="text"
              data-cursor-text="Custom Text"
            >
              Hover for text
            </span>
          </div>
        </section>
        
        {/* Method 2: Using the withCursorInteraction helper */}
        <section>
          <h3 className="text-xl font-semibold mb-4">Method 2: Using withCursorInteraction helper</h3>
          <div className="flex flex-wrap gap-4">
            {withCursorInteraction(
              <button className="px-6 py-3 bg-blue-500 rounded-md hover:bg-blue-600 transition-colors">
                Helper Button
              </button>,
              { type: 'button', text: 'Click!' }
            )}
            
            {withCursorInteraction(
              <Link href="#" className="px-6 py-3 bg-purple-500 rounded-md hover:bg-purple-600 transition-colors inline-block">
                Helper Link
              </Link>,
              { type: 'link', text: 'Navigate' }
            )}
            
            {withCursorInteraction(
              <div className="w-48 h-32 bg-gradient-to-br from-blue-500 to-violet-500 rounded-md flex items-center justify-center">
                Helper Card
              </div>,
              { type: 'card', color: 'rgba(79, 70, 229, 0.2)' }
            )}
          </div>
        </section>
        
        {/* Method 3: Mixed content example */}
        <section>
          <h3 className="text-xl font-semibold mb-4">Real-world example</h3>
          <div className="max-w-2xl p-6 border border-gray-200 rounded-lg bg-white/5 backdrop-blur-sm">
            <h4 
              className="text-lg font-bold mb-2"
              data-cursor-interaction="true"
              data-cursor-type="text"
              data-cursor-text="Heading"
            >
              Portfolio Project
            </h4>
            <p className="mb-4 text-gray-300">
              This is a regular paragraph with no cursor effect. The default cursor will be shown here.
              However, you can have <span data-cursor-interaction="true" data-cursor-type="text" data-cursor-text="Important!">specific words</span> with 
              custom cursor effects.
            </p>
            <div className="flex gap-4 mt-6">
              {withCursorInteraction(
                <button className="px-4 py-2 bg-blue-500 rounded-md hover:bg-blue-600 transition-colors">
                  View Project
                </button>,
                { type: 'button', text: 'Click to view' }
              )}
              
              {withCursorInteraction(
                <button className="px-4 py-2 bg-transparent border border-white/20 rounded-md hover:bg-white/5 transition-colors">
                  Details
                </button>,
                { type: 'button', text: 'More info' }
              )}
            </div>
          </div>
        </section>
      </div>
      
      {/* Implementation guide */}
      <div className="mt-16 p-6 border border-gray-700 rounded-lg bg-black/50">
        <h3 className="text-xl font-semibold mb-4">How to implement in your project</h3>
        <ol className="space-y-3 list-decimal list-inside text-gray-300">
          <li>
            Add the MicroInteractionCursor component to your layout:
            <pre className="mt-2 p-3 bg-gray-800 rounded text-sm overflow-x-auto">
              {`import MicroInteractionCursor from '@/components/ui/MicroInteractionCursor';

// In your layout component
return (
  <>
    <MicroInteractionCursor />
    {children}
  </>
);`}
            </pre>
          </li>
          <li>
            Apply to elements using data attributes:
            <pre className="mt-2 p-3 bg-gray-800 rounded text-sm overflow-x-auto">
              {`<button
  data-cursor-interaction="true"
  data-cursor-type="button"
  data-cursor-text="Click me!"
>
  My Button
</button>`}
            </pre>
          </li>
          <li>
            Or use the helper function:
            <pre className="mt-2 p-3 bg-gray-800 rounded text-sm overflow-x-auto">
              {`import { withCursorInteraction } from '@/components/ui/MicroInteractionCursor';

// In your component
return (
  <>
    {withCursorInteraction(
      <button className="...">My Button</button>,
      { type: 'button', text: 'Click!' }
    )}
  </>
);`}
            </pre>
          </li>
        </ol>
      </div>
    </div>
  );
} 