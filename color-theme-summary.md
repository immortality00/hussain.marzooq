# Logo-Inspired Theme Colors and Fonts

## New Color Variables

| Variable Name | Color Code | Description |
|---------------|------------|-------------|
| --color-gold-primary | #d4af37 | Rich gold primary color |
| --color-gold-light | #f2d675 | Light gold for highlights |
| --color-gold-dark | #aa8c2c | Dark gold for shadows/depth |
| --color-orange-accent | #e67e22 | Orange accent color |

## Tailwind Color Scale

The full gold and orange color scales have been added to the Tailwind config:

### Gold Scale
- gold-50: #fcf9eb (very light gold)
- gold-100: #f9f2d4
- gold-200: #f2d675
- gold-300: #e8c650
- gold-400: #e0b829
- gold-500: #d4af37 (primary gold)
- gold-600: #aa8c2c
- gold-700: #876f23
- gold-800: #665421
- gold-900: #4a3d17
- gold-950: #2e260e (very dark gold)

### Orange Scale
- orange-50: #fef7ee (very light orange)
- orange-100: #fdeed8
- orange-200: #fbd9b1
- orange-300: #f8c080
- orange-400: #f49e4c
- orange-500: #e67e22 (accent orange)
- orange-600: #d06518
- orange-700: #ac4f16
- orange-800: #8a3f18
- orange-900: #703618
- orange-950: #3c1a0b (very dark orange)

## New Font

Added Cormorant Garamond as a script-style font for headings:
- Script font: Cormorant Garamond (variable: --font-script)
- Used in the `font-script` Tailwind class

## New Utility Classes

### Typography
- All heading classes now use the script font and gold color

### Colors
- `.text-gold-accent`: Gold text color
- `.bg-gold-accent`: Gold background
- `.border-gold-accent`: Gold border
- `.accent-gradient`: Gold to orange gradient

### Buttons
- `.btn-gold`: Gold background button
- `.btn-gold-outline`: Gold outline button

### Glass Components
- `.glass-gold`: Glass effect with gold tint
- `.glass-card-gold`: Card with gold glass effect

## How to Use

Example usage:
```html
<h1 class="heading-1">Your Headline</h1>
<p>Regular body text</p>
<a href="#" class="btn-gold">Gold Button</a>
<div class="glass-card-gold p-4">
  Content with gold glass effect
</div>
```

You can easily combine these new classes with existing ones to achieve the desired look while maintaining consistency with your logo's golden/orange tones and script-style font.
