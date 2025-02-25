'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import GlassPanel from '@/components/ui/GlassPanel';
import IconSystem from '@/components/ui/IconSystem';
import SparkleWrapper from '@/components/ui/Sparkle';

interface NavigationProps {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
}

const navLinks = [
  { href: '/', label: 'Home', type: 'home' },
  { href: '/about', label: 'About', type: 'about' },
  { href: '/photography', label: 'Photography', type: 'photography' },
  { href: '/film', label: 'Film', type: 'film' },
  { href: '/webdev', label: 'Web Dev', type: 'webdev' },
  { href: '/nfts', label: 'NFTs', type: 'nfts' },
  { href: '/dance', label: 'Dance', type: 'dance' },
  { href: '/contact', label: 'Contact', type: 'contact' },
] as const;

export default function Navigation({ menuOpen, setMenuOpen }: NavigationProps) {
  const pathname = usePathname();

  return (
    <GlassPanel
      intensity="low"
      className="sticky top-0 z-50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <nav className="relative flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <SparkleWrapper>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-shrink-0"
          >
            <Link href="/" className="font-display text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 text-shadow-sm">
              Hussain Marzooq
            </Link>
          </motion.div>
        </SparkleWrapper>

        {/* Desktop Navigation */}
        <div className="hidden md:block">
          <ul className="flex space-x-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <motion.li
                  key={link.href}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <SparkleWrapper active={isActive}>
                    <Link
                      href={link.href}
                      className={`relative font-sans px-4 py-2 transition-colors duration-200 ${
                        pathname === link.href
                          ? 'text-white font-medium'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <motion.span
                        className="relative z-10 inline-flex items-center gap-2"
                        whileHover={{ y: -2 }}
                        whileTap={{ y: 0 }}
                      >
                        <IconSystem type={link.type} size={16} />
                        {link.label}
                      </motion.span>
                      {pathname === link.href && (
                        <motion.div
                          layoutId="navbar-indicator"
                          className="absolute inset-0 rounded-lg bg-white/10 backdrop-blur-sm"
                          transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                        />
                      )}
                    </Link>
                  </SparkleWrapper>
                </motion.li>
              );
            })}
          </ul>
        </div>

        {/* Mobile Menu Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden relative p-2 rounded-lg text-gray-300 hover:text-white"
        >
          <span className="sr-only">Open main menu</span>
          <div className="relative">
            <motion.span
              animate={menuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
              className="absolute block w-5 h-0.5 bg-current transition-transform"
            />
            <motion.span
              animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
              className="absolute block w-5 h-0.5 bg-current transition-opacity"
              style={{ top: '8px' }}
            />
            <motion.span
              animate={menuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
              className="absolute block w-5 h-0.5 bg-current transition-transform"
              style={{ top: '16px' }}
            />
          </div>
        </motion.button>

        {/* Mobile Menu */}
        <motion.div
          className="absolute top-full left-0 right-0 md:hidden"
          initial={false}
          animate={menuOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {menuOpen && (
            <GlassPanel intensity="medium" className="mt-2 mx-4 p-4">
              <ul className="space-y-2">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <motion.li
                      key={link.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                    >
                      <SparkleWrapper active={isActive}>
                        <Link
                          href={link.href}
                          className={`flex items-center space-x-2 p-3 rounded-lg ${
                            isActive
                              ? 'bg-white/10 text-white'
                              : 'text-gray-300 hover:bg-white/5 hover:text-white'
                          }`}
                          onClick={() => setMenuOpen(false)}
                        >
                          <IconSystem type={link.type} size={20} className="text-current" />
                          <span>{link.label}</span>
                        </Link>
                      </SparkleWrapper>
                    </motion.li>
                  );
                })}
              </ul>
            </GlassPanel>
          )}
        </motion.div>
      </nav>
    </GlassPanel>
  );
} 