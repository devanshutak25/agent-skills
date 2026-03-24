# AnimatedContent

> Wrapper that animates any children on scroll or mount with configurable direction, distance, duration, easing and disappear options.

**Category**: Animations  
**Docs**: https://reactbits.dev/animations/animated-content

## Dependencies

```bash
npm install gsap
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `distance` | `number` | `150` | Travel distance (px) |
| `direction` | `string` | `"horizontal"` | Animation direction |
| `reverse` | `boolean` | `false` | Reverse direction |
| `duration` | `number` | `1.2` | Animation duration |
| `ease` | `string` | `"bounce.out"` | Easing function |
| `initialOpacity` | `number` | `0.2` | Starting opacity |
| `animateOpacity` | `boolean` | `true` | Animate opacity |
| `scale` | `number` | `1.1` | Scale multiplier |
| `threshold` | `number` | `0.2` | Intersection Observer threshold |
| `delay` | `number` | `0.3` | Delay before start |

## Usage

```jsx
import AnimatedContent from './AnimatedContent'

<AnimatedContent
  distance={150}
  direction="horizontal"
  reverse={false}
  duration={1.2}
  ease="bounce.out"
  initialOpacity={0.2}
  animateOpacity
  scale={1.1}
  threshold={0.2}
  delay={0.3}
>
  <div>Content to Animate</div>
</AnimatedContent>
```

## Suggested Use Cases

- Scroll-triggered reveals
- Creative landing pages
