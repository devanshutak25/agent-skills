# CircularText

> Layouts characters around a circle with optional rotation animation.

**Category**: Text Animations  
**Docs**: https://reactbits.dev/text-animations/circular-text

## Dependencies

```bash
npm install motion
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `string` | `"REACT*BITS*COMPONENTS*"` | Text content |
| `onHover` | `string` | `"speedUp"` | On Hover |
| `spinDuration` | `number` | `20` | Spin Duration |
| `className` | `string` | `"custom-class"` | Additional CSS classes |

## Usage

```jsx
import CircularText from './CircularText';
  
<CircularText
  text="REACT*BITS*COMPONENTS*"
  onHover="speedUp"
  spinDuration={20}
  className="custom-class"
/>
```

## Suggested Use Cases

- Hero section headlines
- Dynamic content switching
- Landing pages
