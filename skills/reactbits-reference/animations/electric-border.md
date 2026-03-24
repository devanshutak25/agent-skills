# ElectricBorder

> Jittery electric energy border with animated arcs, glow and adjustable intensity.

**Category**: Animations  
**Docs**: https://reactbits.dev/animations/electric-border

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `color` | `string` | `"#7df9ff"` | Primary color |
| `speed` | `number` | `1` | Animation speed |
| `chaos` | `number` | `0.5` | Chaos |
| `thickness` | `number` | `2` | Thickness |
| `style` | `object` | `{ borderRadius: 16 }` | Inline style object |

## Usage

```jsx
// CREDIT
// Component inspired by @BalintFerenczy on X
// https://codepen.io/BalintFerenczy/pen/KwdoyEN
  
import ElectricBorder from './ElectricBorder'

<ElectricBorder
  color="#7df9ff"
  speed={1}
  chaos={0.5}
  thickness={2}
  style={{ borderRadius: 16 }}
>
  <div>
    <p style={{ margin: '6px 0 0', opacity: 0.8 }}>
      A glowing, animated border wrapper.
    </p>
  </div>
</ElectricBorder>
```

## Suggested Use Cases

- Scroll-triggered reveals
- Decorative accents
- Creative landing pages
