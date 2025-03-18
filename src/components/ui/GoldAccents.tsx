import React from 'react';

interface GoldHeadingProps {
  children: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span';
  className?: string;
  withAccent?: boolean;
  shimmer?: boolean;
}

// Heading with gold shimmer effect
export const GoldHeading: React.FC<GoldHeadingProps> = ({
  children,
  as = 'h2',
  className = '',
  withAccent = false,
  shimmer = false,
}) => {
  const Component = as;
  
  return (
    <div className={`relative ${withAccent ? 'gold-accent-line' : ''}`}>
      <Component className={`${shimmer ? 'gold-shimmer' : ''} ${className}`}>
        {children}
      </Component>
    </div>
  );
};

interface GoldDividerProps {
  width?: string;
  className?: string;
}

// Decorative gold divider
export const GoldDivider: React.FC<GoldDividerProps> = ({
  width = 'w-24',
  className = '',
}) => (
  <div className={`gold-divider mx-auto ${width} ${className}`}></div>
);

interface CameraBackdropProps {
  position?: 'top-right' | 'bottom-left' | 'center';
  opacity?: string;
  size?: string;
  className?: string;
}

// Camera icon watermark - using CSS classes instead of inline SVGs
export const CameraBackdrop: React.FC<CameraBackdropProps> = ({
  position = 'top-right',
  opacity = 'opacity-[0.03]',
  size = 'w-48 h-48',
  className = '',
}) => {
  const positionClasses = {
    'top-right': 'top-10 right-10',
    'bottom-left': 'bottom-10 left-10',
    'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
  };

  return (
    <div 
      className={`absolute ${positionClasses[position]} ${opacity} ${size} ${className} ${position === 'top-right' ? 'camera-top-right' : position === 'bottom-left' ? 'camera-bottom-left' : 'camera-center'}`} 
      aria-hidden="true"
    ></div>
  );
};

interface GoldOverlayProps {
  children: React.ReactNode;
  className?: string;
  intensity?: 'light' | 'medium' | 'strong';
}

// Gold-tinted overlay
export const GoldOverlay: React.FC<GoldOverlayProps> = ({
  children,
  className = '',
  intensity = 'light'
}) => {
  const intensityClasses = {
    light: 'bg-gradient-to-b from-black/30 to-black/70 backdrop-blur-sm',
    medium: 'bg-gradient-to-b from-black/50 to-black/80 backdrop-blur-md',
    strong: 'bg-gradient-to-b from-black/70 to-black/90 backdrop-blur-lg'
  };

  return (
    <div className="relative overflow-hidden">
      {children}
      <div className={`absolute inset-0 ${intensityClasses[intensity]} ${className}`}>
        <div className="absolute inset-0 bg-[#d4af37] opacity-[0.03] mix-blend-overlay"></div>
      </div>
    </div>
  );
};

interface GlowContainerProps {
  children: React.ReactNode;
  className?: string;
  glowOpacity?: string;
  glowColor?: string;
}

// Container with subtle gold glow
export const GlowContainer: React.FC<GlowContainerProps> = ({
  children,
  className = '',
  glowOpacity = 'opacity-[0.07]',
  glowColor = 'bg-[#d4af37]'
}) => (
  <div className={`relative ${className}`}>
    <div className={`absolute -inset-[50px] ${glowColor} ${glowOpacity} blur-[100px] rounded-full z-0`}></div>
    <div className="relative z-10">{children}</div>
  </div>
); 