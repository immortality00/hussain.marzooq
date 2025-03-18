# Portfolio Style Guide

This document outlines the standardized design system for our portfolio project, providing guidelines for colors, typography, spacing, animations, and component styling.

## 🎨 Colors

### Primary Colors

The primary colors of our design system are now accessible through CSS variables:

```css
/* Access in CSS */
var(--color-blue-primary)   /* #3b82f6 */
var(--color-purple-primary) /* #8b5cf6 */
var(--color-emerald-primary) /* #10b981 */
var(--color-rose-primary)   /* #f43f5e */
var(--color-cyan-primary)   /* #06b6d4 */
```

These are also available as Tailwind classes:

```html
<div class="text-blue-primary">Blue text</div>
<div class="bg-purple-primary">Purple background</div>
```

### Background Opacities

Standard opacity levels for backgrounds and overlays:

```css
var(--bg-opacity-subtle)  /* 0.05 */
var(--bg-opacity-light)   /* 0.1 */
var(--bg-opacity-medium)  /* 0.2 */
var(--bg-opacity-strong)  /* 0.3 */
```

### Gradients

Standardized gradients are available:

```html
<div class="bg-gradient-blue-purple">Blue to purple gradient</div>
<div class="bg-gradient-cyan-blue">Cyan to blue gradient</div>
<div class="bg-gradient-emerald-cyan">Emerald to cyan gradient</div>
<div class="bg-gradient-rose-purple">Rose to purple gradient</div>
```

## 📝 Typography

We've standardized typography with consistent classes:

```html
<h1 class="heading-1">Main Heading</h1>
<h2 class="heading-2">Section Heading</h2>
<h3 class="heading-3">Subsection Heading</h3>
<h4 class="heading-4">Minor Heading</h4>

<p class="body-large">Larger paragraph text</p>
<p class="body-medium">Standard paragraph text</p>
<p class="body-small">Smaller paragraph or helper text</p>
```

## 📏 Spacing

Standardized spacing variables:

```css
var(--space-xs)   /* 0.25rem (4px) */
var(--space-sm)   /* 0.5rem (8px) */
var(--space-md)   /* 1rem (16px) */
var(--space-lg)   /* 1.5rem (24px) */
var(--space-xl)   /* 2rem (32px) */
var(--space-2xl)  /* 3rem (48px) */
var(--space-3xl)  /* 5rem (80px) */
```

And as Tailwind classes:

```html
<div class="p-md">Medium padding</div>
<div class="m-lg">Large margin</div>
<div class="gap-sm">Small gap</div>
```

Standard section spacing:

```html
<section class="py-section-y px-section-x">
  <!-- Content -->
</section>
```

## 🔳 Containers

Use standardized container classes for consistent content width:

```html
<div class="container-sm">Small container (max-w-4xl)</div>
<div class="container-md">Medium container (max-w-5xl)</div>
<div class="container-lg">Large container (max-w-7xl)</div>
```

## 🪟 Glassmorphic Effects

Standardized glass effect components:

```html
<div class="glass">Standard glass panel</div>
<div class="glass-light">Lighter glass effect</div>
<div class="glass-dark">Darker glass effect</div>

<!-- With specific shape modifiers -->
<div class="glass-card">Card with glass effect</div>
<div class="glass-panel">Panel with glass effect</div>
<button class="glass-button">Button with glass effect</button>
```

Glass effect values:

```css
var(--glass-blur-light)   /* 8px */
var(--glass-blur-medium)  /* 16px */
var(--glass-blur-heavy)   /* 24px */
var(--glass-bg-opacity)   /* 0.1 */
var(--glass-border-opacity) /* 0.2 */
```

## ⏱️ Animations & Transitions

### Animation Durations

```css
var(--duration-fast)      /* 0.2s */
var(--duration-medium)    /* 0.3s */
var(--duration-slow)      /* 0.5s */
var(--duration-extra-slow) /* 0.8s */
```

### Easing Functions

```css
var(--ease-standard)      /* cubic-bezier(0.4, 0, 0.2, 1) */
var(--ease-in-out)        /* cubic-bezier(0.65, 0, 0.35, 1) */
var(--ease-out)           /* cubic-bezier(0.22, 1, 0.36, 1) */
```

### Transition Classes

```html
<div class="transition-standard">Standard transition</div>
<div class="transition-smooth">Smooth transition</div>
<div class="transition-quick">Quick transition</div>
```

### Animation Classes

```html
<div class="animate-fadeIn">Fade in animation</div>
<div class="animate-fadeOut">Fade out animation</div>
<div class="animate-slideIn">Slide in animation</div>
<div class="animate-slideOut">Slide out animation</div>
<div class="animate-fadeInUp">Combined fade and slide animation</div>

<!-- For staggered children animations -->
<div class="stagger-fade-in">
  <div>First child (appears first)</div>
  <div>Second child (appears second)</div>
  <div>Third child (appears third)</div>
</div>
```

## 🧩 Common Component Patterns

### Cards

```html
<div class="glass-card p-card-padding">
  <h3 class="heading-4 mb-sm">Card Title</h3>
  <p class="body-medium">Card content goes here.</p>
</div>
```

### Buttons

```html
<!-- Primary Button -->
<button class="px-md py-sm rounded-full bg-blue-primary text-white hover:bg-opacity-90 transition-standard">
  Primary Button
</button>

<!-- Glass Button -->
<button class="glass-button px-md py-sm">
  Glass Button
</button>
```

### Section Headers

```html
<div class="text-center mb-xl">
  <h2 class="heading-2 bg-clip-text text-transparent bg-gradient-blue-purple mb-sm">
    Section Title
  </h2>
  <p class="body-large max-w-3xl mx-auto">
    Section description text goes here.
  </p>
</div>
```

## 🖌️ Implementation Guidelines

1. **For new components**:
   - Use the standardized classes directly
   - Reference CSS variables for custom styling

2. **For existing components**:
   - Gradually migrate to standardized classes
   - Use the CSS variables for consistency when making updates

3. **When creating new styles**:
   - Check this guide first for existing patterns
   - If creating new styles, follow the established naming conventions
   - Document any new patterns or components

---

This style guide is a living document that will evolve with the project. Always refer to the latest version when developing new features or updating existing ones. 