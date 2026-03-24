# Lightning

> Procedural lightning bolts with branching and glow flicker.

**Category**: Backgrounds  
**Docs**: https://reactbits.dev/backgrounds/lightning

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `hue` | `number` | `220` | Hue |
| `xOffset` | `number` | `0` | X Offset |
| `speed` | `number` | `1` | Animation speed |
| `intensity` | `number` | `1` | Effect intensity |
| `size` | `number` | `1` | Element size |

## Usage

```jsx
import Lightning from './Lightning';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <Lightning
    hue={220}
    xOffset={0}
    speed={1}
    intensity={1}
    size={1}
  />
</div>
```

## Suggested Use Cases

- Hero backgrounds
- Landing page sections
