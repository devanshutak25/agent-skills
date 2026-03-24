# Ribbons

> Flowing responsive ribbons/cursor trail driven by physics and pointer motion.

**Category**: Animations  
**Docs**: https://reactbits.dev/animations/ribbons

## Dependencies

```bash
npm install ogl
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `baseThickness` | `number` | `30` | Base Thickness |
| `colors` | `array` | `['#ffffff']` | Color array |
| `speedMultiplier` | `number` | `0.5` | Speed Multiplier |
| `maxAge` | `number` | `500` | Max Age |
| `enableFade` | `boolean` | `false` | Enable Fade |
| `enableShaderEffect` | `boolean` | `true` | Enable Shader Effect |

## Usage

```jsx
import Ribbons from './Ribbons';

<div style={{ height: '500px', position: 'relative', overflow: 'hidden'}}>
  <Ribbons
    baseThickness={30}
    colors={['#ffffff']}
    speedMultiplier={0.5}
    maxAge={500}
    enableFade={false}
    enableShaderEffect={true}
  />
</div>
```

## Suggested Use Cases

- Custom cursor effects
- Creative landing pages
