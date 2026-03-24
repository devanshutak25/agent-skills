# GradientBlinds

> Layered gradient blinds with spotlight and noise distortion.

**Category**: Backgrounds  
**Docs**: https://reactbits.dev/backgrounds/gradient-blinds

## Dependencies

```bash
npm install ogl
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `gradientColors` | `array` | `['#FF9FFC', '#5227FF']` | Gradient Colors |
| `angle` | `number` | `0` | Angle |
| `noise` | `number` | `0.3` | Noise |
| `blindCount` | `number` | `12` | Blind Count |
| `blindMinWidth` | `number` | `50` | Blind Min Width |
| `spotlightRadius` | `number` | `0.5` | Spotlight Radius |
| `spotlightSoftness` | `number` | `1` | Spotlight Softness |
| `spotlightOpacity` | `number` | `1` | Spotlight Opacity |
| `mouseDampening` | `number` | `0.15` | Mouse Dampening |
| `distortAmount` | `number` | `0` | Distort Amount |
| `shineDirection` | `string` | `"left"` | Shine Direction |
| `mixBlendMode` | `string` | `"lighten"` | Mix Blend Mode |

## Usage

```jsx
import GradientBlinds from './GradientBlinds';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <GradientBlinds
    gradientColors={['#FF9FFC', '#5227FF']}
    angle={0}
    noise={0.3}
    blindCount={12}
    blindMinWidth={50}
    spotlightRadius={0.5}
    spotlightSoftness={1}
    spotlightOpacity={1}
    mouseDampening={0.15}
    distortAmount={0}
    shineDirection="left"
    mixBlendMode="lighten"
  />
</div>
```

## Suggested Use Cases

- Hero backgrounds
- Elegant backgrounds
- Landing page sections
