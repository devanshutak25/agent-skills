# Ballpit

> Physics ball pit simulation with bouncing colorful spheres.

**Category**: Backgrounds  
**Docs**: https://reactbits.dev/backgrounds/ballpit

## Dependencies

```bash
npm install three
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `count` | `number` | `200` | Count |
| `gravity` | `number` | `0.7` | Gravity |
| `friction` | `number` | `0.8` | Friction |
| `wallBounce` | `number` | `0.95` | Wall Bounce |
| `followCursor` | `boolean` | `true` | Follow Cursor |

## Usage

```jsx
//Component inspired by Kevin Levron:
//https://x.com/soju22/status/1858925191671271801
  
import Ballpit from './Ballpit;'

<div style={{position: 'relative', overflow: 'hidden', minHeight: '500px', maxHeight: '500px', width: '100%'}}>
  <Ballpit
    count={200}
    gravity={0.7}
    friction={0.8}
    wallBounce={0.95}
    followCursor={true}
  />
</div>
```

## Suggested Use Cases

- Hero backgrounds
- Landing page sections
