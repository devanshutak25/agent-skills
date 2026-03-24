# ScrollFloat

> Text gently floats / parallax shifts on scroll.

**Category**: Text Animations  
**Docs**: https://reactbits.dev/text-animations/scroll-float

## Dependencies

```bash
npm install gsap
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `animationDuration` | `number` | `1` | Animation Duration |
| `ease` | `string` | `"back.inOut(2)"` | Easing function |
| `scrollStart` | `string` | `"center bottom+=50%"` | Scroll Start |
| `scrollEnd` | `string` | `"bottom bottom-=40%"` | Scroll End |
| `stagger` | `number` | `0.03` | Stagger |

## Usage

```jsx
import ScrollFloat from './ScrollFloat';

<ScrollFloat
  animationDuration={1}
  ease='back.inOut(2)'
  scrollStart='center bottom+=50%'
  scrollEnd='bottom bottom-=40%'
  stagger={0.03}
>
  React Bits
</ScrollFloat>
```

## Suggested Use Cases

- Hero section headlines
- Scroll-driven storytelling
- Landing pages
