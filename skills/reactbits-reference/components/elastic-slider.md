# ElasticSlider

> Slider handle stretches elastically then snaps with spring physics.

**Category**: Components  
**Docs**: https://reactbits.dev/components/elastic-slider

## Dependencies

```bash
npm install motion
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `leftIcon` | `any` | `<` | Left Icon |

## Usage

```jsx
import ElasticSlider from './ElasticSlider'
  
<ElasticSlider
  leftIcon={<>...your icon...</>}
  rightIcon={<>...your icon...</>}
  startingValue={500}
  defaultValue={750}
  maxValue={1000}
  isStepped
  stepSize={10}
/>
```

## Suggested Use Cases

- Modern web apps
