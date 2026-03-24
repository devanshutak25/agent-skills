# BlobCursor

> Organic blob cursor that smoothly follows the pointer with inertia and elastic morphing.

**Category**: Animations  
**Docs**: https://reactbits.dev/animations/blob-cursor

## Dependencies

```bash
npm install gsap
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `blobType` | `string` | `"circle"` | Blob Type |
| `fillColor` | `string` | `"#5227FF"` | Fill Color |
| `trailCount` | `number` | `3` | Trail Count |
| `sizes` | `array` | `[60, 125, 75]` | Sizes |
| `innerSizes` | `array` | `[20, 35, 25]` | Inner Sizes |
| `innerColor` | `string` | `"rgba(255,255,255,0.8)"` | Inner Color |
| `opacities` | `array` | `[0.6, 0.6, 0.6]` | Opacities |
| `shadowColor` | `string` | `"rgba(0,0,0,0.75)"` | Shadow Color |
| `shadowBlur` | `number` | `5` | Shadow Blur |
| `shadowOffsetX` | `number` | `10` | Shadow Offset X |
| `shadowOffsetY` | `number` | `10` | Shadow Offset Y |
| `filterStdDeviation` | `number` | `30` | Filter Std Deviation |
| `useFilter` | `boolean` | `true` | Use Filter |
| `fastDuration` | `number` | `0.1` | Fast Duration |
| `slowDuration` | `number` | `0.5` | Slow Duration |
| `zIndex` | `number` | `100` | Z Index |

## Usage

```jsx
import BlobCursor from './BlobCursor';

<BlobCursor
  blobType="circle"
  fillColor="#5227FF"
  trailCount={3}
  sizes={[60, 125, 75]}
  innerSizes={[20, 35, 25]}
  innerColor="rgba(255,255,255,0.8)"
  opacities={[0.6, 0.6, 0.6]}
  shadowColor="rgba(0,0,0,0.75)"
  shadowBlur={5}
  shadowOffsetX={10}
  shadowOffsetY={10}
  filterStdDeviation={30}
  useFilter={true}
  fastDuration={0.1}
  slowDuration={0.5}
  zIndex={100}
/>
```

## Suggested Use Cases

- Custom cursor effects
- Creative landing pages
