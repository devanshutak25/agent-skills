# Shuffle

> Animated text reveal where characters shuffle before settling.

**Category**: Text Animations  
**Docs**: https://reactbits.dev/text-animations/shuffle

## Dependencies

```bash
npm install gsap @gsap/react
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `string` | `"Hello World"` | Text content |
| `shuffleDirection` | `string` | `"right"` | Shuffle Direction |
| `duration` | `number` | `0.35` | Animation duration |
| `animationMode` | `string` | `"evenodd"` | Animation Mode |
| `shuffleTimes` | `number` | `1` | Shuffle Times |
| `ease` | `string` | `"power3.out"` | Easing function |
| `stagger` | `number` | `0.03` | Stagger |
| `threshold` | `number` | `0.1` | Intersection Observer threshold |
| `triggerOnce` | `boolean` | `true` | Trigger Once |
| `triggerOnHover` | `boolean` | `true` | Trigger On Hover |
| `respectReducedMotion` | `boolean` | `true` | Respect Reduced Motion |

## Usage

```jsx
import Shuffle from './Shuffle';

<Shuffle
  text="Hello World"
  shuffleDirection="right"
  duration={0.35}
  animationMode="evenodd"
  shuffleTimes={1}
  ease="power3.out"
  stagger={0.03}
  threshold={0.1}
  triggerOnce={true}
  triggerOnHover={true}
  respectReducedMotion={true}
/>
```

## Suggested Use Cases

- Hero section headlines
- Landing pages
