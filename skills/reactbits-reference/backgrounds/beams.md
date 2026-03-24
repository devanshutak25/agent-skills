# Beams

> Crossing animated ribbons with customizable properties.

**Category**: Backgrounds  
**Docs**: https://reactbits.dev/backgrounds/beams

## Dependencies

```bash
npm install three @react-three/fiber @react-three/drei
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `beamWidth` | `number` | `2` | Beam Width |
| `beamHeight` | `number` | `15` | Beam Height |
| `beamNumber` | `number` | `12` | Beam Number |
| `lightColor` | `string` | `"#ffffff"` | Light Color |
| `speed` | `number` | `2` | Animation speed |
| `noiseIntensity` | `number` | `1.75` | Noise Intensity |
| `scale` | `number` | `0.2` | Scale multiplier |
| `rotation` | `number` | `0` | Rotation |

## Usage

```jsx
import Beams from './Beams';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <Beams
    beamWidth={2}
    beamHeight={15}
    beamNumber={12}
    lightColor="#ffffff"
    speed={2}
    noiseIntensity={1.75}
    scale={0.2}
    rotation={0}
  />
</div>
```

## Suggested Use Cases

- Hero backgrounds
- Landing page sections
