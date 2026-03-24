# Counter

> Flexible animated counter supporting increments + easing.

**Category**: Components  
**Docs**: https://reactbits.dev/components/counter

## Dependencies

```bash
npm install motion
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | `1` | Value |
| `places` | `array` | `[100, 10, 1]` | Places |
| `fontSize` | `number` | `80` | Font size |
| `padding` | `number` | `5` | Padding |
| `gap` | `number` | `10` | Item spacing |
| `textColor` | `string` | `"white"` | Text Color |
| `fontWeight` | `number` | `900` | Font Weight |

## Usage

```jsx
import Counter from './Counter';

<Counter
  value={1}
  places={[100, 10, 1]}
  fontSize={80}
  padding={5}
  gap={10}
  textColor="white"
  fontWeight={900}
/>
```

## Suggested Use Cases

- Modern web apps
