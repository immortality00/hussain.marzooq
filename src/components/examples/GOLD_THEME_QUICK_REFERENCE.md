# Gold Theme Quick Reference

## Color Codes
- **Gold Primary**: `#d4af37`
- **Gold Light**: `#f2d675`
- **Gold Dark**: `#aa8c2c`
- **Orange Accent**: `#e67e22`

## Fonts
- **Script Font**: Cormorant Garamond (for headings)
  ```jsx
  <h1 className="font-script">Heading Text</h1>
  
  <h1 style={{ fontFamily: 'var(--font-script)' }}>Heading Text</h1>
  ```
- **Display Font**: Playfair Display (for subheadings)
- **Body Font**: Inter (for body text)

## Camera Icon Usage
- Use the `<CameraBackdrop>` component for watermarks:
  ```jsx
  <CameraBackdrop 
    position="top-right" // or "bottom-left", "center"
    opacity="opacity-[0.03]" // adjust as needed
    size="w-64 h-64" // adjust as needed
  />
  ```

## Common UI Elements

### Buttons
```jsx
// Primary Gold Button
<button className="admin-button-gold px-5 py-2 rounded-lg">
  Button Text
</button>

// Gold Outline Button
<button className="btn-gold-outline px-5 py-2 rounded-lg">
  Button Text
</button>
```

### Headings
```jsx
// Large Gold Gradient Heading
<h1 className="admin-heading">Heading Text</h1>

// Medium Gold Gradient Heading
<h2 className="admin-subheading">Subheading Text</h2>

// Section Title with Gold Styling
<h3 className="admin-section-title">Section Title</h3>

// Gold Shimmer Text Effect
<h2 className="gold-shimmer">Shimmer Text</h2>
```

### Glass Panels
```jsx
// Gold Glass Panel
<div className="gold-glass p-6 rounded-xl">
  Panel Content
</div>

// Gold Glass Card with Hover Effect
<div className="gold-glass-card p-4">
  Card Content
</div>
```

### Dividers
```jsx
// Gold Gradient Divider
<div className="gold-divider my-6"></div>
```

### Form Elements
```jsx
// Gold Styled Input
<input className="gold-input px-4 py-2 rounded-lg" />

// Gold Styled Select
<select className="gold-input gold-select px-4 py-2 rounded-lg">
  <option>Option 1</option>
</select>
```

### Animations
```jsx
// FadeUp Animation
<FadeUp delay={0.2}>
  <p>Content that fades up</p>
</FadeUp>

// Staggered Animations
<StaggerContainer>
  {items.map(item => (
    <StaggerItem key={item.id}>
      <div>Item content</div>
    </StaggerItem>
  ))}
</StaggerContainer>
```

## Example Component with Gold Theme

```jsx
import React from 'react';
import { FadeUp } from '../ui/AnimatedElements';
import { GoldHeading, GoldDivider, CameraBackdrop } from '../ui/GoldAccents';

export const GoldThemedComponent = () => {
  return (
    <section className="py-16 gold-gradient-bg relative">
      {/* Background Camera */}
      <CameraBackdrop position="top-right" opacity="opacity-[0.02]" />
      
      <div className="container mx-auto px-4">
        {/* Gold Heading */}
        <GoldHeading 
          as="h2" 
          className="text-3xl md:text-5xl font-script text-center mb-6"
          withAccent
          shimmer
        >
          Section Title
        </GoldHeading>
        
        <GoldDivider className="mb-10" />
        
        {/* Content */}
        <div className="gold-glass p-8 rounded-xl max-w-3xl mx-auto">
          <FadeUp>
            <p className="text-white mb-6">
              Content with gold-themed styling
            </p>
            
            <button className="admin-button-gold px-6 py-3 rounded-lg">
              Gold Button
            </button>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}; 