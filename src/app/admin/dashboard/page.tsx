'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import Link from 'next/link';
import { motion } from 'framer-motion';
import PortfolioManager from '@/components/admin/PortfolioManager';
import CategoryMetadataEditor from '@/components/admin/CategoryMetadataEditor';
import { PortfolioCategory } from '@/types/portfolio';
import GlassPanel from '@/components/ui/GlassPanel';

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
  const [selectedCategory, setSelectedCategory] = useState<PortfolioCategory>('photography');
  const categories: PortfolioCategory[] = ['photography', 'film', 'webdev', 'nfts', 'dance'];

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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white relative">
      {/* Background Noise */}
      <div className="fixed inset-0 bg-noise opacity-[0.015] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          className="mb-12 overflow-hidden"
        >
          <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight leading-none mb-2">
            <span className="inline-block overflow-hidden">
              <motion.span
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-300 text-shadow-lg"
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
            className="text-base md:text-lg text-gray-400 max-w-2xl font-sans mt-4 tracking-wide"
          >
            Curate and manage your creative portfolio with sophisticated controls and real-time updates.
          </motion.p>
        </motion.div>
        
        {/* Navigation Bar */}
        <GlassPanel intensity="medium" className="mb-8">
          <div className="flex justify-between items-center h-16 px-4 sm:px-6">
            <div className="flex items-center">
              <h2 className="font-display text-xl tracking-wide text-white/90 drop-shadow-md">
                <AnimatedHeading text="Portfolio Manager" />
              </h2>
            </div>
            <div className="flex items-center space-x-4">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 rounded-full px-4 py-1 text-sm backdrop-blur-sm"
              >
                {user?.email}
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={logout}
                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Logout
              </motion.button>
            </div>
          </div>
        </GlassPanel>

        {/* Main Content */}
        <main className="space-y-8">
          {/* Welcome Section */}
          <GlassPanel intensity="low" hover={true} tilt={true}>
            <div className="p-6">
              <motion.div className="overflow-hidden">
                <motion.h2 
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="text-3xl font-display font-bold mb-3 tracking-tight text-white drop-shadow-[0_2px_5px_rgba(0,0,255,0.3)]"
                >
                  Welcome back!
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="text-gray-300 font-sans leading-relaxed"
                >
                  Manage your portfolio content from this dashboard.
                </motion.p>
              </motion.div>
            </div>
          </GlassPanel>

          {/* Content Management Grid */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {adminSections.map((section, index) => (
              <motion.div key={section.path} variants={itemVariants} custom={index * 0.1}>
                <Link href={section.path}>
                  <GlassPanel hover={true} tilt={true} className="h-full group">
                    <div className="p-6">
                      <div className="text-3xl mb-4 opacity-75 group-hover:opacity-100 transition-opacity">{section.icon}</div>
                      <motion.h3 
                        initial={{ clipPath: "inset(0 100% 0 0)" }}
                        animate={{ clipPath: "inset(0 0 0 0)" }}
                        transition={{ delay: 0.2 + index * 0.1, duration: 0.6, ease: "easeOut" }}
                        className="text-lg font-display font-bold mb-2 bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent drop-shadow-[0_1px_2px_rgba(0,200,255,0.3)]"
                      >
                        {section.title}
                      </motion.h3>
                      <p className="text-gray-300 text-sm font-sans tracking-wide">{section.description}</p>
                    </div>
                  </GlassPanel>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {/* Quick Stats Section */}
          <GlassPanel intensity="low" className="mt-8">
            <div className="p-6">
              <motion.h3
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-xl font-display font-bold mb-6 tracking-wide text-blue-300 drop-shadow-[0_1px_3px_rgba(59,130,246,0.5)]"
              >
                Quick Stats
              </motion.h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 drop-shadow-[0_2px_4px_rgba(6,182,212,0.3)]">0</div>
                  <div className="text-gray-300 text-sm mt-2 font-sans uppercase tracking-wider">Total Projects</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 drop-shadow-[0_2px_4px_rgba(219,39,119,0.3)]">0</div>
                  <div className="text-gray-300 text-sm mt-2 font-sans uppercase tracking-wider">Total Photos</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-400 drop-shadow-[0_2px_4px_rgba(234,88,12,0.3)]">0</div>
                  <div className="text-gray-300 text-sm mt-2 font-sans uppercase tracking-wider">Total Films</div>
                </div>
              </div>
            </div>
          </GlassPanel>

          {/* Category Selection */}
          <div className="mt-8">
            <motion.h2 
              initial={{ opacity: 0, x: -20 }} 
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-2xl font-display font-bold mb-5 tracking-wide text-blue-300 drop-shadow-[0_1px_3px_rgba(59,130,246,0.5)]"
            >
              Portfolio Management
            </motion.h2>
            <GlassPanel intensity="low" className="p-2">
              <div className="flex flex-wrap gap-2 p-2">
                {categories.map((category, index) => (
                  <motion.button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index, duration: 0.4 }}
                    className={`px-4 py-2 rounded-lg capitalize transition-all duration-300 font-sans tracking-wide ${
                      selectedCategory === category
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                        : 'bg-white/10 text-gray-200 hover:bg-white/20'
                    }`}
                  >
                    {category}
                  </motion.button>
                ))}
              </div>
            </GlassPanel>
          </div>

          {/* Category Metadata Editor */}
          <GlassPanel intensity="medium" className="mt-8 backdrop-blur-md">
            <div className="p-0.5">
              <CategoryMetadataEditor category={selectedCategory} />
            </div>
          </GlassPanel>

          {/* Portfolio Items Manager */}
          <GlassPanel intensity="medium" className="mt-8 backdrop-blur-md">
            <div className="p-0.5">
              <PortfolioManager category={selectedCategory} />
            </div>
          </GlassPanel>
        </main>
      </div>
    </div>
  );
} 