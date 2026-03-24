# FaultyTerminal

> Terminal CRT scanline squares effect with flicker + noise.

**Category**: Backgrounds  
**Docs**: https://reactbits.dev/backgrounds/faulty-terminal

## Dependencies

```bash
npm install ogl
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `scale` | `number` | `1.5` | Scale multiplier |
| `gridMul` | `array` | `[2, 1]` | Grid Mul |
| `digitSize` | `number` | `1.2` | Digit Size |
| `timeScale` | `number` | `1` | Time Scale |
| `pause` | `boolean` | `false` | Pause |
| `scanlineIntensity` | `number` | `1` | Scanline Intensity |
| `glitchAmount` | `number` | `1` | Glitch Amount |
| `flickerAmount` | `number` | `1` | Flicker Amount |
| `noiseAmp` | `number` | `1` | Noise Amp |
| `chromaticAberration` | `number` | `0` | Chromatic Aberration |
| `dither` | `number` | `0` | Dither |
| `curvature` | `number` | `0` | Curvature |
| `tint` | `string` | `"#ffffff"` | Tint |
| `mouseReact` | `boolean` | `true` | Mouse React |
| `mouseStrength` | `number` | `0.5` | Mouse Strength |
| `pageLoadAnimation` | `boolean` | `false` | Page Load Animation |
| `brightness` | `number` | `1` | Brightness |

## Usage

```jsx
import FaultyTerminal from './FaultyTerminal';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <FaultyTerminal
    scale={1.5}
    gridMul={[2, 1]}
    digitSize={1.2}
    timeScale={1}
    pause={false}
    scanlineIntensity={1}
    glitchAmount={1}
    flickerAmount={1}
    noiseAmp={1}
    chromaticAberration={0}
    dither={0}
    curvature={0}
    tint="#ffffff"
    mouseReact={true}
    mouseStrength={0.5}
    pageLoadAnimation={false}
    brightness={1}
  />
</div>
```

## Suggested Use Cases

- Hero backgrounds
- Tech-themed sections
- Retro aesthetics
- Landing page sections
