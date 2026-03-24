# Galaxy

> Parallax realistic starfield with pointer interactions.

**Category**: Backgrounds  
**Docs**: https://reactbits.dev/backgrounds/galaxy

## Dependencies

```bash
npm install ogl
```

## Usage

```jsx
import Galaxy from './Galaxy';

// Basic usage
<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <Galaxy />
</div>

// With custom prop values
<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <Galaxy 
    mouseRepulsion={true}
    mouseInteraction={true}
    density={1.5}
    glowIntensity={0.5}
    saturation={0.8}
    hueShift={240}
  />
</div>
```

## Suggested Use Cases

- Hero backgrounds
- Ambient effects
- Landing page sections
