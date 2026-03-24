# BlurText

> Text starts blurred then crisply resolves for a soft-focus reveal effect.

**Category**: Text Animations  
**Docs**: https://reactbits.dev/text-animations/blur-text

## Dependencies

```bash
npm install motion
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `string` | `"Isn't this so cool?!"` | Text content |
| `delay` | `number` | `150` | Delay before start |
| `animateBy` | `string` | `"words"` | Animate By |
| `direction` | `string` | `"top"` | Animation direction |
| `onAnimationComplete` | `any` | `handleAnimationComplete` | On Animation Complete |
| `className` | `string` | `"text-2xl mb-8"` | Additional CSS classes |

## Usage

```jsx
import BlurText from "./BlurText";

const handleAnimationComplete = () => {
  console.log('Animation completed!');
};

<BlurText
  text="Isn't this so cool?!"
  delay={150}
  animateBy="words"
  direction="top"
  onAnimationComplete={handleAnimationComplete}
  className="text-2xl mb-8"
/>
```

## Suggested Use Cases

- Hero section headlines
- Landing pages
