# Prism

> Rotating prism with configurable intensity, size, and colors.

**Category**: Backgrounds  
**Docs**: https://reactbits.dev/backgrounds/prism

## Dependencies

```bash
npm install ogl
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `animationType` | `string` | `"rotate"` | Animation Type |
| `timeScale` | `number` | `0.5` | Time Scale |
| `height` | `number` | `3.5` | Height |
| `baseWidth` | `number` | `5.5` | Base Width |
| `scale` | `number` | `3.6` | Scale multiplier |
| `hueShift` | `number` | `0` | Hue Shift |
| `colorFrequency` | `number` | `1` | Color Frequency |
| `noise` | `number` | `0.5` | Noise |
| `glow` | `number` | `1` | Glow |

## Usage

```jsx
import Prism from './Prism';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <Prism
    animationType="rotate"
    timeScale={0.5}
    height={3.5}
    baseWidth={5.5}
    scale={3.6}
    hueShift={0}
    colorFrequency={1}
    noise={0.5}
    glow={1}
  />
</div>
```

## Suggested Use Cases

- Hero backgrounds
- Landing page sections
