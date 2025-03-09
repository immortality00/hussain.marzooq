'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PortfolioItem, PortfolioCategory } from '@/types/portfolio';
import { getPortfolioItems, addPortfolioItem, updatePortfolioItem, deletePortfolioItem } from '@/lib/firebase/portfolio';
import GlassPanel from '@/components/ui/GlassPanel';

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

interface PortfolioManagerProps {
  category: PortfolioCategory;
}

export default function PortfolioManager({ category }: PortfolioManagerProps) {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, [category]);

  const loadItems = async () => {
    try {
      setLoading(true);
      const response = await getPortfolioItems(category);
      if (response.error) {
        console.error('Error loading items:', response.error);
      } else {
        setItems(response.items);
      }
    } catch (error) {
      console.error('Error loading items:', error);
      setItems([]); // Set to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    try {
      if (editingId) {
        await updatePortfolioItem(category, editingId, {
          title,
          description,
          updatedAt: new Date().toISOString(),
        });
      } else {
        await addPortfolioItem(category, {
          title,
          description,
          category,
          tags: [],
          featured: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      setTitle('');
      setDescription('');
      setEditingId(null);
      await loadItems();
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  const handleEdit = (item: PortfolioItem) => {
    setTitle(item.title);
    setDescription(item.description);
    setEditingId(item.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await deletePortfolioItem(category, id);
      await loadItems();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center p-20">
      <motion.div 
        className="animate-pulse text-blue-300 flex items-center space-x-2 font-display"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ repeat: Infinity, repeatType: "reverse", duration: 1.5 }}
      >
        <span>Loading</span>
        <span className="inline-block">
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ times: [0, 0.5, 1], duration: 1.5, repeat: Infinity }}
          >.</motion.span>
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ times: [0, 0.5, 1], duration: 1.5, repeat: Infinity, delay: 0.2 }}
          >.</motion.span>
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ times: [0, 0.5, 1], duration: 1.5, repeat: Infinity, delay: 0.4 }}
          >.</motion.span>
        </span>
      </motion.div>
    </div>
  );

  return (
    <div className="p-8">
      <motion.h2 
        variants={textReveal}
        initial="initial"
        animate="animate"
        className="text-3xl font-display font-bold mb-6 text-blue-300 capitalize tracking-tight drop-shadow-[0_1px_3px_rgba(59,130,246,0.5)]"
      >
        {category} Items
      </motion.h2>
      
      <GlassPanel intensity="low" className="mb-10 p-8">
        <motion.form 
          onSubmit={handleSubmit} 
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2 tracking-wide">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter title..."
              className="w-full p-3 bg-white/5 border border-gray-600 focus:border-blue-400 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner font-sans tracking-wide"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2 tracking-wide">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description..."
              className="w-full p-3 bg-white/5 border border-gray-600 focus:border-blue-400 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner font-sans leading-relaxed tracking-wide"
              rows={4}
              required
            />
          </div>
          <div className="flex space-x-3 pt-2">
            <motion.button
              type="submit"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`relative overflow-hidden px-6 py-3 rounded-lg text-white font-medium tracking-wide shadow-lg ${
                editingId 
                ? 'bg-gradient-to-r from-amber-500 to-orange-600' 
                : 'bg-gradient-to-r from-blue-500 to-purple-600'
              }`}
            >
              <motion.span 
                className="absolute inset-0 bg-white/20"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
              />
              <span className="relative z-10">
                {editingId ? 'Update Item' : 'Add Item'}
              </span>
            </motion.button>
            {editingId && (
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setEditingId(null);
                  setTitle('');
                  setDescription('');
                }}
                className="relative overflow-hidden px-6 py-3 bg-white/10 text-white rounded-lg tracking-wide"
              >
                <motion.span 
                  className="absolute inset-0 bg-white/10"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6 }}
                />
                <span className="relative z-10">Cancel</span>
              </motion.button>
            )}
          </div>
        </motion.form>
      </GlassPanel>

      <AnimatePresence mode="popLayout">
        <motion.div 
          className="space-y-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {items.length === 0 ? (
            <motion.div 
              className="text-center p-12 text-gray-400 font-display italic"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              No items found. Add your first {category} item above.
            </motion.div>
          ) : (
            items.map((item, index) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                layout
              >
                <GlassPanel intensity="low" hover={true} className="overflow-hidden backdrop-blur-sm">
                  <div className="p-6">
                    <motion.h3 
                      className="font-display font-bold text-xl bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent mb-3 drop-shadow-[0_1px_2px_rgba(59,130,246,0.5)] tracking-tight"
                      initial={{ clipPath: "inset(0 100% 0 0)" }}
                      animate={{ clipPath: "inset(0 0 0 0)" }}
                      transition={{ delay: 0.2 + index * 0.05, duration: 0.6, ease: "easeOut" }}
                    >
                      {item.title}
                    </motion.h3>
                    <p className="text-gray-300 mb-4 font-sans leading-relaxed tracking-wide">{item.description}</p>
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-400 font-sans tracking-wider">
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.4 + index * 0.05 }}
                        >
                          Updated: {new Date(item.updatedAt).toLocaleDateString()}
                        </motion.span>
                      </div>
                      <div className="flex space-x-3">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleEdit(item)}
                          className="px-4 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-md text-sm tracking-wide font-medium flex items-center space-x-1 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                          <span>Edit</span>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDelete(item.id)}
                          className="px-4 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-md text-sm tracking-wide font-medium flex items-center space-x-1 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <span>Delete</span>
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </GlassPanel>
              </motion.div>
            ))
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
} 