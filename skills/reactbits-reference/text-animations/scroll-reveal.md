# ScrollReveal

> Text gently unblurs and reveals on scroll.

**Category**: Text Animations  
**Docs**: https://reactbits.dev/text-animations/scroll-reveal

## Dependencies

```bash
npm install gsap
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `baseOpacity` | `number` | `0` | Base Opacity |
| `enableBlur` | `boolean` | `true` | Enable Blur |
| `baseRotation` | `number` | `5` | Base Rotation |
| `blurStrength` | `number` | `10` | Blur Strength |

## Usage

```jsx
import ScrollReveal from './ScrollReveal';

<ScrollReveal
  baseOpacity={0}
  enableBlur={true}
  baseRotation={5}
  blurStrength={10}
>
  When does a man die? When he is hit by a bullet? No! When he suffers a disease?
  No! When he ate a soup made out of a poisonous mushroom?
  No! A man dies when he is forgotten!
</ScrollReveal>
```

## Suggested Use Cases

- Hero section headlines
- Scroll-driven storytelling
- Landing pages
