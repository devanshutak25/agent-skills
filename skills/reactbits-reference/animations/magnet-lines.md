# MagnetLines

> Animated field lines bend toward the cursor.

**Category**: Animations  
**Docs**: https://reactbits.dev/animations/magnet-lines

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `rows` | `number` | `9` | Rows |
| `columns` | `number` | `9` | Column count |
| `containerSize` | `string` | `"60vmin"` | Container Size |
| `lineColor` | `string` | `"tomato"` | Line Color |
| `lineWidth` | `string` | `"0.8vmin"` | Line Width |
| `lineHeight` | `string` | `"5vmin"` | Line Height |
| `baseAngle` | `number` | `0` | Base Angle |
| `style` | `object` | `{ margin: "2rem auto" }` | Inline style object |

## Usage

```jsx
import MagnetLines from './MagnetLines';

<MagnetLines
  rows={9}
  columns={9}
  containerSize="60vmin"
  lineColor="tomato"
  lineWidth="0.8vmin"
  lineHeight="5vmin"
  baseAngle={0}
  style={{ margin: "2rem auto" }}
/>
```

## Suggested Use Cases

- Custom cursor effects
- Scroll-triggered reveals
- Creative landing pages
