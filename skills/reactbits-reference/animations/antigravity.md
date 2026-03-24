# Antigravity

> 3D antigravity particle field that repels from the cursor with smooth motion.

**Category**: Animations  
**Docs**: https://reactbits.dev/animations/antigravity

## Dependencies

```bash
npm install three @react-three/fiber
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `count` | `number` | `300` | Count |
| `magnetRadius` | `number` | `6` | Magnet Radius |
| `ringRadius` | `number` | `7` | Ring Radius |
| `waveSpeed` | `number` | `0.4` | Wave Speed |
| `waveAmplitude` | `number` | `1` | Wave Amplitude |
| `particleSize` | `number` | `1.5` | Particle Size |
| `lerpSpeed` | `number` | `0.05` | Lerp Speed |
| `color` | `any` | `'#FF9FFC'` | Primary color |
| `autoAnimate` | `boolean` | `true` | Auto Animate |
| `particleVariance` | `number` | `1` | Particle Variance |

## Usage

```jsx
import Antigravity from './Antigravity';

<div style={{ width: '100%', height: '400px', position: 'relative' }}>
  <Antigravity
    count={300}
    magnetRadius={6}
    ringRadius={7}
    waveSpeed={0.4}
    waveAmplitude={1}
    particleSize={1.5}
    lerpSpeed={0.05}
    color={'#FF9FFC'}
    autoAnimate={true}
    particleVariance={1}
  />
</div>
```

## Suggested Use Cases

- Custom cursor effects
- Creative landing pages
