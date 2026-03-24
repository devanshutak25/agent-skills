# DotGrid

> Animated dot grid with cursor interactions.

**Category**: Backgrounds  
**Docs**: https://reactbits.dev/backgrounds/dot-grid

## Dependencies

```bash
npm install gsap
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `dotSize` | `number` | `10` | Dot Size |
| `gap` | `number` | `15` | Item spacing |
| `baseColor` | `string` | `"#5227FF"` | Base Color |
| `activeColor` | `string` | `"#5227FF"` | Active Color |
| `proximity` | `number` | `120` | Proximity |
| `shockRadius` | `number` | `250` | Shock Radius |
| `shockStrength` | `number` | `5` | Shock Strength |
| `resistance` | `number` | `750` | Resistance |
| `returnDuration` | `number` | `1.5` | Return Duration |

## Usage

```jsx
import DotGrid from './DotGrid';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <DotGrid
    dotSize={10}
    gap={15}
    baseColor="#5227FF"
    activeColor="#5227FF"
    proximity={120}
    shockRadius={250}
    shockStrength={5}
    resistance={750}
    returnDuration={1.5}
  />
</div>
```

## Suggested Use Cases

- Hero backgrounds
- Tech-themed sections
- Landing page sections
