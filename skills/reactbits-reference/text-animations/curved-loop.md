# CurvedLoop

> Flowing looping text path along a customizable curve with drag interaction.

**Category**: Text Animations  
**Docs**: https://reactbits.dev/text-animations/curved-loop

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `marqueeText` | `string` | `"Welcome to React Bits ✦"` | Marquee Text |

## Usage

```jsx
import CurvedLoop from './CurvedLoop';

// Basic usage
<CurvedLoop marqueeText="Welcome to React Bits ✦" />

// With custom props
<CurvedLoop 
  marqueeText="Be ✦ Creative ✦ With ✦ React ✦ Bits ✦"
  speed={3}
  curveAmount={500}
  direction="right"
  interactive={true}
  className="custom-text-style"
/>

// Non-interactive with slower speed
<CurvedLoop 
  marqueeText="Smooth Curved Animation"
  speed={1}
  curveAmount={300}
  interactive={false}
/>
```

## Suggested Use Cases

- Hero section headlines
- Landing pages
