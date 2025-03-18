'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import ParallaxBackground from '../effects/ParallaxBackground';

export default function AboutBio() {
  return (
    <ParallaxBackground
      intensity={0.1}
      className="py-20 bg-black"
      mode="3d"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          {/* Image Section */}
          <motion.div 
            className="w-full md:w-1/2"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative aspect-square w-full max-w-md mx-auto overflow-hidden rounded-2xl shadow-2xl">
              <Image
                src="/images/about/profile.jpg"
                alt="Profile"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 gold-overlay-light" />
              
              {/* Floating badge */}
              <motion.div
                className="absolute bottom-6 right-6 bg-black/40 backdrop-blur-md rounded-full px-4 py-2 border border-gold-500/30 gold-glass"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <span className="text-gold-200 font-medium">Multi-disciplinary Artist</span>
              </motion.div>
            </div>
          </motion.div>

          {/* Bio Content */}
          <motion.div 
            className="w-full md:w-1/2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gold-400 to-orange-400 mb-6 text-shadow">
              About Me
            </h1>
            
            <div className="space-y-4 text-gray-300">
              <p>
                I&apos;m a creative professional with a passion for exploring the intersections between visual arts, technology, and storytelling. With over 8 years of experience across multiple disciplines, I bring a unique perspective to each project.
              </p>
              
              <p>
                My journey began with photography, where I developed a keen eye for composition and lighting. This visual sensibility has informed my work in film, where I focus on creating immersive narratives that resonate with audiences on an emotional level.
              </p>
              
              <p>
                In recent years, I&apos;ve expanded my practice to include web development and digital art, allowing me to create interactive experiences that blend traditional artistry with cutting-edge technology.
              </p>
              
              <div className="pt-6">
                <motion.div 
                  className="inline-flex gap-4 flex-wrap"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  {['Photography', 'Filmmaking', 'Web Development', 'Digital Art', 'Dance'].map((skill, index) => (
                    <span 
                      key={index} 
                      className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white/90"
                    >
                      {skill}
                    </span>
                  ))}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Gallery Section */}
        <motion.div 
          className="mt-20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Featured Work</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <motion.div
                key={item}
                className="relative aspect-[4/3] rounded-xl overflow-hidden group"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <Image
                  src={`/images/about/gallery-${item}.jpg`}
                  alt={`Gallery image ${item}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </ParallaxBackground>
  );
} 