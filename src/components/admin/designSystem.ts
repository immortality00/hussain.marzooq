// Design system for admin dashboard

// Color System
export const colors = {
  primary: {
    light: '#60a5fa', // blue-400
    medium: '#3b82f6', // blue-500
    dark: '#2563eb', // blue-600
  },
  secondary: {
    light: '#c084fc', // purple-400
    medium: '#a855f7', // purple-500
    dark: '#9333ea', // purple-600
  },
  gold: {
    light: '#f2d675', // gold-light
    medium: '#d4af37', // gold-primary
    dark: '#aa8c2c', // gold-dark
  },
  orange: {
    light: '#fdba74', // orange-300
    medium: '#e67e22', // orange-accent
    dark: '#c2410c', // orange-700
  },
  accent: {
    blue: 'from-blue-400 to-cyan-400',
    purple: 'from-purple-400 to-pink-400',
    amber: 'from-amber-400 to-orange-400',
    teal: 'from-teal-400 to-cyan-400',
    gold: 'from-[#d4af37] to-[#e67e22]',
    goldLight: 'from-[#f2d675] to-[#d4af37]',
  },
  text: {
    primary: 'text-white',
    secondary: 'text-gray-300',
    muted: 'text-gray-400',
    brand: 'text-blue-300',
    gold: 'text-[#d4af37]',
    goldLight: 'text-[#f2d675]',
  },
  glass: {
    border: 'border-white/10',
    light: 'bg-white/5',
    medium: 'bg-white/10',
    dark: 'bg-white/15',
    goldBorder: 'border-[#d4af37]/20',
    goldBackground: 'bg-[#d4af37]/5',
  },
  status: {
    success: {
      bg: 'bg-green-900/20',
      border: 'border-green-700/30',
      text: 'text-green-400',
      icon: 'text-green-500',
    },
    error: {
      bg: 'bg-red-900/20',
      border: 'border-red-700/30',
      text: 'text-red-400',
      icon: 'text-red-500',
    },
    warning: {
      bg: 'bg-yellow-900/20',
      border: 'border-yellow-700/30',
      text: 'text-yellow-400',
      icon: 'text-yellow-500',
    },
    info: {
      bg: 'bg-blue-900/20',
      border: 'border-blue-700/30',
      text: 'text-blue-400',
      icon: 'text-blue-500',
    },
  },
};

// Typography System
export const typography = {
  heading: {
    display1: "text-5xl md:text-7xl font-display font-bold tracking-tight leading-none",
    display2: "text-4xl md:text-5xl font-display font-bold tracking-tight leading-none",
    h1: "text-3xl font-display font-bold tracking-tight",
    h2: "text-2xl font-display font-bold tracking-tight",
    h3: "text-xl font-display font-bold tracking-tight",
    script1: "text-5xl md:text-7xl font-script font-bold tracking-tight leading-none",
    script2: "text-4xl md:text-5xl font-script font-bold tracking-tight leading-none",
    script3: "text-3xl font-script font-bold tracking-tight",
  },
  body: {
    large: "text-lg font-sans leading-relaxed tracking-wide",
    base: "font-sans leading-relaxed tracking-wide",
    small: "text-sm font-sans tracking-wide",
    caption: "text-xs font-sans tracking-wider",
  },
  special: {
    gradient: "bg-clip-text text-transparent",
    shadow: "drop-shadow-[0_1px_3px_rgba(59,130,246,0.5)]",
    upperCase: "uppercase tracking-wider",
    goldShadow: "drop-shadow-[0_1px_3px_rgba(212,175,55,0.5)]",
  },
};

// Shadow System
export const shadows = {
  subtle: "shadow-sm",
  normal: "shadow",
  prominent: "shadow-md",
  elevated: "shadow-lg",
  text: {
    sm: "drop-shadow-[0_1px_2px_rgba(0,0,255,0.3)]",
    md: "drop-shadow-[0_2px_4px_rgba(0,0,255,0.3)]",
    lg: "drop-shadow-[0_2px_5px_rgba(0,0,255,0.3)]",
    goldSm: "drop-shadow-[0_1px_2px_rgba(212,175,55,0.3)]",
    goldMd: "drop-shadow-[0_2px_4px_rgba(212,175,55,0.3)]",
    goldLg: "drop-shadow-[0_2px_5px_rgba(212,175,55,0.3)]",
  },
  glow: {
    blue: "shadow-[0_0_15px_rgba(59,130,246,0.5)]",
    purple: "shadow-[0_0_15px_rgba(168,85,247,0.5)]",
    white: "shadow-[0_0_20px_rgba(255,255,255,0.2)]",
    gold: "shadow-[0_0_15px_rgba(212,175,55,0.5)]",
    orange: "shadow-[0_0_15px_rgba(230,126,34,0.5)]",
  },
};

