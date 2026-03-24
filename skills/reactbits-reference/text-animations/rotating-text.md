# RotatingText

> Cycles through multiple phrases with 3D rotate / flip transitions.

**Category**: Text Animations  
**Docs**: https://reactbits.dev/text-animations/rotating-text

## Dependencies

```bash
npm install motion
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `texts` | `array` | `['React', 'Bits', 'Is', 'Cool!']` | Texts |
| `mainClassName` | `string` | `"px-2 sm:px-2 md:px-3 bg-cyan-300 text-black overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg"` | Main Class Name |
| `staggerFrom` | `any` | `"last"` | Stagger From |
| `initial` | `object` | `{ y: "100%" }` | Initial |
| `animate` | `object` | `{ y: 0 }` | Animate |
| `exit` | `object` | `{ y: "-120%" }` | Exit |
| `staggerDuration` | `number` | `0.025` | Stagger Duration |
| `splitLevelClassName` | `string` | `"overflow-hidden pb-0.5 sm:pb-1 md:pb-1"` | Split Level Class Name |
| `transition` | `object` | `{ type: "spring", damping: 30, stiffness: 400 }` | Transition |
| `rotationInterval` | `number` | `2000` | Rotation Interval |

## Usage

```jsx
import RotatingText from './RotatingText'
  
<RotatingText
  texts={['React', 'Bits', 'Is', 'Cool!']}
  mainClassName="px-2 sm:px-2 md:px-3 bg-cyan-300 text-black overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg"
  staggerFrom={"last"}
  initial={{ y: "100%" }}
  animate={{ y: 0 }}
  exit={{ y: "-120%" }}
  staggerDuration={0.025}
  splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
  transition={{ type: "spring", damping: 30, stiffness: 400 }}
  rotationInterval={2000}
/>
```

## Suggested Use Cases

- Hero section headlines
- Dynamic content switching
- Landing pages
