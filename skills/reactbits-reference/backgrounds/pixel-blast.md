# PixelBlast

> Exploding pixel particle bursts with optional liquid postprocessing.

**Category**: Backgrounds  
**Docs**: https://reactbits.dev/backgrounds/pixel-blast

## Dependencies

```bash
npm install three postprocessing
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `string` | `"circle"` | Variant |
| `pixelSize` | `number` | `6` | Pixel Size |
| `color` | `string` | `"#B19EEF"` | Primary color |
| `patternScale` | `number` | `3` | Pattern Scale |
| `patternDensity` | `number` | `1.2` | Pattern Density |
| `pixelSizeJitter` | `number` | `0.5` | Pixel Size Jitter |
| `enableRipples` | `boolean` | `true` | Enable Ripples |
| `rippleSpeed` | `number` | `0.4` | Ripple Speed |
| `rippleThickness` | `number` | `0.12` | Ripple Thickness |
| `rippleIntensityScale` | `number` | `1.5` | Ripple Intensity Scale |
| `liquid` | `boolean` | `true` | Liquid |
| `liquidStrength` | `number` | `0.12` | Liquid Strength |
| `liquidRadius` | `number` | `1.2` | Liquid Radius |
| `liquidWobbleSpeed` | `number` | `5` | Liquid Wobble Speed |
| `speed` | `number` | `0.6` | Animation speed |
| `edgeFade` | `number` | `0.25` | Edge Fade |
| `transparent` | `boolean` | `true` | Transparent |

## Usage

```jsx
// Component inspired by github.com/zavalit/bayer-dithering-webgl-demo
  
import PixelBlast from './PixelBlast';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <PixelBlast
    variant="circle"
    pixelSize={6}
    color="#B19EEF"
    patternScale={3}
    patternDensity={1.2}
    pixelSizeJitter={0.5}
    enableRipples
    rippleSpeed={0.4}
    rippleThickness={0.12}
    rippleIntensityScale={1.5}
    liquid
    liquidStrength={0.12}
    liquidRadius={1.2}
    liquidWobbleSpeed={5}
    speed={0.6}
    edgeFade={0.25}
    transparent
  />
</div>
```

## Suggested Use Cases

- Hero backgrounds
- Ambient effects
- Retro aesthetics
- Premium visuals
