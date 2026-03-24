# ShapeBlur

> Morphing blurred geometric shape. The effect occurs on hover.

**Category**: Animations  
**Docs**: https://reactbits.dev/animations/shape-blur

## Dependencies

```bash
npm install three
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variation` | `number` | `0` | Variation |
| `pixelRatioProp` | `any` | `window.devicePixelRatio \|\| 1` | Pixel Ratio Prop |
| `shapeSize` | `number` | `0.5` | Shape Size |
| `roundness` | `number` | `0.5` | Roundness |
| `borderSize` | `number` | `0.05` | Border Size |
| `circleSize` | `number` | `0.5` | Circle Size |
| `circleEdge` | `number` | `1` | Circle Edge |

## Usage

```jsx
import ShapeBlur from './ShapeBlur';

<div style={{position: 'relative', height: '500px', overflow: 'hidden'}}>
  <ShapeBlur
    variation={0}
    pixelRatioProp={window.devicePixelRatio || 1}
    shapeSize={0.5}
    roundness={0.5}
    borderSize={0.05}
    circleSize={0.5}
    circleEdge={1}
  />
</div>
```

## Suggested Use Cases

- Interactive hover effects
- Creative landing pages
