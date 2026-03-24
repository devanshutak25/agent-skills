# FlyingPosters

> 3D posters rotate on scroll infinitely.

**Category**: Components  
**Docs**: https://reactbits.dev/components/flying-posters

## Dependencies

```bash
npm install ogl
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `any` | `items` | Items array |

## Usage

```jsx
import FlyingPosters from './FlyingPosters'

const items = [
  'https://picsum.photos/500/500?grayscale', 
  'https://picsum.photos/600/600?grayscale', 
  'https://picsum.photos/400/400?grayscale'
];

<div style={{ height: '600px', position: 'relative' }}>
  <FlyingPosters items={items}/>
</div>
```

## Suggested Use Cases

- Modern web apps
