'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PortfolioCategory } from '@/types/portfolio';
import GlassPanel from '@/components/ui/GlassPanel';
import ConnectionStatus from '@/components/admin/ConnectionStatus';
import { typography, colors } from '@/components/admin/designSystem';
import PageContentTabs from '@/components/admin/PageContentTabs';

// Helper function to check if a string is a valid PortfolioCategory
const getPortfolioCategory = (value: string): value is PortfolioCategory => {
  const categories: PortfolioCategory[] = ['photography', 'film', 'webdev', 'nfts', 'dance'];
  return categories.includes(value as PortfolioCategory);
};

interface AdminSection {
  title: string;
  description: string;
  path: string;
  icon: string;
}

const adminSections: AdminSection[] = [
  {
    title: 'Photography',
    description: 'Manage your photography portfolio',
    path: '/admin/photography',
    icon: '📸',
  },
  {
    title: 'Films',
    description: 'Update your film projects',
    path: '/admin/films',
    icon: '🎬',
  },
  {
    title: 'Web Development',
    description: 'Showcase your web projects',
    path: '/admin/webdev',
    icon: '💻',
  },
  {
    title: 'NFTs',
    description: 'Manage your NFT collections',
    path: '/admin/nfts',
    icon: '🎨',
  },
  {
    title: 'Dance',
    description: 'Update dance performances',
    path: '/admin/dance',
    icon: '💃',
  },
  {
    title: 'Inquiries',
    description: 'Manage contact form submissions',
    path: '/admin/inquiries',
    icon: '📬',
  },
];

// Animation variants for staggered children
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
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

const letterContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.2
    }
  }
};

