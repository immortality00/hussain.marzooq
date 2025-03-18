# Gold Theme Style Guide

This guide provides a comprehensive overview of the portfolio's gold theme styling elements to ensure consistency in all future updates and additions to the site.

## 🎨 Brand Colors

### Primary Color Palette
| Color Name | Variable | Hex Code | Usage |
|------------|----------|----------|-------|
| Gold Primary | `var(--color-gold-primary)` | `#d4af37` | Main gold color for primary elements |
| Gold Light | `var(--color-gold-light)` | `#f2d675` | Highlights, hover states, accents |
| Gold Dark | `var(--color-gold-dark)` | `#aa8c2c` | Shadows, borders, depth |
| Orange Accent | `var(--color-orange-accent)` | `#e67e22` | Accent color, used in gradients |

### Gradients
- **Gold Gradient**: `linear-gradient(to right, var(--gold-primary), var(--gold-orange))`
- **Gold Gradient Light**: `linear-gradient(to right, var(--gold-light), var(--gold-primary))`
- **Gold Gradient Dark**: `linear-gradient(to right, var(--gold-dark), var(--gold-primary))`

## 🔠 Typography

### Font Families
- **Display Font**: Playfair Display (`font-display`) - For regular headings
- **Script Font**: Cormorant Garamond (`font-script`) - For elegant, script-style headings
- **Body Font**: Inter (`font-sans`) - For body text

> **Important:** Always use the CSS variables (e.g., `var(--font-script)`) to reference fonts rather than direct font-family names to ensure proper loading and CSP compliance.

### Gold-Themed Text Styles
- `.gold-shimmer`: Animated gold shimmer effect for text
- `.gold-gradient-text`: Gold gradient text (non-animated)
- `.admin-heading`: Script font with gold gradient (large size)
- `.admin-subheading`: Script font with gold gradient (medium size)
- `.admin-section-title`: Regular heading with gold color

## 🖼️ Camera Icon Usage

### Implementation
- **SVG Format**: Camera icons used as decorative elements / watermarks
- **File Location**: `/images/accents/camera-watermark.svg`
- **Component**: `<CameraBackdrop>` component for easy implementation

### Positioning Options
| Class Name | Position | Usage |
|------------|----------|-------|
| `camera-top-right` | Top right | Subtle background element in headers |
| `camera-bottom-left` | Bottom left | Decorative element in content sections |
| `camera-center` | Center | Watermark for large background areas |

### Opacity Guidelines
- **Standard**: 0.03 (3%) - For most uses
- **Subtle**: 0.02 (2%) - For larger background elements
- **Prominent**: 0.05 (5%) - For smaller decorative accents

## 🧩 UI Components

### Buttons
- `.admin-button-gold`: Primary gold gradient button
- `.btn-gold`: Standard gold button
- `.btn-gold-outline`: Gold outline button
- `.btn-gold-gradient`: Gold gradient button
- `.btn-gold-glow`: Gold button with glow effect

### Glass Effects
- `.gold-glass`: Dark background with gold border
- `.gold-glass-card`: Card style with gold accents and hover effects
- `.gold-glass-light`: Lighter background with gold accents
- `.admin-panel`: Admin-specific panel with gold borders

### Dividers & Accents
- `.gold-divider`: Horizontal divider with gold gradient
- `.gold-accent-line`: Decorative gold line
- `.gold-accent-border`: Element with gold border accent
- `.gold-accent-top`: Element with gold top border
- `.gold-accent-glow`: Element with hover glow effect

## 🌈 Backgrounds

- `.gold-gradient-bg`: Subtle dark gradient with gold accent
- `.gold-noise`: Noise texture overlay (very subtle)
- `.gold-dots`: Gold dot pattern
- `.gold-rays`: Subtle gold ray effect
- `.gold-section`: Section with gold gradient overlay

## ✨ Animations

### Animation Classes
- `.gold-shimmer`: Text shimmer effect
- `.gold-pulse`: Subtle pulsing glow
- `.gold-float`: Gentle floating motion
- `.gold-border-glow`: Animated border glow

### Animation Components
- `<FadeUp>`: Fade up animation
- `<FadeIn>`: Simple fade in
- `<TextReveal>`: Text reveal animation
- `<StaggerContainer>` and `<StaggerItem>`: Staggered animations
- `<ScaleIn>`: Scale in animation
- `<LazyImage>`: Image with lazy loading and blur effect

## 📝 Implementation Guidelines

1. **Headings & Text**
   - Use script font (`font-script`) for main headings
   - Apply gold color to all headings
   - Use gold shimmer effect sparingly (main headlines only)

2. **Interactive Elements**
   - All buttons should use gold variants
   - Links should use `.gold-link` class
   - Form inputs should use `.gold-input` class

3. **Sections & Cards**
   - Main sections should include camera backdrop elements
   - Cards should use `.gold-glass-card` for consistent styling
   - Use `.gold-accent-line` under important headings

4. **Admin Dashboard**
   - Always wrap admin dashboard in `.admin-dashboard` class
   - Use `.admin-heading` for main dashboard title
   - Use `.admin-panel` for dashboard content sections
   - Active tabs should have `.active` class applied

## 🚫 Consistency Checklist

When implementing new features, ensure:

1. Blue gradients are replaced with gold gradients
2. Default fonts are replaced with appropriate gold theme fonts
3. Generic glass effects use gold-specific glass classes
4. Camera icons are properly positioned and sized
5. All buttons follow the gold button styling
6. Script font is used for appropriate headings

## 🧠 Principles for Future Development

1. **Elegance Over Flashiness**: Gold effects should be elegant and subtle
2. **Consistent Gold Accents**: Maintain the gold accent in all interactive elements
3. **Script Font Hierarchy**: Use script font for main headings, display font for subheadings
4. **Performance First**: Ensure animations respect `prefers-reduced-motion`
5. **Camera Motif**: Include subtle camera icons as a recurring visual theme 