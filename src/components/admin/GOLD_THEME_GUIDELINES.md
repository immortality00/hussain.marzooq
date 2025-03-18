# Gold Theme Guidelines for New Components

## Color Palette

Use these color values consistently across all new components:

- **Primary Gold**: `#d4af37` (tailwind: `gold-500`)
- **Light Gold**: `#f2d675` (tailwind: `gold-200`)
- **Dark Gold**: `#aa8c2c` (tailwind: `gold-600`)
- **Accent Orange**: `#e67e22` (tailwind: `orange-500`)
- **Light Orange**: `#fdba74` (tailwind: `orange-300`)

## Gradients

Standard gradients to use throughout the application:

```css
/* Primary gold gradient */
background: linear-gradient(to right, #d4af37, #e67e22);

/* Light gold gradient */
background: linear-gradient(to right, #f2d675, #d4af37);

/* Gold to orange gradient */
background: linear-gradient(to right, #d4af37, #e67e22);

/* Orange to gold gradient (reversed) */
background: linear-gradient(to right, #e67e22, #d4af37);
```

In Tailwind classes:

```html
<!-- Primary gold gradient -->
<div class="bg-gradient-to-r from-gold-500 to-orange-500"></div>

<!-- Light gold gradient -->
<div class="bg-gradient-to-r from-gold-200 to-gold-500"></div>

<!-- Gold to orange gradient -->
<div class="bg-gradient-to-r from-gold-500 to-orange-500"></div>

<!-- Orange to gold gradient (reversed) -->
<div class="bg-gradient-to-r from-orange-500 to-gold-500"></div>
```

## Text Styling

For special headings with gold gradient text:

```html
<h1 class="font-bold bg-clip-text text-transparent bg-gradient-to-r from-gold-400 to-orange-400">
  Gold Gradient Heading
</h1>
```

## Interactive Elements

Apply these gold-themed styles to interactive elements:

### Buttons

```html
<!-- Primary gold button -->
<button class="px-4 py-2 bg-gradient-to-r from-gold-500 to-orange-500 text-white rounded-md hover:shadow-lg hover:shadow-gold-500/20 transition-all duration-300">
  Gold Button
</button>

<!-- Secondary gold button (outlined) -->
<button class="px-4 py-2 border border-gold-500 text-gold-500 rounded-md hover:bg-gold-500/10 transition-all duration-300">
  Gold Outlined Button
</button>
```

### Animated Elements

Use the gold animation classes from `goldAnimations.css`:

```html
<!-- Shimmer effect -->
<div class="gold-shimmer">Content with shimmer</div>

<!-- Border pulse effect -->
<div class="gold-border-pulse">Content with pulsing border</div>

<!-- Hover glow effect -->
<div class="gold-hover-glow">Content with hover glow</div>

<!-- 3D button effect -->
<button class="gold-button-3d">3D Button</button>

<!-- Particle effect on hover -->
<div class="gold-particles">Particle effect</div>
```

## Glassmorphic Elements

For glass-like panels and overlays:

```html
<!-- Basic gold glass panel -->
<div class="gold-glass p-6 rounded-lg">
  Content
</div>

<!-- Gold glass with accent border -->
<div class="gold-glass gold-accent-border p-6 rounded-lg">
  Content with accent border
</div>

<!-- Gold overlay (light) -->
<div class="gold-overlay-light">
  Content with light gold overlay
</div>
```

## Hover Effects

Consistent hover effects for interactive elements:

```html
<!-- Gold glass hover effect -->
<div class="gold-glass-hover">
  Hover for gold glass effect
</div>

<!-- Gold border hover effect -->
<div class="hover:border-gold-500/30">
  Hover for gold border
</div>
```

## Responsive Design Considerations

- Ensure that gold accents remain visible on mobile devices
- Consider using lighter gold shades on smaller screens for better visibility
- Maintain consistent padding and spacing for gold-themed components across devices

## Accessibility Guidelines

- Ensure sufficient contrast between gold text and background colors
- For gold gradient text, provide adequate text size (minimum 16px for body text)
- Include hover/focus states that meet accessibility standards
- Consider alternative styling for users with color vision deficiencies

## Component Categories

Category-specific gold gradient recommendations:

- **Photography**: `from-gold-500 to-orange-500`
- **Film**: `from-orange-500 to-amber-500`
- **Web Dev**: `from-gold-400 to-gold-600`
- **NFTs**: `from-amber-400 to-orange-400`
- **Dance**: `from-orange-400 to-gold-500`

## Testing Recommendations

- Test gold theme components on various devices and screen sizes
- Verify that gold gradients and animations render properly across browsers
- Check color contrast ratios for accessibility compliance
- Test gold hover and active states in both light and dark modes

By following these guidelines, all new components will maintain visual consistency with the established gold theme throughout the application. 