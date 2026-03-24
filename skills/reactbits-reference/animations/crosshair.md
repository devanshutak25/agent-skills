# Crosshair

> Custom crosshair cursor with tracking, and link hover effects.

**Category**: Animations  
**Docs**: https://reactbits.dev/animations/crosshair

## Dependencies

```bash
npm install gsap
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `containerRef` | `any` | `containerRef` | Container ref |
| `color` | `string` | `"#ffffff"` | Primary color |

## Usage

```jsx
import { useRef } from 'react';
import Crosshair from './Crosshair';

const Component = () => {
const containerRef = useRef(null);

return (
  <div ref={containerRef} style={{ height: '300px', overflow: 'hidden' }}>
    <Crosshair containerRef={containerRef} color='#ffffff'/> // containerRef defaults to "window" if not provided
  </div>
)
};
```

## Suggested Use Cases

- Custom cursor effects
- Interactive hover effects
- Creative landing pages
