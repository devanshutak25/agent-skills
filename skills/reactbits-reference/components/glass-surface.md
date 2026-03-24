# GlassSurface

> Advanced Apple-style glass surface with real-time distortion + lighting.

**Category**: Components  
**Docs**: https://reactbits.dev/components/glass-surface

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `width` | `number` | `300` | Width |
| `height` | `number` | `200` | Height |
| `borderRadius` | `number` | `24` | Border Radius |
| `className` | `string` | `"my-custom-class"` | Additional CSS classes |

## Usage

```jsx
import GlassSurface from './GlassSurface'

// Basic usage
<GlassSurface 
  width={300} 
  height={200}
  borderRadius={24}
  className="my-custom-class"
>
  <h2>Glass Surface Content</h2>
</GlassSurface>

// Custom displacement effects
<GlassSurface
  displace={15}
  distortionScale={-150}
  redOffset={5}
  greenOffset={15}
  blueOffset={25}
  brightness={60}
  opacity={0.8}
  mixBlendMode="screen"
>
  <span>Advanced Glass Distortion</span>
</GlassSurface>
```

## Suggested Use Cases

- Glassmorphism UI
- Modern web apps
