# LightPillar

> Vertical pillar of light with glow effects.

**Category**: Backgrounds  
**Docs**: https://reactbits.dev/backgrounds/light-pillar

## Dependencies

```bash
npm install three
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `topColor` | `string` | `"#5227FF"` | Top Color |
| `bottomColor` | `string` | `"#FF9FFC"` | Bottom Color |
| `intensity` | `number` | `1.0` | Effect intensity |
| `rotationSpeed` | `number` | `0.3` | Rotation Speed |
| `glowAmount` | `number` | `0.005` | Glow Amount |
| `pillarWidth` | `number` | `3.0` | Pillar Width |
| `pillarHeight` | `number` | `0.4` | Pillar Height |
| `noiseIntensity` | `number` | `0.5` | Noise Intensity |
| `pillarRotation` | `number` | `0` | Pillar Rotation |
| `interactive` | `boolean` | `false` | Interactive |
| `mixBlendMode` | `string` | `"normal"` | Mix Blend Mode |

## Usage

```jsx
import LightPillar from './LightPillar';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <LightPillar
    topColor="#5227FF"
    bottomColor="#FF9FFC"
    intensity={1.0}
    rotationSpeed={0.3}
    glowAmount={0.005}
    pillarWidth={3.0}
    pillarHeight={0.4}
    noiseIntensity={0.5}
    pillarRotation={0}
    interactive={false}
    mixBlendMode="normal"
  />
</div>
```

## Suggested Use Cases

- Hero backgrounds
- Landing page sections
