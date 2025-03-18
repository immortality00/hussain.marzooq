'use client';

import { useState, useEffect } from 'react';
import { useAuthProtection } from '@/lib/hooks/useAuthProtection';
import { motion } from 'framer-motion';
import GlassPanel from '@/components/ui/GlassPanel';
import Button from '@/components/admin/ui/Button';
import LoadingIndicator from '@/components/admin/ui/LoadingIndicator';
import { typography, colors, shadows } from '@/components/admin/designSystem';
import { useNotification } from '@/lib/context/NotificationContext';
import useFormValidation, { validators } from '@/lib/hooks/useFormValidation';
import ConfirmationDialog from '@/components/admin/ui/ConfirmationDialog';

// Types for dance portfolio items
interface DanceItem {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  choreographer: string;
  performers: string[];
  date: string;
  featured: boolean;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

// Animation variants
const containerAnimation = {
  hidden: { opacity: 0 },
  show: { 
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemAnimation = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 }
  }
};

// Text animation variants
const textRevealVariants = {
  hidden: { y: 50, opacity: 0 },
  visible: (i: number) => ({
    y: 0,
    opacity: 1,
    transition: {
      delay: i * 0.1,
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1]
    }
  })
};

export default function DanceAdminPage() {
  useAuthProtection(); // Protect the route
  const { showNotification } = useNotification();

  // State for dance items
  const [danceItems, setDanceItems] = useState<DanceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState(false);

  // Mock data - would be replaced with actual Firebase calls
  const mockDanceItems: DanceItem[] = [
    {
      id: '1',
      title: 'Urban Flow',
      description: 'Contemporary dance piece exploring urban environments',
      videoUrl: 'https://www.youtube.com/watch?v=example1',
      thumbnailUrl: 'https://example.com/thumb1.jpg',
      choreographer: 'Jane Doe',
      performers: ['John Smith', 'Alice Johnson'],
      date: '2023-06-15',
      featured: true,
      tags: ['contemporary', 'urban'],
      createdAt: Date.now() - 1000000,
      updatedAt: Date.now() - 500000
    },
    {
      id: '2',
      title: 'Echoes of Tradition',
      description: 'A fusion of classical and modern dance elements',
      videoUrl: 'https://www.youtube.com/watch?v=example2',
      thumbnailUrl: 'https://example.com/thumb2.jpg',
      choreographer: 'Robert Chen',
      performers: ['Lisa Wong', 'Michael Taylor'],
      date: '2023-08-22',
      featured: false,
      tags: ['fusion', 'classical'],
      createdAt: Date.now() - 800000,
      updatedAt: Date.now() - 300000
    }
  ];

  // Form validation for dance item
  const { 
    values: formValues, 
    errors: formErrors, 
    handleChange, 
    handleBlur, 
    handleSubmit,
    resetForm,
    setValue
  } = useFormValidation<{
    title: string;
    description: string;
    videoUrl: string;
    thumbnailUrl: string;
    choreographer: string;
    performers: string;
    date: string;
    featured: boolean;
    tags: string;
  }>({
    title: '',
    description: '',
    videoUrl: '',
    thumbnailUrl: '',
    choreographer: '',
    performers: '',
    date: '',
    featured: false,
    tags: ''
  }, {
    title: [validators.required('Title is required')],
    description: [validators.required('Description is required')],
    videoUrl: [validators.url('Please enter a valid video URL')],
    thumbnailUrl: [validators.url('Please enter a valid thumbnail URL')],
    choreographer: [validators.required('Choreographer is required')],
    date: [validators.required('Date is required')]
  });

  // Load dance items on component mount
  useEffect(() => {
    loadDanceItems();
  }, []);

  // Mock function to load dance items - would be replaced with actual Firebase fetch
  const loadDanceItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would be: const data = await getDanceItems();
      setDanceItems(mockDanceItems);
    } catch (err) {
      console.error('Error loading dance items:', err);
      setError('Failed to load dance portfolio items. Please try again later.');
      showNotification('error', 'Failed to load dance portfolio items');
    } finally {
      setLoading(false);
    }
  };

  // Open form to add new item
  const openAddForm = () => {
    resetForm();
    setEditingItemId(null);
    setIsFormOpen(true);
  };

  // Open form to edit existing item
  const openEditForm = (item: DanceItem) => {
    resetForm();
    setEditingItemId(item.id);
    
    // Populate form with item data
    setValue('title', item.title);
    setValue('description', item.description);
    setValue('videoUrl', item.videoUrl);
    setValue('thumbnailUrl', item.thumbnailUrl);
    setValue('choreographer', item.choreographer);
    setValue('performers', item.performers.join(', '));
    setValue('date', item.date);
    setValue('featured', item.featured);
    setValue('tags', item.tags.join(', '));
    
    setIsFormOpen(true);
  };

  // Handle form submission (add/edit item)
  const onSubmit = async (values: typeof formValues) => {
    try {
      setActionInProgress(true);
      
      // Convert comma-separated strings to arrays
      const performers = values.performers.split(',').map(p => p.trim()).filter(Boolean);
      const tags = values.tags.split(',').map(t => t.trim()).filter(Boolean);
      
      const itemData = {
        title: values.title,
        description: values.description,
        videoUrl: values.videoUrl,
        thumbnailUrl: values.thumbnailUrl,
        choreographer: values.choreographer,
        performers,
        date: values.date,
        featured: values.featured,
        tags,
        updatedAt: Date.now()
      };
      
      if (editingItemId) {
        // Update existing item
        // In a real app: await updateDanceItem(editingItemId, itemData);
        setDanceItems(prev => 
          prev.map(item => 
            item.id === editingItemId 
              ? { ...item, ...itemData }
              : item
          )
        );
        showNotification('success', 'Dance item updated successfully');
      } else {
        // Add new item
        const newItem = {
          id: `temp-${Date.now()}`, // In a real app, this would come from Firebase
          ...itemData,
          createdAt: Date.now()
        };
        
        // In a real app: const newItemWithId = await addDanceItem(itemData);
        setDanceItems(prev => [...prev, newItem as DanceItem]);
        showNotification('success', 'Dance item added successfully');
      }
      
      // Close form after submission
      setIsFormOpen(false);
      setEditingItemId(null);
    } catch (err) {
      console.error('Error saving dance item:', err);
      showNotification('error', 'Failed to save dance item. Please try again.');
    } finally {
      setActionInProgress(false);
    }
  };
  
  // Open delete confirmation dialog
  const openDeleteDialog = (id: string) => {
    setSelectedItemId(id);
    setDeleteDialogOpen(true);
  };
  
  // Handle item deletion
  const handleDelete = async () => {
    if (!selectedItemId) return;
    
    try {
      setActionInProgress(true);
      
      // In a real app: await deleteDanceItem(selectedItemId);
      setDanceItems(prev => prev.filter(item => item.id !== selectedItemId));
      showNotification('success', 'Dance item deleted successfully');
    } catch (err) {
      console.error('Error deleting dance item:', err);
      showNotification('error', 'Failed to delete dance item. Please try again.');
    } finally {
      setActionInProgress(false);
      setDeleteDialogOpen(false);
      setSelectedItemId(null);
    }
  };

  // Toggle featured status
  const toggleFeatured = async (id: string, featured: boolean) => {
    try {
      // In a real app: await updateDanceItemFeatured(id, !featured);
      setDanceItems(prev => 
        prev.map(item => 
          item.id === id 
            ? { ...item, featured: !featured, updatedAt: Date.now() }
            : item
        )
      );
      showNotification('success', `Item ${!featured ? 'featured' : 'unfeatured'} successfully`);
    } catch (err) {
      console.error('Error updating feature status:', err);
      showNotification('error', 'Failed to update feature status');
    }
  };

  // Format date for display
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center bg-gradient-to-b from-gray-900 to-black">
        <div className="relative">
          {/* Background Noise */}
          <div className="fixed inset-0 bg-noise opacity-[0.015] pointer-events-none" />
          <LoadingIndicator size="large" text="Loading dance portfolio items..." textPosition="bottom" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8 bg-gradient-to-b from-gray-900 to-black">
        {/* Background Noise */}
        <div className="fixed inset-0 bg-noise opacity-[0.015] pointer-events-none" />
        
        <GlassPanel intensity="medium" className="p-8 max-w-2xl mx-auto" gradientBorder>
          <h1 className={`${typography.heading.h1} mb-6 ${colors.text.brand}`}>Error Loading Dance Items</h1>
          <p className={`${typography.body.base} ${colors.text.secondary} mb-8`}>{error}</p>
          <Button 
            onClick={loadDanceItems} 
            leftIcon={<span>↻</span>}
            variant="primary"
            size="large"
          >
            Try Again
          </Button>
        </GlassPanel>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Background Noise */}
      <div className="fixed inset-0 bg-noise opacity-[0.015] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          className="mb-10 overflow-hidden"
        >
          <h1 className={`${typography.heading.display1} mb-3`}>
            <span className="inline-block overflow-hidden">
              <motion.span
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className={`inline-block ${typography.special.gradient} bg-gradient-to-r ${colors.accent.blue} ${shadows.text.lg}`}
              >
                Dance Portfolio
              </motion.span>
            </span>
          </h1>
          <motion.p
            custom={1}
            variants={textRevealVariants}
            initial="hidden"
            animate="visible"
            className={`${typography.body.large} ${colors.text.secondary} max-w-2xl`}
          >
            Manage your dance performances, choreography, and video portfolio.
          </motion.p>
        </motion.div>
        
        {/* Dance Items List */}
        <GlassPanel intensity="medium" className="overflow-hidden mb-10" gradientBorder>
          <div className="p-6 border-b border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className={`${typography.heading.h2} ${colors.text.primary} ${shadows.text.sm}`}>Dance Performances</h2>
            <Button 
              onClick={openAddForm} 
              variant="primary"
              leftIcon={<span>+</span>}
            >
              Add New Performance
            </Button>
          </div>

          {danceItems.length === 0 ? (
            <div className="p-10 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <p className={`${typography.body.large} ${colors.text.secondary} mb-6`}>No dance performances found.</p>
                <Button 
                  onClick={openAddForm} 
                  variant="primary" 
                  leftIcon={<span>+</span>}
                >
                  Add Your First Performance
                </Button>
              </motion.div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <motion.table 
                className="w-full"
                variants={containerAnimation}
                initial="hidden"
                animate="show"
              >
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Choreographer</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Featured</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Last Updated</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {danceItems.map((item) => (
                    <motion.tr 
                      key={item.id}
                      variants={itemAnimation}
                      className="hover:bg-white/5 transition-colors duration-200"
                    >
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className={`${typography.body.base} ${colors.text.primary}`}>
                          {item.title}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className={`${typography.body.small} ${colors.text.secondary}`}>
                          {item.choreographer}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className={`${typography.body.small} ${colors.text.muted}`}>
                          {item.date}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <button 
                          onClick={() => toggleFeatured(item.id, item.featured)}
                          className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                            item.featured 
                              ? 'bg-amber-900/30 text-amber-300 border border-amber-700/30 hover:bg-amber-800/40'
                              : 'bg-gray-800/30 text-gray-300 border border-gray-700/30 hover:bg-gray-700/40'
                          }`}
                        >
                          {item.featured ? 'Featured' : 'Not Featured'}
                        </button>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className={`${typography.body.small} ${colors.text.muted}`}>
                          {formatDate(item.updatedAt)}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="small"
                            variant="outline"
                            onClick={() => openEditForm(item)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            variant="danger"
                            onClick={() => openDeleteDialog(item.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </motion.table>
            </div>
          )}
        </GlassPanel>

        {/* Form Panel (Add/Edit) */}
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mb-10"
          >
            <GlassPanel intensity="medium" gradientBorder>
              <div className="p-6 border-b border-white/10">
                <h2 className={`${typography.heading.h2} ${colors.text.primary}`}>
                  {editingItemId ? 'Edit Dance Performance' : 'Add New Dance Performance'}
                </h2>
              </div>
              <div className="p-6">
                <form>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Title */}
                    <div>
                      <label className={`block ${typography.body.small} ${colors.text.secondary} mb-2`}>
                        Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formValues.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        onBlur={() => handleBlur('title')}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter performance title"
                      />
                      {formErrors.title && (
                        <p className="mt-1 text-sm text-red-400">{formErrors.title}</p>
                      )}
                    </div>
                    
                    {/* Choreographer */}
                    <div>
                      <label className={`block ${typography.body.small} ${colors.text.secondary} mb-2`}>
                        Choreographer *
                      </label>
                      <input
                        type="text"
                        name="choreographer"
                        value={formValues.choreographer}
                        onChange={(e) => handleChange('choreographer', e.target.value)}
                        onBlur={() => handleBlur('choreographer')}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter choreographer name"
                      />
                      {formErrors.choreographer && (
                        <p className="mt-1 text-sm text-red-400">{formErrors.choreographer}</p>
                      )}
                    </div>
                    
                    {/* Performers */}
                    <div>
                      <label className={`block ${typography.body.small} ${colors.text.secondary} mb-2`}>
                        Performers (comma-separated)
                      </label>
                      <input
                        type="text"
                        name="performers"
                        value={formValues.performers}
                        onChange={(e) => handleChange('performers', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter performer names"
                      />
                    </div>
                    
                    {/* Date */}
                    <div>
                      <label htmlFor="performance-date" className={`block ${typography.body.small} ${colors.text.secondary} mb-2`}>
                        Performance Date *
                      </label>
                      <input
                        id="performance-date"
                        type="date"
                        name="date"
                        title="Performance date"
                        value={formValues.date}
                        onChange={(e) => handleChange('date', e.target.value)}
                        onBlur={() => handleBlur('date')}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {formErrors.date && (
                        <p className="mt-1 text-sm text-red-400">{formErrors.date}</p>
                      )}
                    </div>
                    
                    {/* Video URL */}
                    <div>
                      <label className={`block ${typography.body.small} ${colors.text.secondary} mb-2`}>
                        Video URL
                      </label>
                      <input
                        type="url"
                        name="videoUrl"
                        value={formValues.videoUrl}
                        onChange={(e) => handleChange('videoUrl', e.target.value)}
                        onBlur={() => handleBlur('videoUrl')}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter YouTube or Vimeo URL"
                      />
                      {formErrors.videoUrl && (
                        <p className="mt-1 text-sm text-red-400">{formErrors.videoUrl}</p>
                      )}
                    </div>
                    
                    {/* Thumbnail URL */}
                    <div>
                      <label className={`block ${typography.body.small} ${colors.text.secondary} mb-2`}>
                        Thumbnail URL
                      </label>
                      <input
                        type="url"
                        name="thumbnailUrl"
                        value={formValues.thumbnailUrl}
                        onChange={(e) => handleChange('thumbnailUrl', e.target.value)}
                        onBlur={() => handleBlur('thumbnailUrl')}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter thumbnail image URL"
                      />
                      {formErrors.thumbnailUrl && (
                        <p className="mt-1 text-sm text-red-400">{formErrors.thumbnailUrl}</p>
                      )}
                    </div>
                    
                    {/* Tags */}
                    <div>
                      <label className={`block ${typography.body.small} ${colors.text.secondary} mb-2`}>
                        Tags (comma-separated)
                      </label>
                      <input
                        type="text"
                        name="tags"
                        value={formValues.tags}
                        onChange={(e) => handleChange('tags', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="contemporary, jazz, ballet"
                      />
                    </div>
                    
                    {/* Featured */}
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="featured"
                        name="featured"
                        aria-label="Feature this performance"
                        checked={formValues.featured}
                        onChange={(e) => handleChange('featured', e.target.checked)}
                        className="w-5 h-5 rounded border-white/20 bg-white/5 focus:ring-2 focus:ring-blue-500"
                      />
                      <label htmlFor="featured" className={`ml-2 ${typography.body.base} ${colors.text.primary}`}>
                        Feature this performance
                      </label>
                    </div>
                  </div>
                  
                  {/* Description */}
                  <div className="mb-6">
                    <label className={`block ${typography.body.small} ${colors.text.secondary} mb-2`}>
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={formValues.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      onBlur={() => handleBlur('description')}
                      rows={5}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter performance description"
                    ></textarea>
                    {formErrors.description && (
                      <p className="mt-1 text-sm text-red-400">{formErrors.description}</p>
                    )}
                  </div>
                  
                  {/* Form Actions */}
                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsFormOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      // @ts-expect-error - This is a valid usage pattern
                      onClick={() => handleSubmit(onSubmit)()}
                      isLoading={actionInProgress}
                      disabled={actionInProgress}
                    >
                      {editingItemId ? 'Update Performance' : 'Add Performance'}
                    </Button>
                  </div>
                </form>
              </div>
            </GlassPanel>
          </motion.div>
        )}

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <GlassPanel intensity="low" className="p-8" gradientBorder>
            <h3 className={`${typography.heading.h3} ${colors.text.primary} mb-6`}>Dance Portfolio Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/5 rounded-xl p-5 backdrop-blur-sm">
                <div className={`text-4xl font-display font-bold ${typography.special.gradient} bg-gradient-to-r ${colors.accent.blue} ${shadows.text.md}`}>
                  {danceItems.length}
                </div>
                <div className={`${typography.body.small} ${typography.special.upperCase} ${colors.text.secondary} mt-2`}>
                  Total Performances
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-5 backdrop-blur-sm">
                <div className={`text-4xl font-display font-bold ${typography.special.gradient} bg-gradient-to-r ${colors.accent.purple} ${shadows.text.md}`}>
                  {danceItems.filter(item => item.featured).length}
                </div>
                <div className={`${typography.body.small} ${typography.special.upperCase} ${colors.text.secondary} mt-2`}>
                  Featured Items
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-5 backdrop-blur-sm">
                <div className={`text-4xl font-display font-bold ${typography.special.gradient} bg-gradient-to-r ${colors.accent.amber} ${shadows.text.md}`}>
                  {/* Calculate unique choreographers */}
                  {new Set(danceItems.map(item => item.choreographer)).size}
                </div>
                <div className={`${typography.body.small} ${typography.special.upperCase} ${colors.text.secondary} mt-2`}>
                  Choreographers
                </div>
              </div>
            </div>
          </GlassPanel>
        </motion.div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Dance Performance"
        message={`Are you sure you want to delete this performance? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isLoading={actionInProgress}
      />
    </div>
  );
} 