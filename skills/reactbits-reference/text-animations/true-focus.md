# TrueFocus

> Applies dynamic blur / clarity based over a series of words in order.

**Category**: Text Animations  
**Docs**: https://reactbits.dev/text-animations/true-focus

## Dependencies

```bash
npm install motion
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `sentence` | `string` | `"True Focus"` | Sentence |
| `manualMode` | `boolean` | `false` | Manual Mode |
| `blurAmount` | `number` | `5` | Blur Amount |
| `borderColor` | `string` | `"red"` | Border Color |
| `animationDuration` | `number` | `2` | Animation Duration |
| `pauseBetweenAnimations` | `number` | `1` | Pause Between Animations |

## Usage

```jsx
import TrueFocus from './TrueFocus';

<TrueFocus 
sentence="True Focus"
manualMode={false}
blurAmount={5}
borderColor="red"
animationDuration={2}
pauseBetweenAnimations={1}
/>
```

## Suggested Use Cases

- Hero section headlines
- Landing pages
