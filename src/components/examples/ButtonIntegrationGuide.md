# Golden Button Integration Guide

This guide explains how to use the new golden/orange buttons that match your logo's color scheme across your site.

## Button Variants

We've created four button variants with your logo's golden/orange color palette:

1. **Gold Button (`variant="gold"`)**: Solid gold background with subtle shadow and hover effect
2. **Gold Outline (`variant="gold-outline"`)**: Transparent with gold border, fills with gold on hover
3. **Gold Gradient (`variant="gold-gradient"`)**: Gradient from gold to orange, with interactive color shift on hover
4. **Gold Glow (`variant="gold-glow"`)**: Gold background with dramatic glow effect on hover

## How to Replace Existing Buttons

### 1. Using the Button Component (Recommended)

For React components, import and use the Button component:

```tsx
import Button from '@/components/ui/Button';

function YourComponent() {
  return (
    <div>
      {/* Replace existing buttons */}
      <Button variant="gold">Sign Up</Button>
      <Button variant="gold-outline" href="/about">Learn More</Button>
      <Button variant="gold-gradient" size="lg">
        <span>Get Started</span>
      </Button>
    </div>
  );
}
```

### 2. Using CSS Classes Directly

If you prefer to use the classes directly with your existing button elements:

```tsx
<button className="btn-gold">Sign Up</button>
<a href="/about" className="btn-gold-outline">Learn More</a>
<button className="btn-gold-gradient btn-lg">
  <span>Get Started</span>
</button>
```

## Integration Checklist

Use this checklist to ensure consistency across your site:

- [ ] Navigation buttons and links
- [ ] Call-to-action buttons on hero sections
- [ ] Form submit buttons
- [ ] "Load More" or pagination controls
- [ ] Modal dialog buttons
- [ ] Card action buttons
- [ ] Newsletter signup forms
- [ ] Contact page buttons

## Best Practices

1. **Use the right variant for the right context:**
   - `gold` for primary actions
   - `gold-outline` for secondary actions
   - `gold-gradient` for high-importance CTAs
   - `gold-glow` for special attention-grabbing elements

2. **Maintain hierarchy:**
   - Limit to 1-2 solid gold buttons per section
   - Use outline variants for less important actions
   - Don't overuse the glow effect

3. **Text contrast:**
   - Use white text on gold backgrounds for best readability
   - Consider using the script font for important buttons

## Quick Implementation Examples

### Hero Section

```tsx
<div className="hero-content text-center">
  <h1 className="text-5xl font-script text-gold-500">Photography Portfolio</h1>
  <p className="my-6">Capturing life's precious moments with artistic vision.</p>
  <div className="flex justify-center gap-4">
    <Button variant="gold-gradient" size="lg">
      <span>View Gallery</span>
    </Button>
    <Button variant="gold-outline" href="/contact">Contact Me</Button>
  </div>
</div>
```

### Contact Form

```tsx
<form className="space-y-4">
  <input type="text" placeholder="Name" className="w-full p-2 rounded" />
  <input type="email" placeholder="Email" className="w-full p-2 rounded" />
  <textarea placeholder="Message" className="w-full p-2 rounded h-32"></textarea>
  <Button variant="gold" type="submit">Send Message</Button>
</form>
```

### Card Actions

```tsx
<div className="card p-4 rounded-lg bg-gray-800">
  <h3 className="text-xl font-medium">Portfolio Item</h3>
  <p className="my-2">Description of the work.</p>
  <div className="mt-4">
    <Button variant="gold-outline" size="sm">View Details</Button>
  </div>
</div>
``` 