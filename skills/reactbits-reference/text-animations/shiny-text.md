# ShinyText

> Metallic sheen sweeps across text producing a reflective highlight.

**Category**: Text Animations  
**Docs**: https://reactbits.dev/text-animations/shiny-text

## Dependencies

```bash
npm install motion
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `string` | `"✨ Shiny Text Effect"` | Text content |
| `speed` | `number` | `2` | Animation speed |
| `delay` | `number` | `0` | Delay before start |
| `color` | `string` | `"#b5b5b5"` | Primary color |
| `shineColor` | `string` | `"#ffffff"` | Shine Color |
| `spread` | `number` | `120` | Spread |
| `direction` | `string` | `"left"` | Animation direction |
| `yoyo` | `boolean` | `false` | Yoyo |
| `pauseOnHover` | `boolean` | `false` | Pause On Hover |

## Usage

```jsx
import ShinyText from './ShinyText';

<ShinyText
  text="✨ Shiny Text Effect"
  speed={2}
  delay={0}
  color="#b5b5b5"
  shineColor="#ffffff"
  spread={120}
  direction="left"
  yoyo={false}
  pauseOnHover={false}
/>
```

## Suggested Use Cases

- Hero section headlines
- Landing pages
