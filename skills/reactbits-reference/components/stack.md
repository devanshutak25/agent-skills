# Stack

> Layered stack with swipe animations, autoplay and smooth transitions.

**Category**: Components  
**Docs**: https://reactbits.dev/components/stack

## Dependencies

```bash
npm install motion
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `randomRotation` | `boolean` | `true` | Random Rotation |
| `sensitivity` | `number` | `180` | Sensitivity |
| `sendToBackOnClick` | `boolean` | `true` | Send To Back On Click |
| `cards` | `any` | `images.map((src, i) =` | Cards |

## Usage

```jsx
import Stack from './Stack'

const images = [
  "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?q=80&w=500&auto=format",
  "https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=500&auto=format",
  "https://images.unsplash.com/photo-1452626212852-811d58933cae?q=80&w=500&auto=format",
  "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?q=80&w=500&auto=format"
];

<div style={{ width: 208, height: 208 }}>
  <Stack
    randomRotation={true}
    sensitivity={180}
    sendToBackOnClick={true}
    cards={images.map((src, i) => (
      <img 
        key={i} 
        src={src} 
        alt={\
```

## Suggested Use Cases

- Content feeds
- Modern web apps
