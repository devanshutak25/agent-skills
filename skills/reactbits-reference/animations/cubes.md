# Cubes

> 3D rotating cube cluster. Supports auto-rotation or hover interaction.

**Category**: Animations  
**Docs**: https://reactbits.dev/animations/cubes

## Dependencies

```bash
npm install gsap
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `gridSize` | `number` | `8` | Grid Size |
| `maxAngle` | `number` | `60` | Max Angle |
| `radius` | `number` | `4` | Radius value |
| `borderStyle` | `string` | `"2px dashed #5227FF"` | Border Style |
| `faceColor` | `string` | `"#1a1a2e"` | Face Color |
| `rippleColor` | `string` | `"#ff6b6b"` | Ripple Color |
| `rippleSpeed` | `number` | `1.5` | Ripple Speed |
| `autoAnimate` | `boolean` | `true` | Auto Animate |
| `rippleOnClick` | `boolean` | `true` | Ripple On Click |

## Usage

```jsx
// CREDIT
// Component inspired from Can Tastemel's original work for the lambda.ai landing page
// https://cantastemel.com
  
import Cubes from './Cubes'

<div style={{ height: '600px', position: 'relative' }}>
  <Cubes 
    gridSize={8}
    maxAngle={60}
    radius={4}
    borderStyle="2px dashed #5227FF"
    faceColor="#1a1a2e"
    rippleColor="#ff6b6b"
    rippleSpeed={1.5}
    autoAnimate={true}
    rippleOnClick={true}
  />
</div>
```

## Suggested Use Cases

- Interactive hover effects
- Creative landing pages
