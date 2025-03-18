import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface SparkleProps {
  color?: string;
  size?: number;
  style?: React.CSSProperties;
}

interface Sparkle {
  id: string;
  createdAt: number;
  color: string;
  size: number;
  style: {
    top: string;
    left: string;
    zIndex: number;
  };
}

function generateSparkle(color: string) {
  return {
    id: String(Math.random()),
    createdAt: Date.now(),
    color,
    size: Math.random() * 10 + 5,
    style: {
      top: Math.random() * 100 + '%',
      left: Math.random() * 100 + '%',
      zIndex: 2,
    },
  };
}

function Sparkle({ color = '#d4af37', size = 20, style = {} }: SparkleProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      style={style}
      className="absolute pointer-events-none"
      initial={{ scale: 0, rotate: 0 }}
      animate={{
        scale: [0, 1, 0],
        rotate: [0, 90, 180],
      }}
      transition={{
        duration: 0.8,
        ease: "easeInOut",
        times: [0, 0.5, 1],
      }}
    >
      <path
        d="M80 0C80 0 84.2846 41.2925 101.496 58.504C118.707 75.7154 160 80 160 80C160 80 118.707 84.2846 101.496 101.496C84.2846 118.707 80 160 80 160C80 160 75.7154 118.707 58.504 101.496C41.2925 84.2846 0 80 0 80C0 80 41.2925 75.7154 58.504 58.504C75.7154 41.2925 80 0 80 0Z"
        fill={color}
      />
    </motion.svg>
  );
}

function SparkleGroup() {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  useEffect(() => {
    const generateSparkles = () => {
      const colors = ['#d4af37', '#f2d675', '#e67e22'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const newSparkle = generateSparkle(randomColor);
      setSparkles(sparkles => [...sparkles, newSparkle]);
    };

    const interval = setInterval(generateSparkles, 100);
    setTimeout(() => clearInterval(interval), 500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const now = Date.now();
    const cleanup = () => {
      setSparkles(sparkles => sparkles.filter(spark => now - spark.createdAt < 800));
    };
    const cleanupInterval = setInterval(cleanup, 100);
    return () => clearInterval(cleanupInterval);
  }, []);

  return (
    <>
      {sparkles.map(sparkle => (
        <Sparkle
          key={sparkle.id}
          color={sparkle.color}
          size={sparkle.size}
          style={sparkle.style}
        />
      ))}
    </>
  );
}

interface SparkleWrapperProps {
  children: React.ReactNode;
  active?: boolean;
}

export default function SparkleWrapper({ children, active = false }: SparkleWrapperProps) {
  const [isActive, setIsActive] = useState(active);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsActive(true)}
      onMouseLeave={() => setIsActive(false)}
      onClick={() => setIsActive(true)}
    >
      {isActive && <SparkleGroup />}
      {children}
    </div>
  );
} 