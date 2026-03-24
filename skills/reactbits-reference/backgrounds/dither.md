# Dither

> Retro dithered noise shader background.

**Category**: Backgrounds  
**Docs**: https://reactbits.dev/backgrounds/dither

## Dependencies

```bash
npm install three postprocessing @react-three/fiber @react-three/postprocessing
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `waveColor` | `array` | `[0.5, 0.5, 0.5]` | Wave Color |
| `disableAnimation` | `boolean` | `false` | Disable Animation |
| `enableMouseInteraction` | `boolean` | `true` | Enable Mouse Interaction |
| `mouseRadius` | `number` | `0.3` | Mouse Radius |
| `colorNum` | `number` | `4` | Color Num |
| `waveAmplitude` | `number` | `0.3` | Wave Amplitude |
| `waveFrequency` | `number` | `3` | Wave Frequency |
| `waveSpeed` | `number` | `0.05` | Wave Speed |

## Usage

```jsx
import Dither from './Dither';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <Dither
    waveColor={[0.5, 0.5, 0.5]}
    disableAnimation={false}
    enableMouseInteraction={true}
    mouseRadius={0.3}
    colorNum={4}
    waveAmplitude={0.3}
    waveFrequency={3}
    waveSpeed={0.05}
  />
</div>
```

## Suggested Use Cases

- Hero backgrounds
- Retro aesthetics
- Landing page sections
