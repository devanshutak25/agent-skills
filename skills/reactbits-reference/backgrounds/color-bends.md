# ColorBends

> Vibrant color bends with smooth flowing animation.

**Category**: Backgrounds  
**Docs**: https://reactbits.dev/backgrounds/color-bends

## Dependencies

```bash
npm install three
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `colors` | `array` | `["#ff5c7a", "#8a5cff", "#00ffd1"]` | Color array |
| `rotation` | `number` | `30` | Rotation |
| `speed` | `number` | `0.3` | Animation speed |
| `scale` | `number` | `1.2` | Scale multiplier |
| `frequency` | `number` | `1.4` | Frequency |
| `warpStrength` | `number` | `1.2` | Warp Strength |
| `mouseInfluence` | `number` | `0.8` | Mouse Influence |
| `parallax` | `number` | `0.6` | Parallax |
| `noise` | `number` | `0.08` | Noise |
| `transparent` | `boolean` | `true` | Transparent |

## Usage

```jsx
import ColorBends from './ColorBends';
  
<ColorBends
  colors={["#ff5c7a", "#8a5cff", "#00ffd1"]}
  rotation={30}
  speed={0.3}
  scale={1.2}
  frequency={1.4}
  warpStrength={1.2}
  mouseInfluence={0.8}
  parallax={0.6}
  noise={0.08}
  transparent
/>
```

## Suggested Use Cases

- Hero backgrounds
- Landing page sections
