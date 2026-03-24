# PrismaticBurst

> Burst of light rays with controllable color, distortion, amount.

**Category**: Backgrounds  
**Docs**: https://reactbits.dev/backgrounds/prismatic-burst

## Dependencies

```bash
npm install ogl
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `animationType` | `string` | `"rotate3d"` | Animation Type |
| `intensity` | `number` | `2` | Effect intensity |
| `speed` | `number` | `0.5` | Animation speed |
| `distort` | `number` | `1.0` | Distort |
| `paused` | `boolean` | `false` | Paused |
| `offset` | `object` | `{ x: 0, y: 0 }` | Offset |
| `hoverDampness` | `number` | `0.25` | Hover Dampness |
| `rayCount` | `number` | `24` | Ray Count |
| `mixBlendMode` | `string` | `"lighten"` | Mix Blend Mode |
| `colors` | `array` | `['#ff007a', '#4d3dff', '#ffffff']` | Color array |

## Usage

```jsx
import PrismaticBurst from './PrismaticBurst';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <PrismaticBurst
    animationType="rotate3d"
    intensity={2}
    speed={0.5}
    distort={1.0}
    paused={false}
    offset={{ x: 0, y: 0 }}
    hoverDampness={0.25}
    rayCount={24}
    mixBlendMode="lighten"
    colors={['#ff007a', '#4d3dff', '#ffffff']}
  />
</div>
```

## Suggested Use Cases

- Hero backgrounds
- Landing page sections
