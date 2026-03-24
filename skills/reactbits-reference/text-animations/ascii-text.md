# ASCIIText

> Renders text with an animated ASCII background for a retro feel.

**Category**: Text Animations  
**Docs**: https://reactbits.dev/text-animations/ascii-text

## Dependencies

```bash
npm install three
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `string` | `"hello_world"` | Text content |
| `enableWaves` | `boolean` | `true` | Enable Waves |
| `asciiFontSize` | `number` | `8` | Ascii Font Size |

## Usage

```jsx
// Component ported and enhanced from https://codepen.io/JuanFuentes/pen/eYEeoyE
  
import ASCIIText from './ASCIIText';

<ASCIIText
  text='hello_world'
  enableWaves={true}
  asciiFontSize={8}
/>
```

## Suggested Use Cases

- Hero section headlines
- Landing pages
