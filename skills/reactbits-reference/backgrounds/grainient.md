# Grainient

> Grainy gradient swirls with soft wave distortion.

**Category**: Backgrounds  
**Docs**: https://reactbits.dev/backgrounds/grainient

## Dependencies

```bash
npm install ogl
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `color1` | `string` | `"#FF9FFC"` | Color1 |
| `color2` | `string` | `"#5227FF"` | Color2 |
| `color3` | `string` | `"#B19EEF"` | Color3 |
| `timeSpeed` | `number` | `0.25` | Time Speed |
| `colorBalance` | `number` | `0.0` | Color Balance |
| `warpStrength` | `number` | `1.0` | Warp Strength |
| `warpFrequency` | `number` | `5.0` | Warp Frequency |
| `warpSpeed` | `number` | `2.0` | Warp Speed |
| `warpAmplitude` | `number` | `50.0` | Warp Amplitude |
| `blendAngle` | `number` | `0.0` | Blend Angle |
| `blendSoftness` | `number` | `0.05` | Blend Softness |
| `rotationAmount` | `number` | `500.0` | Rotation Amount |
| `noiseScale` | `number` | `2.0` | Noise Scale |
| `grainAmount` | `number` | `0.1` | Grain Amount |
| `grainScale` | `number` | `2.0` | Grain Scale |
| `grainAnimated` | `boolean` | `false` | Grain Animated |
| `contrast` | `number` | `1.5` | Contrast |
| `gamma` | `number` | `1.0` | Gamma |
| `saturation` | `number` | `1.0` | Saturation |
| `centerX` | `number` | `0.0` | Center X |
| `centerY` | `number` | `0.0` | Center Y |
| `zoom` | `number` | `0.9` | Zoom |

## Usage

```jsx
import Grainient from './Grainient';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <Grainient
    color1="#FF9FFC"
    color2="#5227FF"
    color3="#B19EEF"
    timeSpeed={0.25}
    colorBalance={0.0}
    warpStrength={1.0}
    warpFrequency={5.0}
    warpSpeed={2.0}
    warpAmplitude={50.0}
    blendAngle={0.0}
    blendSoftness={0.05}
    rotationAmount={500.0}
    noiseScale={2.0}
    grainAmount={0.1}
    grainScale={2.0}
    grainAnimated={false}
    contrast={1.5}
    gamma={1.0}
    saturation={1.0}
    centerX={0.0}
    centerY={0.0}
    zoom={0.9}
  />
</div>
```

## Suggested Use Cases

- Hero backgrounds
- Elegant backgrounds
- Landing page sections