// Animation System
export const easings = {
  smooth: [0.4, 0, 0.2, 1], // Tailwind's ease-in-out
  soft: [0.22, 1, 0.36, 1], // Custom smooth ease
  elastic: [0.68, -0.6, 0.32, 1.6], // Elastic bounce
  spring: [0.43, 0.13, 0.23, 0.96], // Natural spring motion
};

export const transitions = {
  default: { duration: 0.3, ease: easings.smooth },
  fast: { duration: 0.2, ease: easings.smooth },
  slow: { duration: 0.6, ease: easings.soft },
  bounce: { type: "spring", stiffness: 300, damping: 24 },
  elastic: { type: "spring", stiffness: 400, damping: 10 },
  text: { duration: 0.7, ease: easings.soft },
};

// Animation Variants
export const variants = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: transitions.default },
  },
  fadeInUp: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: transitions.default },
  },
  fadeInDown: {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: transitions.default },
  },
  staggerChildren: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  },
  textReveal: {
    hidden: { 
      clipPath: "inset(0 100% 0 0)",
      opacity: 0,
    },
    visible: {
      clipPath: "inset(0 0% 0 0)",
      opacity: 1,
      transition: transitions.text,
    },
  },
  letterReveal: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.2,
      },
    },
  },
  letter: {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40,
      },
    },
  },
  slideUp: {
    hidden: { y: "100%" },
    visible: { 
      y: 0,
      transition: transitions.text,
    },
  },
};

// Button styles
export const buttons = {
  primary: `
    relative overflow-hidden px-6 py-3 
    bg-gradient-to-r from-blue-500 to-purple-600 
    text-white font-medium tracking-wide rounded-lg 
    shadow-lg transition-all duration-300
  `,
  secondary: `
    relative overflow-hidden px-6 py-3 
    bg-white/10 hover:bg-white/15 
    text-white font-medium tracking-wide rounded-lg 
    transition-all duration-300
  `,
  warning: `
    relative overflow-hidden px-6 py-3 
    bg-gradient-to-r from-amber-500 to-orange-600 
    text-white font-medium tracking-wide rounded-lg 
    shadow-lg transition-all duration-300
  `,
  gold: `
    relative overflow-hidden px-6 py-3 
    bg-gradient-to-r from-[#d4af37] to-[#e67e22] 
    text-white font-medium tracking-wide rounded-lg 
    shadow-lg transition-all duration-300
  `,
  goldOutline: `
    relative overflow-hidden px-6 py-3 
    bg-transparent border border-[#d4af37] 
    text-[#d4af37] hover:text-white hover:bg-[#d4af37]/20
    font-medium tracking-wide rounded-lg 
    transition-all duration-300
  `,
  buttonShineFX: {
    className: "absolute inset-0 bg-white/20",
    initial: { x: '-100%' },
    whileHover: { x: '100%' },
    transition: { duration: 0.6 },
  }
};

// Form element styles
export const forms = {
  input: `
    w-full p-3 bg-white/5 border border-gray-600 
    focus:border-blue-400 rounded-lg text-white 
    shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 
    font-sans tracking-wide transition-colors duration-200
  `,
  textarea: `
    w-full p-3 bg-white/5 border border-gray-600 
    focus:border-blue-400 rounded-lg text-white 
    shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 
    font-sans leading-relaxed tracking-wide transition-colors duration-200
  `,
  label: `
    block text-sm font-medium text-gray-300 mb-2 tracking-wide
  `,
};

// Glass panel presets
export const glassPanel = {
  borderRadius: "rounded-2xl",
  blurIntensity: {
    low: "backdrop-blur-sm",
    medium: "backdrop-blur-lg",
    high: "backdrop-blur-xl",
  },
  bgOpacity: {
    low: "bg-white/5",
    medium: "bg-white/10",
    high: "bg-white/15",
  },
};

// Icon system
export const icons = {
  size: {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  },
};

// Loading animations
export const loadingAnimations = {
  dots: {
    container: "flex items-center space-x-1",
    dot: {
      animate: { opacity: [0, 1, 0] },
      transition: (i: number) => ({ 
        times: [0, 0.5, 1], 
        duration: 1.5, 
        repeat: Infinity, 
        delay: 0.2 * i 
      }),
    },
  },
  pulse: {
    animate: { 
      scale: [1, 1.1, 1],
      opacity: [0.7, 1, 0.7], 
    },
    transition: { 
      duration: 1.5, 
      repeat: Infinity,
      ease: "easeInOut" 
    },
  },
  spin: `
    animate-spin -ml-1 mr-3 
    text-white
  `,
};

// Reusable component animations
export const componentAnimations = {
  card: {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 },
  },
  section: {
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    viewport: { once: true },
    transition: { duration: 0.7, delay: 0.2 },
  },
};

// Export all design tokens
export const designSystem = {
  colors,
  typography,
  shadows,
  easings,
  transitions,
  variants,
  buttons,
  forms,
  glassPanel,
  icons,
  loadingAnimations,
  componentAnimations,
}; 