# ScrollVelocity

> Text marquee animatio - speed and distortion scale with user's scroll velocity.

**Category**: Text Animations  
**Docs**: https://reactbits.dev/text-animations/scroll-velocity

## Dependencies

```bash
npm install motion
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `texts` | `array` | `['React Bits', 'Scroll Down']` | Texts |
| `velocity` | `any` | `velocity` | Velocity |
| `className` | `string` | `"custom-scroll-text"` | Additional CSS classes |

## Usage

```jsx
import ScrollVelocity from './ScrollVelocity';
  
<ScrollVelocity
  texts={['React Bits', 'Scroll Down']} 
  velocity={velocity} 
  className="custom-scroll-text"
/>
```

## Suggested Use Cases

- Hero section headlines
- Scroll-driven storytelling
- Landing pages
