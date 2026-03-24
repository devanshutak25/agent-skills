# Orb

> Floating energy orb with customizable hover effect.

**Category**: Backgrounds  
**Docs**: https://reactbits.dev/backgrounds/orb

## Dependencies

```bash
npm install ogl
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `hoverIntensity` | `number` | `0.5` | Hover Intensity |
| `rotateOnHover` | `boolean` | `true` | Rotate On Hover |
| `hue` | `number` | `0` | Hue |
| `forceHoverState` | `boolean` | `false` | Force Hover State |

## Usage

```jsx
import Orb from './Orb';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <Orb
    hoverIntensity={0.5}
    rotateOnHover={true}
    hue={0}
    forceHoverState={false}
  />
</div>
```

## Suggested Use Cases

- Hero backgrounds
- Landing page sections
