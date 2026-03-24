# Carousel

> Responsive carousel with touch gestures, looping and transitions.

**Category**: Components  
**Docs**: https://reactbits.dev/components/carousel

## Dependencies

```bash
npm install motion
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `baseWidth` | `number` | `300` | Base Width |
| `autoplay` | `boolean` | `true` | Enable autoplay |
| `autoplayDelay` | `number` | `3000` | Autoplay Delay |
| `pauseOnHover` | `boolean` | `true` | Pause On Hover |
| `loop` | `boolean` | `true` | Enable looping |
| `round` | `boolean` | `false` | Round |

## Usage

```jsx
import Carousel from './Carousel'

<div style={{ height: '600px', position: 'relative' }}>
  <Carousel
    baseWidth={300}
    autoplay={true}
    autoplayDelay={3000}
    pauseOnHover={true}
    loop={true}
    round={false}
  />
</div>
```

## Suggested Use Cases

- Image galleries
- Modern web apps
