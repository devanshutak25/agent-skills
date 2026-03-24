# Plasma

> Organic plasma gradients swirl + morph with smooth turbulence.

**Category**: Backgrounds  
**Docs**: https://reactbits.dev/backgrounds/plasma

## Dependencies

```bash
npm install ogl
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `color` | `string` | `"#ff6b35"` | Primary color |
| `speed` | `number` | `0.6` | Animation speed |
| `direction` | `string` | `"forward"` | Animation direction |
| `scale` | `number` | `1.1` | Scale multiplier |
| `opacity` | `number` | `0.8` | Opacity (0-1) |
| `mouseInteractive` | `boolean` | `true` | Mouse Interactive |

## Usage

```jsx
import Plasma from './Plasma';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <Plasma 
    color="#ff6b35"
    speed={0.6}
    direction="forward"
    scale={1.1}
    opacity={0.8}
    mouseInteractive={true}
  />
</div>
```

## Suggested Use Cases

- Hero backgrounds
- Elegant backgrounds
- Premium visuals
- Landing page sections
