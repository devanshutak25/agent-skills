# PixelTrail

> Pixelated cursor trail emitting fading squares with retro digital feel.

**Category**: Animations  
**Docs**: https://reactbits.dev/animations/pixel-trail

## Dependencies

```bash
npm install three @react-three/fiber @react-three/drei
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `gridSize` | `number` | `50` | Grid Size |
| `trailSize` | `number` | `0.1` | Trail Size |
| `maxAge` | `number` | `250` | Max Age |
| `interpolate` | `number` | `5` | Interpolate |
| `color` | `string` | `"#fff"` | Primary color |
| `gooeyFilter` | `object` | `{ id: "custom-goo-filter", strength: 2 }` | Gooey Filter |

## Usage

```jsx
import PixelTrail from './PixelTrail';

<div style={{ height: '500px', position: 'relative', overflow: 'hidden'}}>
  <PixelTrail
    gridSize={50}
    trailSize={0.1}
    maxAge={250}
    interpolate={5}
    color="#fff"
    gooeyFilter={{ id: "custom-goo-filter", strength: 2 }}
  />
</div>
```

## Suggested Use Cases

- Custom cursor effects
- Creative landing pages
