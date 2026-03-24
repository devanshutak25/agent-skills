# FadeContent

> Simple directional fade / slide entrance / exit wrapper with threshold-based activation.

**Category**: Animations  
**Docs**: https://reactbits.dev/animations/fade-content

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `blur` | `boolean` | `true` | Blur |
| `duration` | `number` | `1000` | Animation duration |
| `easing` | `string` | `"ease-out"` | Easing function |
| `initialOpacity` | `number` | `0` | Starting opacity |

## Usage

```jsx
import FadeContent from './FadeContent'
  
<FadeContent blur={true} duration={1000} easing="ease-out" initialOpacity={0}>
  {/* Anything placed inside this container will be fade into view */}
</FadeContent>
```

## Suggested Use Cases

- Scroll-triggered reveals
- Creative landing pages
