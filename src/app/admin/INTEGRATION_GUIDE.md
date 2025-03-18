# Admin Dashboard Gold Theme Integration Guide

This guide explains how to apply the new gold/orange theme to components in the admin dashboard, aligned with the site's new branding.

## Available Style Classes

The new admin styling adds the following CSS classes you can use:

### Text and Headings
- `admin-heading`: Large script font heading with gold gradient
- `admin-subheading`: Medium script font heading with gold gradient
- `admin-section-title`: Gold section titles with subtle bottom border

### Containers
- `admin-dashboard`: Main container with dark gradient background
- `admin-panel`: Glass panel with gold border
- `admin-panel-gold`: Glass panel with gold gradient background
- `admin-card`: Card with gold border and hover effects

### Interactive Elements
- `admin-tab`: Tab with gold styling when active (add `.active` class)
- `admin-button-gold`: Button with gold gradient background
- `admin-user-chip`: User profile chip with gold border
- `admin-stat-value`: Large gold gradient statistic value

### Background Elements
- `camera-backdrop`: Base class for camera SVG watermarks
- `camera-top-right`: Camera SVG positioned at top right
- `camera-bottom-left`: Camera SVG positioned at bottom left
- `camera-center`: Camera SVG positioned at center

## Integration Examples

### How to Style a Heading
```jsx
<h1 className="admin-heading">Dashboard Title</h1>
<h2 className="admin-subheading">Section Title</h2>
<h3 className="admin-section-title">Content Category</h3>
```

### How to Style Panels
```jsx
<div className="admin-panel p-6">
  Content in a glass panel with gold border
</div>

<div className="admin-panel-gold p-6">
  Content in a glass panel with gold gradient background
</div>
```

### How to Style Cards
```jsx
<div className="admin-card p-4">
  <h3 className="admin-section-title">Card Title</h3>
  <p>Card content with hover effects</p>
</div>
```

### How to Style Tabs
```jsx
<button 
  className={`admin-tab px-4 py-2 ${isActive ? 'active' : ''}`}
  onClick={() => setActive(true)}
>
  Tab Name
</button>
```

### How to Style Buttons
```jsx
<button className="admin-button-gold px-5 py-2.5 rounded-lg">
  Gold Button
</button>
```

### How to Style Statistics
```jsx
<div className="admin-stat-value">
  {count}
</div>
<div className="text-sm text-gray-300 uppercase">
  Label
</div>
```

## Background Camera Elements

To add camera watermarks to a page or component:

```jsx
<div className="relative">
  {/* Camera background elements */}
  <div className="camera-backdrop camera-top-right" />
  <div className="camera-backdrop camera-bottom-left" />
  
  {/* Your page content */}
  <div className="z-10 relative">
    Content goes here
  </div>
</div>
```

## Design System Integration

The adminStyles.css works alongside the existing design system. We've also updated the designSystem.ts file with gold/orange values:

```tsx
import { designSystem } from '@/components/admin/designSystem';

// Gold button from design system
<button className={designSystem.buttons.gold}>
  Gold Button
</button>

// Gold text
<span className={designSystem.colors.text.gold}>
  Gold Text
</span>

// Gold gradient background
<div className={`bg-gradient-to-r ${designSystem.colors.accent.gold}`}>
  Content with gold gradient
</div>
```

## Recommended Areas for Update

1. **Headers and Page Titles**: Use `admin-heading` and `admin-subheading`
2. **Section Titles**: Use `admin-section-title` 
3. **Navigation Elements**: Use `admin-tab` with `.active` for the current tab
4. **Action Buttons**: Replace primary buttons with `admin-button-gold`
5. **Panels and Cards**: Use `admin-panel` and `admin-card` for consistent styling
6. **Stats and Metrics**: Use `admin-stat-value` for numerical values

## Implementation Notes

- The CSS is modular and doesn't interfere with existing functionality
- Script font is automatically imported for headings
- Camera background elements are subtle and don't distract from content
- The styling is designed to complement the existing design system 