# LaserFlow

> Dynamic laser light that flows onto a surface, customizable effect.

**Category**: Animations  
**Docs**: https://reactbits.dev/animations/laser-flow

## Dependencies

```bash
npm install three
```

## Usage

```jsx
import LaserFlow from './LaserFlow';
import { useRef } from 'react';

// NOTE: You can also adjust the variables in the shader for super detailed customization

// Basic Usage
<div style={{ height: '500px', position: 'relative', overflow: 'hidden' }}>
  <LaserFlow />
</div>

// Image Example Interactive Reveal Effect
function LaserFlowBoxExample() {
  const revealImgRef = useRef(null);

  return (
    <div 
      style={{ 
        height: '800px', 
        position: 'relative', 
        overflow: 'hidden',
        backgroundColor: '#060010'
      }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const el = revealImgRef.current;
        if (el) {
          el.style.setProperty('--mx', \
```

## Suggested Use Cases

- Creative landing pages
