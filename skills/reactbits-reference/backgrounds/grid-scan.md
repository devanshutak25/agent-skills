# GridScan

> Animated grid room 3D scan effect and cool interactions.

**Category**: Backgrounds  
**Docs**: https://reactbits.dev/backgrounds/grid-scan

## Dependencies

```bash
npm install three face-api.js
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `sensitivity` | `number` | `0.55` | Sensitivity |
| `lineThickness` | `number` | `1` | Line Thickness |
| `linesColor` | `string` | `"#392e4e"` | Lines Color |
| `gridScale` | `number` | `0.1` | Grid Scale |
| `scanColor` | `string` | `"#FF9FFC"` | Scan Color |
| `scanOpacity` | `number` | `0.4` | Scan Opacity |
| `enablePost` | `boolean` | `true` | Enable Post |
| `bloomIntensity` | `number` | `0.6` | Bloom Intensity |
| `chromaticAberration` | `number` | `0.002` | Chromatic Aberration |
| `noiseIntensity` | `number` | `0.01` | Noise Intensity |

## Usage

```jsx
import GridScan from './GridScan';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <GridScan
    sensitivity={0.55}
    lineThickness={1}
    linesColor="#392e4e"
    gridScale={0.1}
    scanColor="#FF9FFC"
    scanOpacity={0.4}
    enablePost
    bloomIntensity={0.6}
    chromaticAberration={0.002}
    noiseIntensity={0.01}
  />
</div>
```

## Suggested Use Cases

- Hero backgrounds
- Tech-themed sections
- Landing page sections
