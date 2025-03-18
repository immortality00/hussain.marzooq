'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

/**
 * This is an example component that showcases the new standardized design system.
 * It demonstrates various styles, components, and animations defined in the system.
 * 
 * This component is for demonstration purposes and is not meant to be used in production.
 */
export default function StyleSystemExample() {
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'components'>('colors');
  
  return (
    <section className="py-section-y">
      <div className="container-lg">
        <header className="text-center mb-xl">
          <h1 className="heading-2 bg-clip-text text-transparent bg-gradient-blue-purple mb-sm">
            Design System Examples
          </h1>
          <p className="body-large max-w-3xl mx-auto">
            This component showcases the standardized design tokens and components available in our system.
          </p>
        </header>
        
        {/* Tab Navigation */}
        <div className="flex justify-center gap-md mb-xl">
          <button 
            className={`px-lg py-sm rounded-full transition-standard ${activeTab === 'colors' ? 'glass-button' : 'bg-transparent'}`}
            onClick={() => setActiveTab('colors')}
          >
            Colors
          </button>
          <button 
            className={`px-lg py-sm rounded-full transition-standard ${activeTab === 'typography' ? 'glass-button' : 'bg-transparent'}`}
            onClick={() => setActiveTab('typography')}
          >
            Typography
          </button>
          <button 
            className={`px-lg py-sm rounded-full transition-standard ${activeTab === 'components' ? 'glass-button' : 'bg-transparent'}`}
            onClick={() => setActiveTab('components')}
          >
            Components
          </button>
        </div>
        
        {/* Colors Section */}
        {activeTab === 'colors' && (
          <motion.div 
            className="stagger-fade-in"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="heading-3 mb-lg">Primary Colors</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-md mb-xl">
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-blue-primary mb-sm"></div>
                <p className="body-small">Blue Primary</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-purple-primary mb-sm"></div>
                <p className="body-small">Purple Primary</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-emerald-primary mb-sm"></div>
                <p className="body-small">Emerald Primary</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-rose-primary mb-sm"></div>
                <p className="body-small">Rose Primary</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-cyan-primary mb-sm"></div>
                <p className="body-small">Cyan Primary</p>
              </div>
            </div>
            
            <h2 className="heading-3 mb-lg">Gradients</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div className="h-20 rounded-xl bg-gradient-blue-purple flex items-center justify-center">
                <p className="text-white font-medium">Blue to Purple</p>
              </div>
              <div className="h-20 rounded-xl bg-gradient-cyan-blue flex items-center justify-center">
                <p className="text-white font-medium">Cyan to Blue</p>
              </div>
              <div className="h-20 rounded-xl bg-gradient-emerald-cyan flex items-center justify-center">
                <p className="text-white font-medium">Emerald to Cyan</p>
              </div>
              <div className="h-20 rounded-xl bg-gradient-rose-purple flex items-center justify-center">
                <p className="text-white font-medium">Rose to Purple</p>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Typography Section */}
        {activeTab === 'typography' && (
          <motion.div 
            className="stagger-fade-in"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="glass-panel p-lg mb-lg">
              <h1 className="heading-1 mb-md">Heading 1</h1>
              <h2 className="heading-2 mb-md">Heading 2</h2>
              <h3 className="heading-3 mb-md">Heading 3</h3>
              <h4 className="heading-4 mb-md">Heading 4</h4>
            </div>
            
            <div className="glass-panel p-lg">
              <p className="body-large mb-md">Body Large - This is larger text typically used for introductions or important paragraphs.</p>
              <p className="body-medium mb-md">Body Medium - This is the standard text size for most content on the site.</p>
              <p className="body-small">Body Small - This smaller text is used for captions, footnotes, or secondary information.</p>
            </div>
          </motion.div>
        )}
        
        {/* Components Section */}
        {activeTab === 'components' && (
          <motion.div 
            className="stagger-fade-in"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="heading-3 mb-lg">Glassmorphic Components</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-lg mb-xl">
              <div className="glass-card p-card-padding">
                <h3 className="heading-4 mb-sm">Glass Card</h3>
                <p className="body-medium">This is a standard glass card component with rounded corners and a subtle blur effect.</p>
              </div>
              
              <div className="glass-panel p-card-padding">
                <h3 className="heading-4 mb-sm">Glass Panel</h3>
                <p className="body-medium">This is a glass panel with slightly different styling for content sections.</p>
              </div>
              
              <div className="glass-dark p-card-padding rounded-xl">
                <h3 className="heading-4 mb-sm">Dark Glass</h3>
                <p className="body-medium">A darker variant of the glass effect for higher contrast.</p>
              </div>
            </div>
            
            <h2 className="heading-3 mb-lg">Buttons</h2>
            <div className="flex flex-wrap gap-md mb-xl">
              <button className="px-md py-sm rounded-full bg-blue-primary text-white hover:bg-opacity-90 transition-standard">
                Primary Button
              </button>
              
              <button className="glass-button px-md py-sm">
                Glass Button
              </button>
              
              <button className="px-md py-sm rounded-full bg-gradient-blue-purple text-white hover:opacity-90 transition-standard">
                Gradient Button
              </button>
            </div>
            
            <h2 className="heading-3 mb-lg">Animations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
              <div className="animate-fadeIn glass-light p-md rounded-xl text-center">
                <p>Fade In</p>
              </div>
              
              <div className="animate-slideIn glass-light p-md rounded-xl text-center">
                <p>Slide In</p>
              </div>
              
              <div className="animate-fadeInUp glass-light p-md rounded-xl text-center">
                <p>Fade In Up</p>
              </div>
              
              <motion.div 
                className="glass-light p-md rounded-xl text-center"
                animate={{ scale: [0.9, 1.05, 1] }}
                transition={{ duration: 0.5 }}
              >
                <p>Scale Animation</p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
} 