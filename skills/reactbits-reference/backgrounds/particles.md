# Particles

> Configurable particle system.

**Category**: Backgrounds  
**Docs**: https://reactbits.dev/backgrounds/particles

## Dependencies

```bash
npm install ogl
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `particleColors` | `array` | `['#ffffff', '#ffffff']` | Particle Colors |
| `particleCount` | `number` | `200` | Number of particles |
| `particleSpread` | `number` | `10` | Particle Spread |
| `speed` | `number` | `0.1` | Animation speed |
| `particleBaseSize` | `number` | `100` | Particle Base Size |
| `moveParticlesOnHover` | `boolean` | `true` | Move Particles On Hover |
| `alphaParticles` | `boolean` | `false` | Alpha Particles |
| `disableRotation` | `boolean` | `false` | Disable Rotation |

## Usage

```jsx
import Particles from './Particles';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <Particles
    particleColors={['#ffffff', '#ffffff']}
    particleCount={200}
    particleSpread={10}
    speed={0.1}
    particleBaseSize={100}
    moveParticlesOnHover={true}
    alphaParticles={false}
    disableRotation={false}
  />
</div>
```

## Suggested Use Cases

- Hero backgrounds
- Ambient effects
- Landing page sections
