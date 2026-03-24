# GooeyNav

> Navigation indicator morphs with gooey blob transitions between items.

**Category**: Components  
**Docs**: https://reactbits.dev/components/gooey-nav

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `any` | `items` | Items array |
| `particleCount` | `number` | `15` | Number of particles |
| `particleDistances` | `array` | `[90, 10]` | Particle Distances |
| `particleR` | `number` | `100` | Particle R |
| `initialActiveIndex` | `number` | `0` | Initial Active Index |
| `animationTime` | `number` | `600` | Animation Time |
| `timeVariance` | `number` | `300` | Time Variance |
| `colors` | `array` | `[1, 2, 3, 1, 2, 3, 1, 4]` | Color array |

## Usage

```jsx
import GooeyNav from './GooeyNav'

// update with your own items
const items = [
  { label: "Home", href: "#" },
  { label: "About", href: "#" },
  { label: "Contact", href: "#" },
];

<div style={{ height: '600px', position: 'relative' }}>
  <GooeyNav
    items={items}
    particleCount={15}
    particleDistances={[90, 10]}
    particleR={100}
    initialActiveIndex={0}
    animationTime={600}
    timeVariance={300}
    colors={[1, 2, 3, 1, 2, 3, 1, 4]}
  />
</div>
```

## Suggested Use Cases

- App navigation
- Modern web apps
