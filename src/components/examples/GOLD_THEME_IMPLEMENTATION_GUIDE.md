# Gold Theme Implementation Guide

This guide explains how to implement the gold-themed enhancements across your portfolio site to create an elegant aesthetic that harmonizes with your gold/orange logo.

## Setup Instructions

1. **CSS Files**: The gold theme consists of several CSS files:
   - `src/styles/goldGlass.css` - Glassmorphic panels with gold accents
   - `src/styles/goldInteractive.css` - Interactive elements like links and buttons
   - `src/styles/goldBackgrounds.css` - Background effects and patterns
   - `src/styles/goldAnimations.css` - Animation effects and keyframes
   - `src/styles/goldTheme.css` - Main import file with CSS variables

2. **React Components**:
   - `src/components/ui/AnimatedElements.tsx` - Animation components 
   - `src/components/ui/GoldAccents.tsx` - Gold-themed UI components

3. **Example Implementations**:
   - `src/components/examples/GoldHeroExample.tsx` - Hero section
   - `src/components/examples/GoldPortfolioGridExample.tsx` - Portfolio grid
   - `src/components/examples/GoldContactFormExample.tsx` - Contact form

## Adding the Gold Theme to Your Project

1. Import the main goldTheme CSS in your layout file:

```tsx
// In src/app/layout.tsx
import '../styles/goldTheme.css';
```

## Glassmorphic Panels

Use these classes to create elegant glass-like panels with gold accents:

```jsx
// Basic glass panel
<div className="gold-glass p-6 rounded-xl">
  Panel with gold border
</div>

// Card-style glass panel with hover effects
<div className="gold-glass-card p-4">
  Card with gold accents and hover effects
</div>

// Light glass panel (lighter background)
<div className="gold-glass-light p-6 rounded-xl">
  Lighter glass panel
</div>

// Add border accent
<div className="gold-glass gold-accent-border p-6 rounded-xl">
  Panel with gold border accents
</div>

// Add top border accent
<div className="gold-glass gold-accent-top p-6 rounded-xl">
  Panel with gold top accent
</div>

// Add hover glow effect
<div className="gold-glass-card gold-accent-glow p-4">
  Card with hover glow effect
</div>
```

## Interactive Elements

```jsx
// Gold link with hover effect
<a href="/page" className="gold-link">Link Text</a>

// Gold-styled input
<input className="gold-input px-4 py-2 rounded-lg" placeholder="Enter text" />

// Gold-styled select
<select className="gold-input gold-select px-4 py-2 rounded-lg">
  <option>Option 1</option>
</select>

// Image with hover zoom effect
<div className="gold-image">
  <img src="/image.jpg" alt="Description" />
</div>

// Gold divider
<div className="gold-divider w-24 mx-auto my-8"></div>
```

## Background Effects

```jsx
// Gold gradient background
<section className="gold-gradient-bg py-12">
  Content
</section>

// Add subtle noise texture
<section className="gold-gradient-bg gold-noise py-12">
  Content with noise texture
</section>

// Add dot pattern
<div className="gold-dots py-12">
  Content with dot pattern
</div>

// Add gold rays
<div className="gold-rays py-12">
  Content with subtle gold rays
</div>

// Add gold section gradient
<section className="gold-section py-12">
  Content with subtle gold gradient
</section>

// Add camera backdrop
<div className="gold-camera-bg py-12">
  Content with camera icon background
</div>
```

## Animation Effects

```jsx
// Gold text shimmer effect
<span className="gold-shimmer">Shimmer Text</span>

// Subtle pulse effect
<button className="admin-button-gold gold-pulse">
  Pulsing Button
</button>

// Gentle float animation
<div className="gold-float">
  Floating Element
</div>

// Border glow animation
<div className="gold-border-glow p-4">
  Content with glowing border
</div>
```

## React Animation Components

```jsx
// Fade up animation
<FadeUp delay={0.2}>
  <p>Content that fades up into view</p>
</FadeUp>

// Fade in animation
<FadeIn delay={0.3}>
  <img src="/image.jpg" alt="Image" />
</FadeIn>

// Staggered animations (for lists/grids)
<StaggerContainer>
  {items.map(item => (
    <StaggerItem key={item.id}>
      <div>Item content</div>
    </StaggerItem>
  ))}
</StaggerContainer>

// Text reveal animation
<TextReveal>
  <h2>Heading with reveal animation</h2>
</TextReveal>

// Scale in animation
<ScaleIn delay={0.2}>
  <div>Content scales into view</div>
</ScaleIn>

// Lazy loaded image
<LazyImage
  src="/high-quality.jpg"
  lowQualitySrc="/low-quality.jpg"
  alt="Description"
  className="w-full h-auto"
/>
```

## Gold UI Components

```jsx
// Gold Heading
<GoldHeading 
  as="h2" 
  className="text-3xl font-bold mb-4"
  withAccent
  shimmer
>
  Heading Text
</GoldHeading>

// Gold Divider
<GoldDivider width="w-32" className="my-8" />

// Camera Backdrop
<CameraBackdrop 
  position="top-right" 
  opacity="opacity-[0.03]" 
  size="w-64 h-64" 
/>

// Gold Overlay
<GoldOverlay intensity="medium">
  <img src="/image.jpg" alt="Image with overlay" />
</GoldOverlay>

// Glow Container
<GlowContainer glowOpacity="opacity-[0.05]">
  <div>Content with subtle gold glow</div>
</GlowContainer>
```

## Best Practices

1. **Performance Considerations**:
   - Use animations sparingly and strategically (headers, hero sections, CTAs)
   - Keep glassmorphic effects to focal points (not the entire page)
   - For image grids, use the `LazyImage` component with low-quality placeholders
   - The code respects `prefers-reduced-motion` for accessibility

2. **Selective Implementation**:
   - Apply gold accents to important UI elements (not everywhere)
   - Use the gold theme in these key areas:
     - Hero sections
     - Section headers
     - Call-to-action buttons
     - Portfolio cards
     - Contact form
     - Footer

3. **Enhancing Readability**:
   - Maintain good contrast for text
   - Don't use gold shimmer on long text passages
   - Use `gold-glass` for UI containers to separate content from backgrounds

4. **Responsive Considerations**:
   - The gold theme works across all screen sizes
   - Animation components are optimized for viewport visibility
   - Glass effects work well on both mobile and desktop

## Integration Examples

See the example components in the `src/components/examples` directory for full implementation examples:

1. `GoldHeroExample.tsx` - Hero section with glassmorphic panel and animations
2. `GoldPortfolioGridExample.tsx` - Portfolio grid with card hover effects
3. `GoldContactFormExample.tsx` - Contact form with gold-styled inputs

## CSS Variables

The gold theme defines CSS variables that you can use directly:

```css
/* Examples */
.custom-element {
  color: var(--gold-primary);
  background: var(--gold-gradient);
  box-shadow: var(--gold-shadow-md);
}
```

Available variables include colors, gradients, shadows, and blur values.

---

By selectively applying these gold theme enhancements, your site will maintain an elegant, cohesive design that harmonizes with your gold/orange logo while ensuring excellent performance and readability. 