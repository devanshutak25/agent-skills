# Threads

> Animated pattern of lines forming a fabric-like motion.

**Category**: Backgrounds  
**Docs**: https://reactbits.dev/backgrounds/threads

## Dependencies

```bash
npm install ogl
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `amplitude` | `number` | `1` | Wave amplitude |
| `distance` | `number` | `0` | Travel distance (px) |
| `enableMouseInteraction` | `boolean` | `true` | Enable Mouse Interaction |

## Usage

```jsx
import Threads from './Threads';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <Threads
    amplitude={1}
    distance={0}
    enableMouseInteraction={true}
  />
</div>
```

## Suggested Use Cases

- Hero backgrounds
- Landing page sections
