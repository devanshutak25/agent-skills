# Aurora

> Flowing aurora gradient background.

**Category**: Backgrounds  
**Docs**: https://reactbits.dev/backgrounds/aurora

## Dependencies

```bash
npm install ogl
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `colorStops` | `array` | `["#3A29FF", "#FF94B4", "#FF3232"]` | Gradient color stops |
| `blend` | `number` | `0.5` | Blend factor |
| `amplitude` | `number` | `1.0` | Wave amplitude |
| `speed` | `number` | `0.5` | Animation speed |

## Usage

```jsx
import Aurora from './Aurora';
  
<Aurora
  colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
  blend={0.5}
  amplitude={1.0}
  speed={0.5}
/>
```

## Suggested Use Cases

- Hero backgrounds
- Elegant backgrounds
- Landing page sections
