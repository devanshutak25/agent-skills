# StickerPeel

> Sticker corner lift + peel interaction using 3D transform and shadow depth.

**Category**: Animations  
**Docs**: https://reactbits.dev/animations/sticker-peel

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `imageSrc` | `any` | `logo` | Image Src |
| `width` | `number` | `200` | Width |
| `rotate` | `number` | `30` | Rotate |
| `peelBackHoverPct` | `number` | `20` | Peel Back Hover Pct |
| `peelBackActivePct` | `number` | `40` | Peel Back Active Pct |
| `shadowIntensity` | `number` | `0.6` | Shadow Intensity |
| `lightingIntensity` | `number` | `0.1` | Lighting Intensity |
| `initialPosition` | `object` | `{ x: -100, y: 100 }` | Initial Position |

## Usage

```jsx
import StickerPeel from './StickerPeel'
import logo from './assets/sticker.png'
  
<StickerPeel
  imageSrc={logo}
  width={200}
  rotate={30}
  peelBackHoverPct={20}
  peelBackActivePct={40}
  shadowIntensity={0.6}
  lightingIntensity={0.1}
  initialPosition={{ x: -100, y: 100 }}
/>
```

## Suggested Use Cases

- Interactive hover effects
- Creative landing pages
