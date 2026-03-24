# CircularGallery

> Circular orbit gallery rotating images.

**Category**: Components  
**Docs**: https://reactbits.dev/components/circular-gallery

## Dependencies

```bash
npm install ogl
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `bend` | `number` | `3` | Bend |
| `textColor` | `string` | `"#ffffff"` | Text Color |
| `borderRadius` | `number` | `0.05` | Border Radius |
| `scrollEase` | `number` | `0.02` | Scroll Ease |

## Usage

```jsx
import CircularGallery from './CircularGallery'

<div style={{ height: '600px', position: 'relative' }}>
  <CircularGallery bend={3} textColor="#ffffff" borderRadius={0.05} scrollEase={0.02}/>
</div>
```

## Suggested Use Cases

- Image galleries
- Modern web apps
