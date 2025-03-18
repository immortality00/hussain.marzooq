'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import PortfolioMasonry from '@/components/portfolio/PortfolioMasonry';
import ParallaxBackground from '@/components/effects/ParallaxBackground';
import EnhancedHero, { GlassmorphicPanel, AnimatedText } from '@/components/layout/hero/EnhancedHero';

const slides = [
  {
    id: 1,
    image: '/images/hero/photography.jpg',
    alt: 'Photography Portfolio',
    category: 'Photography'
  },
  {
    id: 2,
    image: '/images/hero/film.jpg',
    alt: 'Film Projects',
    category: 'Film'
  },
  {
    id: 3,
    image: '/images/hero/webdev.jpg',
    alt: 'Web Development',
    category: 'Web Development'
  },
  {
    id: 4,
    image: '/images/hero/dance.jpg',
    alt: 'Dance Performance',
    category: 'Dance'
  },
  {
    id: 5,
    image: '/images/hero/nft.jpg',
    alt: 'NFT Collection',
    category: 'NFTs'
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.2
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.5
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: [0.6, -0.05, 0.01, 0.99]
    }
  }
};

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0
  })
};

const services = [
  {
    id: 'photography',
    title: 'Photography',
    description: 'Capturing moments through the lens with artistic vision and technical precision.',
    icon: '📸',
    gradient: 'from-gold-500 to-orange-500',
    details: [
      'Portrait Photography',
      'Event Coverage',
      'Commercial Shoots',
      'Fine Art Photography'
    ]
  },
  {
    id: 'film',
    title: 'Film',
    description: 'Creating compelling visual narratives through cinematic storytelling.',
    icon: '🎬',
    gradient: 'from-gold-400 to-orange-600',
    details: [
      'Short Films',
      'Music Videos',
      'Documentary',
      'Commercial Videos'
    ]
  },
  {
    id: 'webdev',
    title: 'Web Development',
    description: 'Building modern, responsive websites with cutting-edge technologies.',
    icon: '💻',
    gradient: 'from-gold-300 to-gold-600',
    details: [
      'Full-Stack Development',
      'React Applications',
      'E-commerce Solutions',
      'Custom Web Apps'
    ]
  },
  {
    id: 'nfts',
    title: 'NFTs',
    description: 'Exploring digital art and blockchain technology through unique collections.',
    icon: '🎨',
    gradient: 'from-gold-500 to-amber-500',
    details: [
      'Digital Art Collections',
      'Blockchain Integration',
      'Smart Contracts',
      'NFT Marketplaces'
    ]
  },
  {
    id: 'dance',
    title: 'Dance',
    description: 'Expressing creativity through movement and choreography.',
    icon: '💃',
    gradient: 'from-orange-400 to-gold-500',
    details: [
      'Contemporary Dance',
      'Choreography',
      'Performance Art',
      'Dance Education'
    ]
  }
];

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  useEffect(() => {
    setCurrentSlide(0);
    setDirection(0);
    setIsClient(true);
    
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentSlide((prev) => (prev + newDirection + slides.length) % slides.length);
  };
  
  // Helper function to map category display names to URL paths
  const getCategoryPath = (category: string): string => {
    const categoryMap: Record<string, string> = {
      'Photography': 'photography',
      'Film': 'film',
      'Web Development': 'webdev',
      'Dance': 'dance',
      'NFTs': 'nfts'
    };
    
    return categoryMap[category] || category.toLowerCase().replace(/\s+/g, '');
  };

  if (!isClient) {
    return <div className="min-h-screen bg-black" />;
  }

  return (
    <>
      {/* Hero Section */}
      <EnhancedHero key="home-hero">
        <ParallaxBackground
          intensity={0.3}
          backgroundImage={slides[currentSlide].image}
          className="min-h-screen flex items-center justify-center"
        >
          {/* Background Slideshow */}
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentSlide}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              className="absolute inset-0"
            >
              <Link 
                href={`/${getCategoryPath(slides[currentSlide].category)}`}
                className="block absolute inset-0 cursor-pointer z-0"
                aria-label={`View ${slides[currentSlide].category} portfolio`}
              >
                {/* Add fallback for missing images */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black" />
                
                <Image
                  src={slides[currentSlide].image}
                  alt={slides[currentSlide].alt}
                  fill
                  sizes="100vw"
                  className="object-cover"
                  priority={true}
                  onError={(e) => {
                    // Hide the image if it fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70 gold-overlay-light" />
              </Link>
            </motion.div>
          </AnimatePresence>

          {/* Slide Navigation */}
          <div className="absolute z-20 bottom-32 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {slides.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => {
                  const newDirection = index > currentSlide ? 1 : -1;
                  paginate(newDirection);
                }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  currentSlide === index ? 'w-8 bg-gold-500' : 'bg-gold-500/50'
                }`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.8 }}
              />
            ))}
          </div>

          {/* Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative z-10 max-w-4xl mx-auto px-4 text-center"
          >
            {/* Replace the existing panel with our new GlassmorphicPanel */}
            <GlassmorphicPanel className="p-8 md:p-12 rounded-2xl shadow-2xl">
              <AnimatedText animation="fade" delay={1}>
                <motion.h1 
                  variants={itemVariants} 
                  className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gold-200 via-gold-400 to-orange-300 text-shadow-lg animate-text-reveal"
                >
                  Hussain Marzooq
                </motion.h1>
              </AnimatedText>
              
              <AnimatedText animation="fade" delay={2}>
                <motion.p 
                  variants={itemVariants} 
                  className="font-sans text-xl md:text-2xl lg:text-3xl text-gray-200 mb-8 font-light"
                >
                  Crafting Digital Experiences Through{" "}
                  <motion.span
                    key={slides[currentSlide].category}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="font-display font-semibold bg-clip-text text-transparent bg-gradient-to-r from-gold-400 to-orange-400 text-shadow"
                  >
                    {slides[currentSlide].category}
                  </motion.span>
                </motion.p>
              </AnimatedText>

              <AnimatedText animation="fade" delay={3}>
                <motion.div
                  variants={itemVariants}
                  className="flex flex-col md:flex-row gap-4 justify-center items-center"
                >
                  <Link href={`/${getCategoryPath(slides[currentSlide].category)}`}>
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(212, 175, 55, 0.5)" }}
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-3 bg-gradient-to-r from-gold-500 via-gold-600 to-orange-600 rounded-full text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
                    >
                      <motion.span className="relative z-10">
                        Discover My Art
                        <motion.span
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="inline-block ml-2"
                        >
                          →
                        </motion.span>
                      </motion.span>
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-orange-600 via-gold-600 to-gold-500"
                        initial={{ x: "100%" }}
                        whileHover={{ x: 0 }}
                        transition={{ duration: 0.3 }}
                      />
                    </motion.button>
                  </Link>
                  
                  <Link href="/contact">
                    <motion.button
                      whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.2)" }}
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-3 bg-white/10 backdrop-blur-sm rounded-full text-white font-semibold border border-white/20 transition-all duration-300"
                    >
                      Get in Touch
                    </motion.button>
                  </Link>
                </motion.div>
              </AnimatedText>
            </GlassmorphicPanel>
          </motion.div>
        </ParallaxBackground>
      </EnhancedHero>

      {/* Services Section */}
      <section id="services" className="py-12 md:py-24 px-4 md:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 md:mb-16">
            <motion.h2 
              className="text-2xl md:text-4xl font-bold mb-2 md:mb-4 gold-text-gradient font-display"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Services & Expertise
            </motion.h2>
            <motion.p 
              className="text-lg text-gray-300 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Explore my range of creative services across different mediums.
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                className="relative overflow-hidden rounded-xl bg-white/5 border border-white/10 hover:border-gold-500/50 transition-all duration-500 group h-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.3 }}
                whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(212, 175, 55, 0.2)' }}
              >
                {/* Glowing card accent on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                
                <div className="relative z-10 p-5 md:p-6 flex flex-col h-full min-h-[320px]">
                  <div className="flex-none">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-3xl md:text-4xl">{service.icon}</span>
                      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-gold-400 to-orange-500 flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-200">{service.title}</h3>
                    <p className="text-sm md:text-base text-gray-300 mb-4">{service.description}</p>
                  </div>
                  
                  <div className="flex-grow">
                    <ul className="space-y-2">
                      {service.details.map((detail, i) => (
                        <li key={i} className="flex items-center text-sm md:text-base text-gray-400">
                          <span className="mr-2 text-gold-500">•</span>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-white/10">
                    {/* Desktop button */}
                    <Link 
                      href={`/${service.id}`} 
                      className="w-full block relative z-30 hidden md:block"
                    >
                      <div className="py-3 px-4 bg-gradient-to-r from-gold-500 via-gold-600 to-orange-600 rounded-lg text-white font-medium shadow-lg hover:shadow-gold-500/30 hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2">
                        <span>Explore {service.title}</span>
                        <span className="text-sm">→</span>
                      </div>
                    </Link>
                    
                    {/* Mobile button - optimized for touch */}
                    <Link
                      href={`/${service.id}`}
                      className="w-full block mt-2 md:hidden"
                    >
                      <div className="py-3 px-4 bg-gradient-to-r from-gold-500 via-gold-600 to-orange-600 rounded-lg text-white font-medium shadow-lg flex items-center justify-center gap-2 min-h-[44px]">
                        <span>Explore</span>
                        <span className="text-sm">→</span>
                      </div>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Work Section */}
      <section id="portfolio" className="py-12 md:py-24 px-4 md:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-8 md:mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4 gold-text-gradient font-display">Featured Work</h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              A curated selection of my projects across different mediums.
            </p>
          </motion.div>
          
          {/* Category Tabs */}
          <div className="mb-8 flex flex-wrap justify-center gap-2 md:gap-4">
            {['all', 'photography', 'film', 'webdev', 'nfts', 'dance'].map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 md:px-5 md:py-2.5 rounded-full capitalize font-medium text-sm md:text-base min-h-[44px] min-w-[44px] ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-gold-500 to-orange-600 text-white gold-tab-active'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/10 transition-colors'
                }`}
              >
                {category === 'nfts' ? 'NFTs' : category === 'all' ? 'All Work' : category}
              </button>
            ))}
          </div>
          
          <PortfolioMasonry selectedCategory={selectedCategory} />
        </div>
      </section>
    </>
  );
}
