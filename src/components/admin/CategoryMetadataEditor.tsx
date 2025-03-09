'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PortfolioCategory } from '@/types/portfolio';
import { getCategoryMetadata, updateCategoryMetadata } from '@/lib/firebase/portfolio';

// Text animation variants
const textReveal = {
  initial: { 
    clipPath: "inset(0 100% 0 0)",
    opacity: 0,
  },
  animate: {
    clipPath: "inset(0 0% 0 0)",
    opacity: 1,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

interface CategoryMetadataEditorProps {
  category: PortfolioCategory;
}

export default function CategoryMetadataEditor({ category }: CategoryMetadataEditorProps) {
  const [aboutText, setAboutText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getCategoryMetadata(category);
        if (response.error) {
          setError(response.error);
        } else if (response.metadata) {
          setAboutText(response.metadata.description || '');
        }
      } catch (err) {
        console.error('Error loading category metadata:', err);
        setError('Failed to load category information.');
      } finally {
        setLoading(false);
      }
    };

    loadMetadata();
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSaveMessage(null);

      await updateCategoryMetadata(category, {
        description: aboutText,
        category,
        title: category.charAt(0).toUpperCase() + category.slice(1),
        icon: '',
        featured: false,
        order: 0,
      });

      setSaveMessage('Category information saved successfully!');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      console.error('Error saving category metadata:', err);
      setError('Failed to save category information.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <motion.div 
          className="font-display text-blue-300 flex items-center space-x-2"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0.5, 1, 0.5],
            y: [0, -5, 0]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 2, 
            ease: "easeInOut" 
          }}
        >
          <span>Loading description</span>
          <span className="inline-flex">
            {[0, 1, 2].map(i => (
              <motion.span 
                key={i}
                animate={{ scale: [1, 1.3, 1] }} 
                transition={{ 
                  repeat: Infinity, 
                  duration: 1.5, 
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
              >
                .
              </motion.span>
            ))}
          </span>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <motion.h3 
        variants={textReveal}
        initial="initial"
        animate="animate"
        className="text-2xl font-display font-bold mb-6 tracking-tight text-blue-300 drop-shadow-[0_1px_3px_rgba(59,130,246,0.5)]"
      >
        About This Category
      </motion.h3>
      <motion.form 
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="mb-6">
          <label htmlFor="aboutText" className="block text-sm font-medium text-gray-300 mb-2 tracking-wide uppercase">
            Category Description
          </label>
          <textarea
            id="aboutText"
            value={aboutText}
            onChange={(e) => setAboutText(e.target.value)}
            className="w-full p-4 bg-white/5 border border-gray-600 focus:border-blue-400 rounded-lg text-white shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans leading-relaxed tracking-wide"
            rows={6}
            placeholder={`Write a compelling description for the ${category} category...`}
          />
          <motion.p 
            className="mt-2 text-xs text-gray-400 italic font-sans"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            This description will be displayed on the {category} portfolio page.
          </motion.p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 text-red-400 text-sm p-4 bg-red-900/20 border border-red-700/30 rounded-lg font-sans leading-relaxed"
          >
            <div className="flex items-center mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">Error</span>
            </div>
            {error}
          </motion.div>
        )}

        {saveMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-5 text-green-400 text-sm p-4 bg-green-900/20 border border-green-700/30 rounded-lg font-sans leading-relaxed"
          >
            <div className="flex items-center mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">Success</span>
            </div>
            {saveMessage}
          </motion.div>
        )}

        <motion.button
          type="submit"
          disabled={saving}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="relative overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-lg font-medium tracking-wide disabled:opacity-50 transition-all duration-300 shadow-lg"
        >
          <motion.span 
            className="absolute inset-0 bg-white/20"
            initial={{ x: '-100%' }}
            whileHover={{ x: '100%' }}
            transition={{ duration: 0.6 }}
          />
          <span className="relative z-10 flex items-center">
            {saving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
                </svg>
                Save Description
              </>
            )}
          </span>
        </motion.button>
      </motion.form>
    </div>
  );
} 