# ScrambledText

> Detects cursor position and applies a distortion effect to text.

**Category**: Text Animations  
**Docs**: https://reactbits.dev/text-animations/scrambled-text

## Dependencies

```bash
npm install gsap
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `"scrambled-text-demo"` | Additional CSS classes |
| `radius` | `number` | `100` | Radius value |
| `duration` | `number` | `1.2` | Animation duration |
| `speed` | `number` | `0.5` | Animation speed |
| `scrambleChars` | `any` | `.:` | Scramble Chars |

## Usage

```jsx
// Component inspired by Tom Miller from the GSAP community
// https://codepen.io/creativeocean/pen/NPWLwJM

import ScrambledText from './ScrambledText';
  
<ScrambledText
  className="scrambled-text-demo"
  radius={100}
  duration={1.2}
  speed={0.5}
  scrambleChars={.:}
>
  Lorem ipsum dolor sit amet consectetur adipisicing elit. 
  Similique pariatur dignissimos porro eius quam doloremque 
  et enim velit nobis maxime.
</ScrambledText>
```

## Suggested Use Cases

- Hero section headlines
- Interactive text
- Landing pages
