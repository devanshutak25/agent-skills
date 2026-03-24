# GhostCursor

> Semi-transparent ghost cursor that smoothly follows the real cursor with a trailing effect.

**Category**: Animations  
**Docs**: https://reactbits.dev/animations/ghost-cursor

## Dependencies

```bash
npm install three
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `Visuals` | `boolean` | `true` | Visuals |
| `color` | `string` | `"#B19EEF"` | Primary color |
| `brightness` | `number` | `1` | Brightness |
| `edgeIntensity` | `number` | `0` | Edge Intensity |
| `Trail` | `boolean` | `true` | Trail |
| `and` | `boolean` | `true` | And |
| `motion` | `boolean` | `true` | Motion |
| `trailLength` | `number` | `50` | Trail Length |
| `inertia` | `number` | `0.5` | Inertia |
| `Post` | `boolean` | `true` | Post |
| `processing` | `boolean` | `true` | Processing |
| `grainIntensity` | `number` | `0.05` | Grain Intensity |
| `bloomStrength` | `number` | `0.1` | Bloom Strength |
| `bloomRadius` | `number` | `1.0` | Bloom Radius |
| `bloomThreshold` | `number` | `0.025` | Bloom Threshold |
| `Fade` | `boolean` | `true` | Fade |
| `out` | `boolean` | `true` | Out |
| `behavior` | `boolean` | `true` | Behavior |
| `fadeDelayMs` | `number` | `1000` | Fade Delay Ms |
| `fadeDurationMs` | `number` | `1500` | Fade Duration Ms |

## Usage

```jsx
import GhostCursor from './GhostCursor'

<div style={{ height: 600, position: 'relative' }}>
  <GhostCursor
    // Visuals
    color="#B19EEF"
    brightness={1}
    edgeIntensity={0}

    // Trail and motion
    trailLength={50}
    inertia={0.5}

    // Post-processing
    grainIntensity={0.05}
    bloomStrength={0.1}
    bloomRadius={1.0}
    bloomThreshold={0.025}

    // Fade-out behavior
    fadeDelayMs={1000}
    fadeDurationMs={1500}
  />
</div>
```

## Suggested Use Cases

- Custom cursor effects
- Creative landing pages