const letterVariants = {
  hidden: { y: 50, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 40
    }
  }
};

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeView, setActiveView] = useState<'home' | 'content'>('home');

  // For page content tabs - keeping this for the content view
  const [selectedCategory] = useState<PortfolioCategory>('photography');

  // Add debug logging
  useEffect(() => {
    console.log('Dashboard rendered with user:', user?.email);
  }, [user]);

  // Function for letter animation
  const AnimatedHeading = ({ text, className }: { text: string, className?: string }) => (
    <motion.span
      variants={letterContainerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {text.split('').map((char, index) => (
        <motion.span
          key={index}
          variants={letterVariants}
          className="inline-block"
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </motion.span>
  );

  return (
    <div className="min-h-screen admin-dashboard text-white relative">
      {/* Background Noise */}
      <div className="fixed inset-0 bg-noise opacity-[0.015] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          className="mb-10 overflow-hidden"
        >
          <h1 className="admin-heading mb-3">
            <span className="inline-block overflow-hidden">
              <motion.span
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="inline-block"
              >
                Admin Dashboard
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
            Curate and manage your creative portfolio with sophisticated controls and real-time updates.
          </motion.p>
        </motion.div>
        
        {/* Navigation Bar */}
        <GlassPanel 
          intensity="medium" 
          className="mb-10 admin-panel"
          gradientBorder={true}
        >
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 sm:p-6">
            <div className="flex items-center gap-4">
              <h2 className="admin-subheading">
                <AnimatedHeading text="Portfolio Manager" />
              </h2>
              
              {/* View Selection Tabs */}
              <div className="hidden sm:flex gap-4 ml-8">
                <button 
                  onClick={() => setActiveView('home')}
                  className={`admin-tab px-4 py-2 transition-all ${activeView === 'home' 
                    ? `active` 
                    : `${colors.text.secondary} hover:text-white`}`}
                >
                  Dashboard
                </button>
                <button 
                  onClick={() => setActiveView('content')}
                  className={`admin-tab px-4 py-2 transition-all ${activeView === 'content' 
                    ? `active` 
                    : `${colors.text.secondary} hover:text-white`}`}
                >
                  Page Management
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="admin-user-chip rounded-full px-4 py-2 text-sm"
              >
                {user?.email}
              </motion.div>
              <div className="flex items-center gap-3">
                <ConnectionStatus className="mt-0.5" />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={logout}
                  className="admin-button-gold px-5 py-2.5 rounded-lg text-sm font-medium"
                >
                  Logout
                </motion.button>
              </div>
            </div>
          </div>
          
          {/* Mobile View Selection */}
          <div className="flex sm:hidden gap-1 p-2 bg-black/20 border-t border-white/5">
            <button 
              onClick={() => setActiveView('home')}
              className={`admin-tab flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeView === 'home' 
                ? 'active bg-black/20 border border-gold-primary/30' 
                : 'bg-white/5 text-gray-300 border border-transparent'}`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setActiveView('content')}
              className={`admin-tab flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeView === 'content' 
                ? 'active bg-black/20 border border-gold-primary/30' 
                : 'bg-white/5 text-gray-300 border border-transparent'}`}
            >
              Page Management
            </button>
          </div>
        </GlassPanel>

        {/* Main Content */}
        <main className="space-y-10">
          {activeView === 'home' ? (
            <>
              {/* Welcome Section */}
              <GlassPanel 
                intensity="low" 
                hover={true} 
                tilt={true}
                className="admin-panel"
                gradientBorder={true}
              >
                <div className="p-8">
                  <motion.div className="overflow-hidden">
                    <motion.h2 
                      initial={{ y: "100%" }}
                      animate={{ y: 0 }}
                      transition={{ delay: 0.3, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      className="admin-subheading mb-4"
                    >
                      Welcome back!
                    </motion.h2>
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                      className={`${typography.body.base} ${colors.text.secondary} max-w-2xl`}
                    >
                      Manage your portfolio content from this dashboard. Use the sections below to update your creative work across different categories.
                    </motion.p>
                  </motion.div>
                </div>
              </GlassPanel>

              {/* Content Management Grid */}
              <section>
                <motion.h2 
                  initial={{ opacity: 0, x: -20 }} 
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="admin-section-title mb-6"
                >
                  Content Sections
                </motion.h2>
                
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {adminSections.map((section, index) => (
                    <motion.div key={section.path} variants={itemVariants} custom={index * 0.1}>
                      <Link href={section.path}>
                        <GlassPanel hover={true} tilt={true} className="admin-card h-full group">
                          <div className="p-8">
                            <div className="text-4xl mb-5 opacity-75 group-hover:opacity-100 transition-opacity">{section.icon}</div>
                            <motion.h3 
                              initial={{ clipPath: "inset(0 100% 0 0)" }}
                              animate={{ clipPath: "inset(0 0 0 0)" }}
                              transition={{ delay: 0.2 + index * 0.1, duration: 0.6, ease: "easeOut" }}
                              className="admin-section-title text-xl font-bold mb-3"
                            >
                              {section.title}
                            </motion.h3>
                            <p className={`${typography.body.small} ${colors.text.secondary}`}>{section.description}</p>
                          </div>
                        </GlassPanel>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              </section>

              {/* Quick Stats Section */}
              <section>
                <motion.h2
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="admin-section-title mb-6"
                >
                  Quick Stats
                </motion.h2>
                
                <GlassPanel intensity="low" className="admin-panel-gold" gradientBorder={true}>
                  <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm">
                        <div className="admin-stat-value">0</div>
                        <div className={`${typography.body.small} ${typography.special.upperCase} ${colors.text.secondary} mt-3`}>Total Projects</div>
                      </div>
                      <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm">
                        <div className="admin-stat-value">0</div>
                        <div className={`${typography.body.small} ${typography.special.upperCase} ${colors.text.secondary} mt-3`}>Total Photos</div>
                      </div>
                      <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm">
                        <div className="admin-stat-value">0</div>
                        <div className={`${typography.body.small} ${typography.special.upperCase} ${colors.text.secondary} mt-3`}>Total Films</div>
                      </div>
                    </div>
                  </div>
                </GlassPanel>
              </section>
            </>
          ) : (
            /* Page Content Management with Tabs */
            <section>
              <motion.h2 
                initial={{ opacity: 0, x: -20 }} 
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="admin-section-title mb-6"
              >
                Page Content Management
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`${typography.body.base} ${colors.text.secondary} max-w-2xl mb-8`}
              >
                Use the tabs below to edit content for each page of your portfolio website. Changes will be reflected on the public-facing site.
              </motion.p>
              
              <PageContentTabs defaultTab={getPortfolioCategory(selectedCategory) ? selectedCategory : 'home'} />
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 text-center"
              >
                <Link href="/admin/inquiries" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors">
                  <span>📬</span>
                  <span className="underline">Go to Inquiries Management</span>
                </Link>
              </motion.div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
} 