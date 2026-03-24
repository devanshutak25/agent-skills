# ChromaGrid

> A responsive grid of grayscale tiles. Hovering the grid reaveals their colors.

**Category**: Components  
**Docs**: https://reactbits.dev/components/chroma-grid

## Dependencies

```bash
npm install gsap
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `any` | `items` | Items array |
| `radius` | `number` | `300` | Radius value |
| `damping` | `number` | `0.45` | Damping |
| `fadeOut` | `number` | `0.6` | Fade Out |
| `ease` | `string` | `"power3.out"` | Easing function |

## Usage

```jsx
import ChromaGrid from './ChromaGrid'

const items = [
  {
    image: "https://i.pravatar.cc/300?img=1",
    title: "Sarah Johnson",
    subtitle: "Frontend Developer",
    handle: "@sarahjohnson",
    borderColor: "#3B82F6",
    gradient: "linear-gradient(145deg, #3B82F6, #000)",
    url: "https://github.com/sarahjohnson"
  },
  {
    image: "https://i.pravatar.cc/300?img=2",
    title: "Mike Chen",
    subtitle: "Backend Engineer",
    handle: "@mikechen",
    borderColor: "#10B981",
    gradient: "linear-gradient(180deg, #10B981, #000)",
    url: "https://linkedin.com/in/mikechen"
  }
];

<div style={{ height: '600px', position: 'relative' }}>
  <ChromaGrid 
    items={items}
    radius={300}
    damping={0.45}
    fadeOut={0.6}
    ease="power3.out"
  />
</div>
```

## Suggested Use Cases

- Modern web apps
