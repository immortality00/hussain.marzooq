'use client';

import { useState, useEffect } from 'react';
import { useAuthProtection } from '@/lib/hooks/useAuthProtection';
import { Inquiry } from '@/types/contact';
import { getInquiries, updateInquiryStatus, deleteInquiry } from '@/lib/firebase/inquiries';
import { useNotification } from '@/lib/context/NotificationContext';
import LoadingIndicator from '@/components/admin/ui/LoadingIndicator';
import Button from '@/components/admin/ui/Button';
import ConfirmationDialog from '@/components/admin/ui/ConfirmationDialog';
import GlassPanel from '@/components/ui/GlassPanel';
import { motion } from 'framer-motion';
import { typography, colors, shadows } from '@/components/admin/designSystem';

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

export default function InquiriesPage() {
  useAuthProtection(); // Protect the route
  const { showNotification } = useNotification();

  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  useEffect(() => {
    loadInquiries();
  }, []);

  const loadInquiries = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getInquiries();
      setInquiries(data);
    } catch (err) {
      console.error('Error loading inquiries:', err);
      setError('Failed to load inquiries. Please try again later.');
      showNotification('error', 'Failed to load inquiries. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: Inquiry['status']) => {
    try {
      setActionInProgress(id);
      await updateInquiryStatus(id, status);
      setInquiries(prev =>
        prev.map(inquiry =>
          inquiry.id === id
            ? { ...inquiry, status, updatedAt: Date.now() }
            : inquiry
        )
      );
      showNotification('success', `Inquiry status updated to ${status}`);
    } catch (err) {
      console.error('Error updating inquiry:', err);
      showNotification('error', 'Failed to update inquiry status. Please try again.');
    } finally {
      setActionInProgress(null);
    }
  };

  const openDeleteDialog = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedInquiry) return;
    
    try {
      setActionInProgress(selectedInquiry.id);
      await deleteInquiry(selectedInquiry.id);
      setInquiries(prev => prev.filter(inquiry => inquiry.id !== selectedInquiry.id));
      showNotification('success', 'Inquiry deleted successfully');
    } catch (err) {
      console.error('Error deleting inquiry:', err);
      showNotification('error', 'Failed to delete inquiry. Please try again.');
    } finally {
      setActionInProgress(null);
      setDeleteDialogOpen(false);
      setSelectedInquiry(null);
    }
  };

  // Format date for display
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  // Get status badge style
  const getStatusBadge = (status: Inquiry['status']) => {
    switch (status) {
      case 'new':
        return 'bg-blue-900/30 text-blue-300 border border-blue-700/30';
      case 'archived':
        return 'bg-gray-800/30 text-gray-300 border border-gray-700/30';
      case 'deleted':
        return 'bg-red-900/30 text-red-300 border border-red-700/30';
      default:
        return 'bg-gray-800/30 text-gray-300 border border-gray-700/30';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center bg-gradient-to-b from-gray-900 to-black">
        <div className="relative">
          {/* Background Noise */}
          <div className="fixed inset-0 bg-noise opacity-[0.015] pointer-events-none" />
          
          <LoadingIndicator size="large" text="Loading inquiries..." textPosition="bottom" />
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
          <h1 className={`${typography.heading.h1} mb-6 ${colors.text.brand}`}>Error Loading Inquiries</h1>
          <p className={`${typography.body.base} ${colors.text.secondary} mb-8`}>{error}</p>
          <Button 
            onClick={loadInquiries} 
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
                Contact Form Submissions
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
            Manage and respond to inquiries from your website&apos;s contact form.
          </motion.p>
        </motion.div>
        
        <GlassPanel intensity="medium" className="overflow-hidden mb-10" gradientBorder>
          <div className="p-6 border-b border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className={`${typography.heading.h2} ${colors.text.primary} ${shadows.text.sm}`}>Inquiries</h2>
            <Button 
              onClick={loadInquiries} 
              variant="outline"
              leftIcon={<span>↻</span>}
            >
              Refresh List
            </Button>
          </div>

          {inquiries.length === 0 ? (
            <div className="p-10 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <p className={`${typography.body.large} ${colors.text.secondary} mb-6`}>No inquiries found.</p>
                <Button onClick={loadInquiries} variant="primary" leftIcon={<span>↻</span>}>
                  Refresh
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
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Message</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {inquiries.map((inquiry) => (
                    <motion.tr 
                      key={inquiry.id}
                      variants={itemAnimation}
                      className="hover:bg-white/5 transition-colors duration-200"
                    >
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className={`${typography.body.base} ${colors.text.primary}`}>
                          {inquiry.name}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className={`${typography.body.small} ${colors.text.secondary}`}>
                          {inquiry.email}
                        </span>
                      </td>
                      <td className="px-6 py-5 max-w-xs">
                        <p className={`${typography.body.small} ${colors.text.secondary} truncate`}>
                          {inquiry.message}
                        </p>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className={`${typography.body.small} ${colors.text.muted}`}>
                          {formatDate(inquiry.createdAt)}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className={`px-3 py-1.5 text-xs rounded-full ${getStatusBadge(inquiry.status)}`}>
                          {inquiry.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap space-x-2">
                        <div className="flex flex-wrap gap-2">
                          {inquiry.status === 'new' && (
                            <Button
                              size="small"
                              variant="outline"
                              onClick={() => handleStatusUpdate(inquiry.id, 'archived')}
                              isLoading={actionInProgress === inquiry.id}
                              disabled={actionInProgress === inquiry.id}
                            >
                              Archive
                            </Button>
                          )}
                          {inquiry.status === 'archived' && (
                            <Button
                              size="small"
                              variant="outline"
                              onClick={() => handleStatusUpdate(inquiry.id, 'new')}
                              isLoading={actionInProgress === inquiry.id}
                              disabled={actionInProgress === inquiry.id}
                            >
                              Restore
                            </Button>
                          )}
                          <Button
                            size="small"
                            variant="danger"
                            onClick={() => openDeleteDialog(inquiry)}
                            isLoading={actionInProgress === inquiry.id}
                            disabled={actionInProgress === inquiry.id}
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

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <GlassPanel intensity="low" className="p-8" gradientBorder>
            <h3 className={`${typography.heading.h3} ${colors.text.primary} mb-6`}>Inquiry Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/5 rounded-xl p-5 backdrop-blur-sm">
                <div className={`text-4xl font-display font-bold ${typography.special.gradient} bg-gradient-to-r ${colors.accent.blue} ${shadows.text.md}`}>
                  {inquiries.filter(i => i.status === 'new').length}
                </div>
                <div className={`${typography.body.small} ${typography.special.upperCase} ${colors.text.secondary} mt-2`}>
                  New Inquiries
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-5 backdrop-blur-sm">
                <div className={`text-4xl font-display font-bold ${typography.special.gradient} bg-gradient-to-r ${colors.accent.purple} ${shadows.text.md}`}>
                  {inquiries.filter(i => i.status === 'archived').length}
                </div>
                <div className={`${typography.body.small} ${typography.special.upperCase} ${colors.text.secondary} mt-2`}>
                  Archived
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-5 backdrop-blur-sm">
                <div className={`text-4xl font-display font-bold ${typography.special.gradient} bg-gradient-to-r ${colors.accent.amber} ${shadows.text.md}`}>
                  {inquiries.length}
                </div>
                <div className={`${typography.body.small} ${typography.special.upperCase} ${colors.text.secondary} mt-2`}>
                  Total Inquiries
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
        title="Delete Inquiry"
        message={`Are you sure you want to delete this inquiry from ${selectedInquiry?.name}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isLoading={actionInProgress === selectedInquiry?.id}
      />
    </div>
  );
} 