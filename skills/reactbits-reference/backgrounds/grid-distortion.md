# GridDistortion

> Warped grid mesh distorts smoothly reacting to cursor.

**Category**: Backgrounds  
**Docs**: https://reactbits.dev/backgrounds/grid-distortion

## Dependencies

```bash
npm install three
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `imageSrc` | `string` | `"https://picsum.photos/1920/1080?grayscale"` | Image Src |
| `grid` | `number` | `10` | Grid |
| `mouse` | `number` | `0.1` | Mouse |
| `strength` | `number` | `0.15` | Strength |
| `relaxation` | `number` | `0.9` | Relaxation |
| `className` | `string` | `"custom-class"` | Additional CSS classes |

## Usage

```jsx
import GridDistortion from './GridDistortion';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <GridDistortion
    imageSrc="https://picsum.photos/1920/1080?grayscale"
    grid={10}
    mouse={0.1}
    strength={0.15}
    relaxation={0.9}
    className="custom-class"
  />
</div>
```

## Suggested Use Cases

- Hero backgrounds
- Tech-themed sections
- Landing page sections
