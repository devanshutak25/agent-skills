# MagicBento

> Interactive bento grid tiles expand + animate with various options.

**Category**: Components  
**Docs**: https://reactbits.dev/components/magic-bento

## Dependencies

```bash
npm install gsap
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `textAutoHide` | `boolean` | `true` | Text Auto Hide |
| `enableStars` | `boolean` | `true` | Enable Stars |
| `enableSpotlight` | `boolean` | `true` | Enable Spotlight |
| `enableBorderGlow` | `boolean` | `true` | Enable Border Glow |
| `enableTilt` | `boolean` | `true` | Enable Tilt |
| `enableMagnetism` | `boolean` | `true` | Enable Magnetism |
| `clickEffect` | `boolean` | `true` | Click Effect |
| `spotlightRadius` | `number` | `300` | Spotlight Radius |
| `particleCount` | `number` | `12` | Number of particles |
| `glowColor` | `string` | `"132, 0, 255"` | Glow Color |

## Usage

```jsx
import MagicBento from './MagicBento'

<MagicBento 
  textAutoHide={true}
  enableStars={true}
  enableSpotlight={true}
  enableBorderGlow={true}
  enableTilt={true}
  enableMagnetism={true}
  clickEffect={true}
  spotlightRadius={300}
  particleCount={12}
  glowColor="132, 0, 255"
/>
```

## Suggested Use Cases

- Modern web apps
