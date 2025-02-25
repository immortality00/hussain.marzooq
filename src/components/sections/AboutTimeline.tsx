import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';

interface Milestone {
  id: number;
  year: string;
  title: string;
  description: string;
  category: 'photography' | 'film' | 'webdev' | 'nfts' | 'dance';
  image: string;
  achievement: string;
}

const milestones: Milestone[] = [
  {
    id: 1,
    year: '2018',
    title: 'First Photography Exhibition',
    description: 'Showcased urban landscape photography at the Dubai Art Gallery.',
    category: 'photography',
    image: '/images/milestones/photo-exhibition.jpg',
    achievement: 'Featured Artist Award'
  },
  {
    id: 2,
    year: '2019',
    title: 'Short Film Festival Success',
    description: 'Directed and produced an award-winning short film exploring cultural identity.',
    category: 'film',
    image: '/images/milestones/film-festival.jpg',
    achievement: 'Best Short Film Nominee'
  },
  {
    id: 3,
    year: '2020',
    title: 'Web Development Journey',
    description: 'Launched multiple full-stack applications using modern technologies.',
    category: 'webdev',
    image: '/images/milestones/web-projects.jpg',
    achievement: 'Tech Innovation Award'
  },
  {
    id: 4,
    year: '2021',
    title: 'NFT Collection Launch',
    description: 'Released a successful collection of digital art on the blockchain.',
    category: 'nfts',
    image: '/images/milestones/nft-collection.jpg',
    achievement: 'Top Seller Status'
  },
  {
    id: 5,
    year: '2022',
    title: 'Dance Performance Series',
    description: 'Choreographed and performed in a contemporary dance series.',
    category: 'dance',
    image: '/images/milestones/dance-performance.jpg',
    achievement: 'Outstanding Choreography'
  }
];

const categoryColors = {
  photography: 'from-blue-500 to-purple-500',
  film: 'from-purple-500 to-pink-500',
  webdev: 'from-cyan-500 to-blue-500',
  nfts: 'from-emerald-500 to-teal-500',
  dance: 'from-rose-500 to-orange-500'
};

export default function AboutTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  return (
    <div ref={containerRef} className="relative py-20">
      {/* Timeline Line */}
      <motion.div
        className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent"
        style={{
          scaleY: scrollYProgress
        }}
      />

      {/* Milestones */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {milestones.map((milestone, index) => {
          const isEven = index % 2 === 0;
          
          return (
            <motion.div
              key={milestone.id}
              initial={{ opacity: 0, x: isEven ? -50 : 50, y: 20 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }}
              className={`flex items-center mb-24 ${isEven ? 'flex-row' : 'flex-row-reverse'}`}
            >
              {/* Year Marker */}
              <motion.div
                className="absolute left-1/2 w-8 h-8 -ml-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center"
                whileInView={{ scale: [0, 1.2, 1] }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <span className="text-sm font-bold text-white">{milestone.year}</span>
              </motion.div>

              {/* Content Card */}
              <motion.div
                className={`w-5/12 ${isEven ? 'pr-16 text-right' : 'pl-16 text-left'}`}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative group">
                  {/* Glassmorphic Card */}
                  <motion.div
                    className="backdrop-blur-lg bg-white/5 rounded-2xl p-6 border border-white/10 overflow-hidden"
                    whileHover={{ y: -5 }}
                  >
                    {/* Background Gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${categoryColors[milestone.category]} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

                    {/* Content */}
                    <div className="relative z-10">
                      <h3 className="text-2xl font-bold text-white mb-2">{milestone.title}</h3>
                      <p className="text-gray-300 mb-4">{milestone.description}</p>
                      
                      {/* Achievement Badge */}
                      <motion.div
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium backdrop-blur-md bg-white/10"
                        whileHover={{ scale: 1.05 }}
                      >
                        <span className="mr-2">🏆</span>
                        {milestone.achievement}
                      </motion.div>
                    </div>

                    {/* Category Tag */}
                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md bg-white/10">
                      {milestone.category.charAt(0).toUpperCase() + milestone.category.slice(1)}
                    </div>
                  </motion.div>

                  {/* Connection Line */}
                  <div
                    className={`absolute top-1/2 ${
                      isEven ? 'right-0 translate-x-full' : 'left-0 -translate-x-full'
                    } w-12 h-px bg-gradient-to-${isEven ? 'r' : 'l'} from-white/20 to-transparent`}
                  />
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black" />
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent" />
      </div>
    </div>
  );
} 