# RippleGrid

> A grid that continuously animates with a ripple effect.

**Category**: Backgrounds  
**Docs**: https://reactbits.dev/backgrounds/ripple-grid

## Dependencies

```bash
npm install ogl
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `enableRainbow` | `boolean` | `false` | Enable Rainbow |
| `gridColor` | `string` | `"#ffffff"` | Grid Color |
| `rippleIntensity` | `number` | `0.05` | Ripple Intensity |
| `gridSize` | `number` | `10` | Grid Size |
| `gridThickness` | `number` | `15` | Grid Thickness |
| `mouseInteraction` | `boolean` | `true` | Mouse Interaction |
| `mouseInteractionRadius` | `number` | `1.2` | Mouse Interaction Radius |
| `opacity` | `number` | `0.8` | Opacity (0-1) |

## Usage

```jsx
import RippleGrid from './RippleGrid';

<div style={{position: 'relative', height: '500px', overflow: 'hidden'}}>
  <RippleGrid
    enableRainbow={false}
    gridColor="#ffffff"
    rippleIntensity={0.05}
    gridSize={10}
    gridThickness={15}
    mouseInteraction={true}
    mouseInteractionRadius={1.2}
    opacity={0.8}
  />
</div>
```

## Suggested Use Cases

- Hero backgrounds
- Tech-themed sections
- Landing page sections
