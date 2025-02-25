import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import PortfolioMasonry from '@/components/portfolio/PortfolioMasonry';
import AboutTimeline from '@/components/sections/AboutTimeline';
import ParallaxBackground from '@/components/effects/ParallaxBackground';

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
    gradient: 'from-blue-500 to-purple-500',
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
    gradient: 'from-purple-500 to-pink-500',
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
    gradient: 'from-cyan-500 to-blue-500',
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
    gradient: 'from-emerald-500 to-teal-500',
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
    gradient: 'from-rose-500 to-orange-500',
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isInView, setIsInView] = useState(false);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, -100]);

  useEffect(() => {
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

  const scrollToPortfolio = () => {
    const portfolioSection = document.getElementById('portfolio');
    if (portfolioSection) {
      portfolioSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!isClient) return null;

  return (
    <>
      {/* Hero Section */}
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
            <Image
              src={slides[currentSlide].image}
              alt={slides[currentSlide].alt}
              fill
              className="object-cover"
              priority={true}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
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
                currentSlide === index ? 'w-8 bg-white' : 'bg-white/50'
              }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.8 }}
            />
          ))}
        </div>

        {/* Navigation Arrows */}
        <motion.button
          className="absolute left-4 z-20 text-white/50 hover:text-white p-2"
          onClick={() => paginate(-1)}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.8 }}
        >
          ←
        </motion.button>
        <motion.button
          className="absolute right-4 z-20 text-white/50 hover:text-white p-2"
          onClick={() => paginate(1)}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.8 }}
        >
          →
        </motion.button>

        {/* Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative z-10 max-w-4xl mx-auto px-4 text-center"
        >
          {/* Glassmorphic Panel */}
          <motion.div
            className="backdrop-blur-md bg-white/10 p-8 md:p-12 rounded-2xl shadow-2xl border border-white/20"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <motion.h1
              variants={itemVariants}
              className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-200 to-purple-200 text-shadow-lg animate-text-reveal"
            >
              Hussain Marzooq
            </motion.h1>
            
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
                className="font-display font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 text-shadow"
              >
                {slides[currentSlide].category}
              </motion.span>
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col md:flex-row gap-4 justify-center items-center"
            >
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)" }}
                whileTap={{ scale: 0.95 }}
                onClick={scrollToPortfolio}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 rounded-full text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
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
                  className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-blue-500"
                  initial={{ x: "100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
              
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
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-3 bg-white/50 rounded-full mt-2"
            />
          </motion.div>
        </motion.div>
      </ParallaxBackground>

      {/* About Section */}
      <ParallaxBackground
        intensity={0.2}
        className="relative bg-black"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-4 text-shadow animate-mask-reveal">
              My Journey
            </h2>
            <p className="font-sans text-gray-400 text-lg max-w-3xl mx-auto animate-fade-in">
              Exploring the intersection of art, technology, and creativity through various mediums and disciplines.
            </p>
          </motion.div>

          <AboutTimeline />
        </div>
      </ParallaxBackground>

      {/* Services Section */}
      <ParallaxBackground
        intensity={0.15}
        className="py-20 bg-gradient-to-b from-gray-900 to-black relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-4 text-shadow animate-mask-reveal">
              Services & Expertise
            </h2>
            <p className="font-sans text-gray-400 text-lg animate-fade-in">
              Explore my diverse range of creative services
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <motion.div
                  whileHover={{ 
                    scale: 1.02,
                    rotateY: 5,
                    translateZ: 20
                  }}
                  className="group relative backdrop-blur-lg bg-white/5 rounded-2xl p-6 h-full border border-white/10 overflow-hidden"
                  style={{
                    transformStyle: 'preserve-3d',
                    perspective: '1000px'
                  }}
                >
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <span className="text-4xl mb-4 block">{service.icon}</span>
                    <h3 className="font-display text-2xl font-bold text-white mb-2 text-shadow-sm">{service.title}</h3>
                    <p className="font-sans text-gray-400 mb-4">{service.description}</p>
                    
                    {/* Details that appear on hover */}
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="overflow-hidden"
                    >
                      <ul className="space-y-2 text-sm text-gray-300">
                        {service.details.map((detail, i) => (
                          <motion.li
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-center"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 mr-2" />
                            {detail}
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </ParallaxBackground>

      {/* Portfolio Section */}
      <ParallaxBackground
        intensity={0.1}
        className="py-20 bg-black relative"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-4 text-shadow animate-mask-reveal">
              Featured Work
            </h2>
            <p className="font-sans text-gray-400 text-lg mb-8 animate-fade-in">
              Browse through my latest projects and creations
            </p>

            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {['all', ...services.map(s => s.id)].map((category) => (
                <motion.button
                  key={category}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2 rounded-full backdrop-blur-md transition-all duration-300 ${
                    selectedCategory === category
                      ? 'bg-white/20 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Portfolio Grid */}
          <motion.div
            layout
            className="relative z-10"
          >
            <PortfolioMasonry selectedCategory={selectedCategory} />
          </motion.div>
        </div>

        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 to-black/50 backdrop-blur-[100px]" />
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent" />
        </div>
      </ParallaxBackground>
    </>
  );
}
