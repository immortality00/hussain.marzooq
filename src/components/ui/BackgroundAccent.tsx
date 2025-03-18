import Image from 'next/image';
import { cn } from '@/lib/utils';

type AccentType = 'camera' | 'film' | 'swirl';

interface BackgroundAccentProps {
  type: AccentType;
  className?: string;
  opacity?: number;
  width?: number;
  height?: number;
  rotate?: number;
  flip?: boolean;
}

/**
 * BackgroundAccent Component
 * 
 * A component that renders subtle background accents like camera outlines,
 * film strips, or decorative swirls that match the site's logo aesthetic.
 */
export default function BackgroundAccent({
  type,
  className = '',
  opacity = 0.1,
  width = 200,
  height = 150,
  rotate = 0,
  flip = false,
}: BackgroundAccentProps) {
  const getAccentSource = (accentType: AccentType): string => {
    switch (accentType) {
      case 'camera':
        return '/images/accents/camera-watermark.svg';
      case 'film':
        return '/images/accents/film-strip.svg';
      case 'swirl':
        return '/images/accents/swirl-pattern.svg';
      default:
        return '/images/accents/camera-watermark.svg';
    }
  };

  return (
    <div
      className={cn('absolute pointer-events-none z-0', className)}
      style={{
        opacity,
        transform: `rotate(${rotate}deg) scaleX(${flip ? -1 : 1})`,
      }}
    >
      <div className="relative" style={{ width, height }}>
        <Image
          src={getAccentSource(type)}
          alt=""
          fill
          sizes={`${Math.max(width, height)}px`}
          className="object-contain"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

/**
 * Static variant used for more direct control over HTML structure
 */
export function StaticBackgroundAccent({
  type,
  className = '',
  style = {},
}: {
  type: AccentType;
  className?: string;
  style?: React.CSSProperties;
}) {
  const getAccentSource = (accentType: AccentType): string => {
    switch (accentType) {
      case 'camera':
        return '/images/accents/camera-watermark.svg';
      case 'film':
        return '/images/accents/film-strip.svg';
      case 'swirl':
        return '/images/accents/swirl-pattern.svg';
      default:
        return '/images/accents/camera-watermark.svg';
    }
  };

  return (
    <img
      src={getAccentSource(type)}
      alt=""
      className={cn('absolute pointer-events-none z-0', className)}
      style={style}
      aria-hidden="true"
    />
  );
} 