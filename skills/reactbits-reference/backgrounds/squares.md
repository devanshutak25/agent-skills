# Squares

> Animated squares with scaling + direction customization.

**Category**: Backgrounds  
**Docs**: https://reactbits.dev/backgrounds/squares

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `speed` | `number` | `0.5` | Animation speed |
| `squareSize` | `number` | `40` | Square Size |
| `direction` | `string` | `"diagonal"` | Animation direction |
| `up` | `boolean` | `true` | Up |
| `down` | `boolean` | `true` | Down |
| `left` | `boolean` | `true` | Left |
| `right` | `boolean` | `true` | Right |
| `diagonal` | `boolean` | `true` | Diagonal |
| `borderColor` | `string` | `"#fff"` | Border Color |
| `hoverFillColor` | `string` | `"#222"` | Hover Fill Color |

## Usage

```jsx
import Squares from './Squares';
  
<Squares 
speed={0.5} 
squareSize={40}
direction='diagonal' // up, down, left, right, diagonal
borderColor='#fff'
hoverFillColor='#222'
/>
```

## Suggested Use Cases

- Hero backgrounds
- Tech-themed sections
- Landing page sections
