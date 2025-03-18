# Camera Accent Components Usage Guide

This README explains how to incorporate the minimal camera shapes from the logo across your site.

## Overview

We've created a set of SVG files and React components that allow you to add subtle camera-shaped accents to your pages:

1. **SVG Files**: Located in `/public/images/accents/`
   - `camera-outline.svg`: Detailed camera outline with golden gradient
   - `camera-watermark.svg`: Simplified camera silhouette for backgrounds
   - `film-strip.svg`: Decorative film strip with the same golden gradient
   - `swirl-pattern.svg`: Swirl patterns inspired by the logo's decorative element

2. **React Components**: Located in `/src/components/ui/`
   - `BackgroundAccent.tsx`: React component for easily adding accents to any page
   - Two variants: regular (using Next.js Image) and static (using HTML img)

3. **Example Implementations**: Located in `/src/components/examples/`
   - `PhotographyPageExample.tsx`: Example for a full Photography page
   - `SectionBackgroundExample.tsx`: Example for a standalone section
   - `HeroAccentExample.tsx`: Example for a hero section
   - `CardGridAccentsExample.tsx`: Example for a card/grid layout

## Usage Instructions

### 1. Basic Implementation

Add a camera accent to any page or component:

```tsx
import BackgroundAccent from '@/components/ui/BackgroundAccent';

function YourComponent() {
  return (
    <div className="relative">
      {/* Add camera accent */}
      <BackgroundAccent
        type="camera"
        className="top-20 right-10"
        width={200}
        height={150}
        opacity={0.08}
      />
      
      {/* Your content */}
      <div className="relative z-10">
        <h1>Your Content</h1>
      </div>
    </div>
  );
}
```

### 2. Customization Options

The `BackgroundAccent` component accepts these props:

- `type`: 'camera' | 'film' | 'swirl' (required)
- `className`: For positioning with Tailwind classes (optional)
- `opacity`: Number between 0-1 (default: 0.1)
- `width`: Width in pixels (default: 200)
- `height`: Height in pixels (default: 150)
- `rotate`: Rotation in degrees (default: 0)
- `flip`: Boolean to flip horizontally (default: false)

### 3. Positioning Tips

- Always place accents in a parent with `position: relative`
- Use `className` for positioning with Tailwind (e.g., `"top-10 left-20"`)
- Ensure your content has a higher z-index (`z-10` or higher)
- Use low opacity values (0.05-0.1) to keep accents subtle

### 4. Implementation Examples

See the example components for different ways to incorporate the accents:

- Full page example: Check `PhotographyPageExample.tsx`
- Section background: Check `SectionBackgroundExample.tsx`
- Hero section: Check `HeroAccentExample.tsx`
- Card grids: Check `CardGridAccentsExample.tsx`

### 5. Best Practices

- Keep opacity low (0.05-0.1) so accents don't distract from content
- Position accents strategically around important content
- Use complementary accent types (camera for photography, film for video)
- Add subtle rotations for visual interest
- Consider using different sizes for variety

## Using the Static Variant

For more direct control without Next.js Image optimization, use the static variant:

```tsx
import { StaticBackgroundAccent } from '@/components/ui/BackgroundAccent';

function YourComponent() {
  return (
    <div className="relative">
      <StaticBackgroundAccent
        type="camera"
        className="absolute top-10 right-10 w-[200px] h-[150px] opacity-5"
        style={{ transform: 'rotate(-10deg)' }}
      />
      
      {/* Your content */}
    </div>
  );
}
``` 