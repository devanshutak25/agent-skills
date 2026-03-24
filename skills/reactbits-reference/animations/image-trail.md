# ImageTrail

> Cursor-based image trail with several built-in variants.

**Category**: Animations  
**Docs**: https://reactbits.dev/animations/image-trail

## Dependencies

```bash
npm install gsap
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `key` | `any` | `key` | Key |
| `items` | `array` | `[       'https://picsum.photos/id/287/300/300',...` | Items array |
| `variant` | `number` | `1` | Variant |

## Usage

```jsx
import ImageTrail from './ImageTrail;'

<div style={{ height: '500px', position: 'relative', overflow: 'hidden'}}>
  <ImageTrail
    key={key}
    items={[
      'https://picsum.photos/id/287/300/300',
      'https://picsum.photos/id/1001/300/300',
      'https://picsum.photos/id/1025/300/300',
      'https://picsum.photos/id/1026/300/300',
      'https://picsum.photos/id/1027/300/300',
      'https://picsum.photos/id/1028/300/300',
      'https://picsum.photos/id/1029/300/300',
      'https://picsum.photos/id/1030/300/300',
      // ...
    ]}
    variant={1}
  />
</div>
```

## Suggested Use Cases

- Custom cursor effects
- Creative landing pages
