# LiquidChrome

> Liquid metallic chrome shader with flowing reflective surface.

**Category**: Backgrounds  
**Docs**: https://reactbits.dev/backgrounds/liquid-chrome

## Dependencies

```bash
npm install ogl
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `baseColor` | `array` | `[0.1, 0.1, 0.1]` | Base Color |
| `speed` | `number` | `1` | Animation speed |
| `amplitude` | `number` | `0.6` | Wave amplitude |
| `interactive` | `boolean` | `true` | Interactive |

## Usage

```jsx
import LiquidChrome from './LiquidChrome';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <LiquidChrome
    baseColor={[0.1, 0.1, 0.1]}
    speed={1}
    amplitude={0.6}
    interactive={true}
  />
</div>
```

## Suggested Use Cases

- Hero backgrounds
- Premium visuals
- Landing page sections
