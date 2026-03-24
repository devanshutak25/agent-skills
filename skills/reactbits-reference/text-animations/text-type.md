# TextType

> Typewriter effect with blinking cursor and adjustable typing cadence.

**Category**: Text Animations  
**Docs**: https://reactbits.dev/text-animations/text-type

## Dependencies

```bash
npm install gsap
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `array` | `["Text typing effect", "for your websites", "Ha...` | Text content |
| `typingSpeed` | `number` | `75` | Typing Speed |
| `pauseDuration` | `number` | `1500` | Pause Duration |
| `showCursor` | `boolean` | `true` | Show Cursor |
| `cursorCharacter` | `string` | `"\|"` | Cursor Character |

## Usage

```jsx
import TextType from './TextType';

<TextType 
  text={["Text typing effect", "for your websites", "Happy coding!"]}
  typingSpeed={75}
  pauseDuration={1500}
  showCursor={true}
  cursorCharacter="|"
/>
```

## Suggested Use Cases

- Hero section headlines
- Interactive text
- Dynamic content switching
- Landing pages
