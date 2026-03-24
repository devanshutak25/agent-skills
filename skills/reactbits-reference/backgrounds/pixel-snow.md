# PixelSnow

> Falling pixelated snow effect with customizable density and speed.

**Category**: Backgrounds  
**Docs**: https://reactbits.dev/backgrounds/pixel-snow

## Dependencies

```bash
npm install three
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `color` | `string` | `"#ffffff"` | Primary color |
| `flakeSize` | `number` | `0.01` | Flake Size |
| `minFlakeSize` | `number` | `1.25` | Min Flake Size |
| `pixelResolution` | `number` | `200` | Pixel Resolution |
| `speed` | `number` | `1.25` | Animation speed |
| `density` | `number` | `0.3` | Density |
| `direction` | `number` | `125` | Animation direction |
| `brightness` | `number` | `1` | Brightness |

## Usage

```jsx
import PixelSnow from './PixelSnow';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <PixelSnow 
    color="#ffffff"
    flakeSize={0.01}
    minFlakeSize={1.25}
    pixelResolution={200}
    speed={1.25}
    density={0.3}
    direction={125}
    brightness={1}
  />
</div>
```

## Suggested Use Cases

- Hero backgrounds
- Ambient effects
- Retro aesthetics
- Landing page sections
