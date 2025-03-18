'use client';

import { motion } from 'framer-motion';
import { useRef } from 'react';
import ParallaxBackground from '../effects/ParallaxBackground';

interface Milestone {
  id: number;
  year: string;
  title: string;
  description: string;
  image?: string;
  icon?: string;
}

// Sample milestone data - replace with your actual milestones
const milestones: Milestone[] = [
  {
    id: 1,
    year: '2016',
    title: 'Started Photography Journey',
    description: 'Began exploring photography as a medium of creative expression, focusing on urban landscapes and portrait photography.',
    icon: '📸',
  },
  {
    id: 2,
    year: '2018',
    title: 'First Exhibition',
    description: 'Showcased my work at a local gallery, featuring a collection of street photography from around the world.',
    icon: '🖼️',
  },
  {
    id: 3,
    year: '2019',
    title: 'Explored Filmmaking',
    description: 'Ventured into the world of cinema, creating short films that explore themes of identity and culture.',
    icon: '🎬',
  },
  {
    id: 4,
    year: '2020',
    title: 'Web Development Focus',
    description: 'Deepened my technical skills by learning full-stack development, creating interactive web experiences that merge art and technology.',
    icon: '💻',
  },
  {
    id: 5,
    year: '2021',
    title: 'NFT Collection Launch',
    description: 'Released my first digital art collection as NFTs, exploring the intersection of traditional art and blockchain technology.',
    icon: '🎨',
  },
  {
    id: 6,
    year: '2022',
    title: 'Dance Performance Series',
    description: 'Combined my visual arts background with movement, creating a multimedia dance performance that toured multiple venues.',
    icon: '💃',
  },
  {
    id: 7,
    year: '2023',
    title: 'Portfolio Website Launch',
    description: 'Created a comprehensive digital portfolio to showcase my diverse body of work across multiple creative disciplines.',
    icon: '🚀',
  }
];

export default function AboutMilestones() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <ParallaxBackground
      intensity={0.1}
      className="py-24 bg-gradient-to-b from-gray-900 to-black"
      mode="3d"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gold-400 to-orange-400 mb-4 text-shadow animate-mask-reveal">
            My Journey
          </h2>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto">
            Key milestones that have shaped my creative path and professional development
          </p>
        </motion.div>

        <div ref={containerRef} className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gold-500/20 via-orange-500/20 to-gold-500/20" />

          {/* Milestones */}
          <div className="space-y-12 relative">
            {milestones.map((milestone, index) => {
              const isEven = index % 2 === 0;
              
              return (
                <motion.div
                  key={milestone.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ 
                    duration: 0.7, 
                    delay: index * 0.1,
                    ease: [0.43, 0.13, 0.23, 0.96] 
                  }}
                  className={`flex flex-col md:flex-row items-start relative ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                >
                  {/* Year circle marker */}
                  <div className="absolute left-0 md:left-1/2 z-10 flex items-center justify-center">
                    <motion.div
                      className="w-8 h-8 rounded-full bg-gradient-to-r from-gold-500 to-orange-500 flex items-center justify-center -ml-4 md:ml-0 md:-translate-x-1/2"
                      whileInView={{ 
                        scale: [0, 1.5, 1],
                        boxShadow: ["0 0 0 0 rgba(255, 196, 0, 0)", "0 0 0 10px rgba(255, 196, 0, 0.3)", "0 0 0 0 rgba(255, 196, 0, 0)"]
                      }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 1 }}
                    >
                      <span className="text-xs font-bold text-white">{milestone.year}</span>
                    </motion.div>
                  </div>

                  {/* Content */}
                  <div className={`pl-12 md:pl-0 ${isEven ? 'md:pr-16 md:text-right' : 'md:pl-16'} md:w-1/2`}>
                    <div className="group bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:border-gold-500/30 transition-all duration-300 gold-glass-hover">
                      <div className="flex items-center mb-2">
                        <span className="text-2xl mr-2">{milestone.icon}</span>
                        <h3 className="text-xl font-bold text-gold-400">{milestone.title}</h3>
                      </div>
                      <p className="text-gray-300">{milestone.description}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </ParallaxBackground>
  );
} 