# GradientText

> Animated gradient sweep across live text with speed and color control.

**Category**: Text Animations  
**Docs**: https://reactbits.dev/text-animations/gradient-text

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `colors` | `array` | `["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#...` | Color array |
| `animationSpeed` | `number` | `3` | Animation Speed |
| `showBorder` | `boolean` | `false` | Show Border |
| `className` | `string` | `"custom-class"` | Additional CSS classes |

## Usage

```jsx
import GradientText from './GradientText'

// For a smoother animation, the gradient should start and end with the same color
  
<GradientText
  colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
  animationSpeed={3}
  showBorder={false}
  className="custom-class"
>
  Add a splash of color!
</GradientText>
```

## Suggested Use Cases

- Hero section headlines
- Landing pages
