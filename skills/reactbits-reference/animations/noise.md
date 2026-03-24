# Noise

> Animated film grain / noise overlay adding subtle texture and motion.

**Category**: Animations  
**Docs**: https://reactbits.dev/animations/noise

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `patternSize` | `number` | `250` | Pattern Size |
| `patternScaleX` | `number` | `1` | Pattern Scale X |
| `patternScaleY` | `number` | `1` | Pattern Scale Y |
| `patternRefreshInterval` | `number` | `2` | Pattern Refresh Interval |
| `patternAlpha` | `number` | `15` | Pattern Alpha |

## Usage

```jsx
import Noise from './Noise;'

<div style={{width: '600px', height: '400px', position: 'relative', overflow: 'hidden'}}>
  <Noise
    patternSize={250}
    patternScaleX={1}
    patternScaleY={1}
    patternRefreshInterval={2}
    patternAlpha={15}
  />
</div>
```

## Suggested Use Cases

- Scroll-triggered reveals
- Creative landing pages
