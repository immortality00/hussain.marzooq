# Admin Dashboard Design System

This style guide documents the design tokens, components, and patterns used in the admin dashboard interface. Following these guidelines ensures a consistent, cohesive, and visually stunning user experience.

## 🎨 Color System

### Primary Colors
- Light: `#60a5fa` (blue-400)
- Medium: `#3b82f6` (blue-500)
- Dark: `#2563eb` (blue-600)

### Secondary Colors
- Light: `#c084fc` (purple-400)
- Medium: `#a855f7` (purple-500)
- Dark: `#9333ea` (purple-600)

### Accent Gradients
- Blue: `from-blue-400 to-cyan-400`
- Purple: `from-purple-400 to-pink-400`
- Amber: `from-amber-400 to-orange-400`
- Teal: `from-teal-400 to-cyan-400`

### Text Colors
- Primary: `text-white`
- Secondary: `text-gray-300`
- Muted: `text-gray-400`
- Brand: `text-blue-300`

### Glass Effects
- Border: `border-white/10`
- Light: `bg-white/5`
- Medium: `bg-white/10`
- Dark: `bg-white/15`

### Status Colors
- Success: Green tones
- Error: Red tones
- Warning: Yellow/orange tones
- Info: Blue tones

## 🔤 Typography System

### Font Families
- Headings: Playfair Display (serif) - `font-display`
- Body Text: Inter (sans-serif) - `font-sans`

### Heading Styles
- Display 1: `text-5xl md:text-7xl font-display font-bold tracking-tight leading-none`
- Display 2: `text-4xl md:text-5xl font-display font-bold tracking-tight leading-none`
- H1: `text-3xl font-display font-bold tracking-tight`
- H2: `text-2xl font-display font-bold tracking-tight`
- H3: `text-xl font-display font-bold tracking-tight`

### Body Text Styles
- Large: `text-lg font-sans leading-relaxed tracking-wide`
- Base: `font-sans leading-relaxed tracking-wide`
- Small: `text-sm font-sans tracking-wide`
- Caption: `text-xs font-sans tracking-wider`

### Special Text Effects
- Gradient Text: `bg-clip-text text-transparent`
- Text Shadow: `drop-shadow-[0_1px_3px_rgba(59,130,246,0.5)]`
- Uppercase: `uppercase tracking-wider`

## 👁️ Shadow System

### Element Shadows
- Subtle: `shadow-sm`
- Normal: `shadow`
- Prominent: `shadow-md`
- Elevated: `shadow-lg`

### Text Shadows
- Small: `drop-shadow-[0_1px_2px_rgba(0,0,255,0.3)]`
- Medium: `drop-shadow-[0_2px_4px_rgba(0,0,255,0.3)]`
- Large: `drop-shadow-[0_2px_5px_rgba(0,0,255,0.3)]`

### Glow Effects
- Blue: `shadow-[0_0_15px_rgba(59,130,246,0.5)]`
- Purple: `shadow-[0_0_15px_rgba(168,85,247,0.5)]`
- White: `shadow-[0_0_20px_rgba(255,255,255,0.2)]`

## ✨ Animation System

### Easing Curves
- Smooth: `[0.4, 0, 0.2, 1]` (Tailwind's ease-in-out)
- Soft: `[0.22, 1, 0.36, 1]` (Custom smooth ease)
- Elastic: `[0.68, -0.6, 0.32, 1.6]` (Elastic bounce)
- Spring: `[0.43, 0.13, 0.23, 0.96]` (Natural spring motion)

### Transition Presets
- Default: `{ duration: 0.3, ease: easings.smooth }`
- Fast: `{ duration: 0.2, ease: easings.smooth }`
- Slow: `{ duration: 0.6, ease: easings.soft }`
- Bounce: `{ type: "spring", stiffness: 300, damping: 24 }`
- Elastic: `{ type: "spring", stiffness: 400, damping: 10 }`
- Text: `{ duration: 0.7, ease: easings.soft }`

### Animation Variants
- FadeIn: Simple opacity transition
- FadeInUp: Fade in while moving up
- FadeInDown: Fade in while moving down
- StaggerChildren: Animate children in sequence
- TextReveal: Reveal text with a sweeping mask
- LetterReveal: Animate letters individually
- SlideUp: Slide content up from the bottom

## 🔘 UI Components

### Buttons
- Primary: Gradient background with hover shine effect
- Secondary: Translucent white with hover effect
- Warning: Amber/orange gradient
- All buttons have standard padding, tracking, and rounded corners

### Form Elements
- Inputs & Textareas: Dark translucent backgrounds with focus states
- Labels: Uppercase tracking, proper spacing
- Error/Success messaging

### Glass Panels
- Border Radius: `rounded-2xl`
- Blur Intensities: Low, Medium, High
- Background Opacities: 5%, 10%, 15%

### Icons
- Sizes: Small (16px), Medium (20px), Large (24px)
- Used consistently throughout the interface

### Loading States
- Dots Animation
- Pulse Animation
- Spinner for buttons

## 🔧 Special Features

### Custom Cursor
- Adaptive size based on context
- Grows when hovering interactive elements
- Inner dot provides precise positioning
- Spring animations for natural movement

### Sound System
- Subtle audio feedback for interactions
- Ambient background option
- Mute control in bottom corner
- Hover, click, success, and error sounds

### Performance Considerations
- Use backdrop-filter sparingly
- Avoid heavy blur effects on large areas
- Optimize animations with hardware acceleration
- Ensure images are properly sized and compressed

## 📱 Responsive Design

- Mobile-first approach
- Proper spacing adjustments at breakpoints
- Typography size adaptations
- Layout shifts for different screen sizes

## 🚀 Implementation

Import the design system in components:
```typescript
import { 
  typography, 
  colors, 
  shadows,
  variants, 
  transitions 
} from '@/components/admin/designSystem';
```

For complex components, use the provided animation variants and style tokens to maintain consistency across the interface. 