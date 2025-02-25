import { motion } from 'framer-motion';

type IconType = 'photography' | 'film' | 'webdev' | 'nfts' | 'dance' | 'contact' | 'home' | 'about';

interface IconProps {
  type: IconType;
  size?: number;
  className?: string;
  animate?: boolean;
}

const iconPaths = {
  photography: {
    path: `M20 4h-3.17L15 2H9L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h4.05l1.83-2h4.24l1.83 2H20v12zM12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 8c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3z`,
    viewBox: '0 0 24 24',
  },
  film: {
    path: `M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4zm-6.75 11.25L10 18l-1.25-2.75L6 14l2.75-1.25L10 10l1.25 2.75L14 14l-2.75 1.25zm5.69-3.31L16 14l-.94-2.06L13 11l2.06-.94L16 8l.94 2.06L19 11l-2.06.94z`,
    viewBox: '0 0 24 24',
  },
  webdev: {
    path: `M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-4.18 11.65L14.3 16.7c-.19.19-.51.19-.7 0l-1.27-1.27-3.27 3.27c-.19.19-.51.19-.7 0-.19-.19-.19-.51 0-.7l3.27-3.27L10.7 13.7c-.19-.19-.19-.51 0-.7.19-.19.51-.19.7 0l1.27 1.27 1.42-1.42-1.27-1.27c-.19-.19-.19-.51 0-.7.19-.19.51-.19.7 0l1.27 1.27 1.42-1.42-1.27-1.27c-.19-.19-.19-.51 0-.7.19-.19.51-.19.7 0l1.27 1.27.7-.7c.19-.19.51-.19.7 0 .19.19.19.51 0 .7l-3.42 3.42z`,
    viewBox: '0 0 24 24',
  },
  nfts: {
    path: `M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7zm3.5-13.5l-2.12 2.12L12 6.24l-1.38 1.38-2.12-2.12-1.06 1.06 2.12 2.12L8.24 10l1.38 1.38-2.12 2.12 1.06 1.06 2.12-2.12L12 13.76l1.38-1.38 2.12 2.12 1.06-1.06-2.12-2.12L15.76 10l-1.38-1.38 2.12-2.12z`,
    viewBox: '0 0 24 24',
  },
  dance: {
    path: `M12 4c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm5 7v4.17l2 2V11c0-1.1-.9-2-2-2h-3V7.25L12 8.5l-2-1.25V9H7c-1.1 0-2 .9-2 2v8h2v-7h1v7h2v-4h1v4h2v-4h1v4h2v-7h1v7h2v-8c0-1.1-.9-2-2-2h-3V7.25L12 8.5l-2-1.25V9H7c-1.1 0-2 .9-2 2v8h2v-7h1v7h2v-4h1v4h2v-4h1v4h2v-7h1v7h2v-8c0-1.1-.9-2-2-2h-3z`,
    viewBox: '0 0 24 24',
  },
  contact: {
    path: `M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8l8 5 8-5v10zm-8-7L4 6h16l-8 5z`,
    viewBox: '0 0 24 24',
  },
  home: {
    path: `M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z`,
    viewBox: '0 0 24 24',
  },
  about: {
    path: `M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-11h2v2h-2zm0 4h2v6h-2z`,
    viewBox: '0 0 24 24',
  },
};

const pathVariants = {
  hidden: {
    pathLength: 0,
    opacity: 0,
  },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { type: "spring", duration: 1.5, bounce: 0 },
      opacity: { duration: 0.2 },
    },
  },
};

export default function IconSystem({ type, size = 24, className = '', animate = true }: IconProps) {
  const icon = iconPaths[type];

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox={icon.viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      whileHover={animate ? { scale: 1.1 } : undefined}
      whileTap={animate ? { scale: 0.95 } : undefined}
    >
      <motion.path
        d={icon.path}
        variants={pathVariants}
        initial="hidden"
        animate="visible"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </motion.svg>
  );
} 