# LightRays

> Volumetric light rays/beams with customizable direction.

**Category**: Backgrounds  
**Docs**: https://reactbits.dev/backgrounds/light-rays

## Dependencies

```bash
npm install ogl
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `raysOrigin` | `string` | `"top-center"` | Rays Origin |
| `raysColor` | `string` | `"#00ffff"` | Rays Color |
| `raysSpeed` | `number` | `1.5` | Rays Speed |
| `lightSpread` | `number` | `0.8` | Light Spread |
| `rayLength` | `number` | `1.2` | Ray Length |
| `followMouse` | `boolean` | `true` | Follow Mouse |
| `mouseInfluence` | `number` | `0.1` | Mouse Influence |
| `noiseAmount` | `number` | `0.1` | Noise Amount |
| `distortion` | `number` | `0.05` | Distortion |
| `className` | `string` | `"custom-rays"` | Additional CSS classes |

## Usage

```jsx
import LightRays from './LightRays';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <LightRays
    raysOrigin="top-center"
    raysColor="#00ffff"
    raysSpeed={1.5}
    lightSpread={0.8}
    rayLength={1.2}
    followMouse={true}
    mouseInfluence={0.1}
    noiseAmount={0.1}
    distortion={0.05}
    className="custom-rays"
  />
</div>
```

## Suggested Use Cases

- Hero backgrounds
- Landing page sections
