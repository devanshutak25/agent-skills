# SplitText

> Splits text into characters / words for staggered entrance animation.

**Category**: Text Animations  
**Docs**: https://reactbits.dev/text-animations/split-text

## Dependencies

```bash
npm install gsap @gsap/react
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `string` | `"Hello, GSAP!"` | Text content |
| `className` | `string` | `"text-2xl font-semibold text-center"` | Additional CSS classes |
| `delay` | `number` | `100` | Delay before start |
| `duration` | `number` | `0.6` | Animation duration |
| `ease` | `string` | `"power3.out"` | Easing function |
| `splitType` | `string` | `"chars"` | Split mode (chars/words/lines) |
| `from` | `object` | `{ opacity: 0, y: 40 }` | Start animation state |
| `to` | `object` | `{ opacity: 1, y: 0 }` | End animation state |
| `threshold` | `number` | `0.1` | Intersection Observer threshold |
| `rootMargin` | `string` | `"-100px"` | Intersection Observer root margin |
| `textAlign` | `string` | `"center"` | Text Align |
| `onLetterAnimationComplete` | `any` | `handleAnimationComplete` | On Letter Animation Complete |

## Usage

```jsx
import SplitText from "./SplitText";

const handleAnimationComplete = () => {
  console.log('All letters have animated!');
};

<SplitText
  text="Hello, GSAP!"
  className="text-2xl font-semibold text-center"
  delay={100}
  duration={0.6}
  ease="power3.out"
  splitType="chars"
  from={{ opacity: 0, y: 40 }}
  to={{ opacity: 1, y: 0 }}
  threshold={0.1}
  rootMargin="-100px"
  textAlign="center"
  onLetterAnimationComplete={handleAnimationComplete}
/>
```

## Suggested Use Cases

- Hero section headlines
- Landing pages
