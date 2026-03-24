# BounceCards

> Cards bounce that bounce in on mount.

**Category**: Components  
**Docs**: https://reactbits.dev/components/bounce-cards

## Dependencies

```bash
npm install gsap
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `"custom-bounceCards"` | Additional CSS classes |
| `images` | `any` | `images` | Image sources array |
| `containerWidth` | `number` | `500` | Container Width |
| `containerHeight` | `number` | `250` | Container Height |
| `animationDelay` | `number` | `1` | Animation Delay |
| `animationStagger` | `number` | `0.08` | Animation Stagger |
| `easeType` | `string` | `"elastic.out(1, 0.5)"` | Ease Type |
| `transformStyles` | `any` | `transformStyles` | Transform Styles |
| `enableHover` | `boolean` | `false` | Enable Hover |

## Usage

```jsx
import BounceCards from './BounceCards'

const images = [
  "https://picsum.photos/400/400?grayscale",
  "https://picsum.photos/500/500?grayscale",
  "https://picsum.photos/600/600?grayscale",
  "https://picsum.photos/700/700?grayscale",
  "https://picsum.photos/300/300?grayscale"
];

const transformStyles = [
  "rotate(5deg) translate(-150px)",
  "rotate(0deg) translate(-70px)",
  "rotate(-5deg)",
  "rotate(5deg) translate(70px)",
  "rotate(-5deg) translate(150px)"
];

<BounceCards
  className="custom-bounceCards"
  images={images}
  containerWidth={500}
  containerHeight={250}
  animationDelay={1}
  animationStagger={0.08}
  easeType="elastic.out(1, 0.5)"
  transformStyles={transformStyles}
  enableHover={false}
/>
```

## Suggested Use Cases

- Product showcases
- Modern web apps
