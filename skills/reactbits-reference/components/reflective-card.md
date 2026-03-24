# ReflectiveCard

> Card with dynamic webcam reflection and glare effects that respond to cursor movement.

**Category**: Components  
**Docs**: https://reactbits.dev/components/reflective-card

## Dependencies

```bash
npm install lucide-react
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `overlayColor` | `string` | `"rgba(0, 0, 0, 0.2)"` | Overlay Color |
| `blurStrength` | `number` | `10` | Blur Strength |
| `glassDistortion` | `number` | `15` | Glass Distortion |
| `metalness` | `number` | `0.8` | Metalness |
| `roughness` | `number` | `0.5` | Roughness |
| `displacementStrength` | `number` | `25` | Displacement Strength |
| `noiseScale` | `number` | `1.5` | Noise Scale |
| `specularConstant` | `number` | `2.0` | Specular Constant |
| `grayscale` | `number` | `0.5` | Grayscale |
| `color` | `string` | `"#ffffff"` | Primary color |

## Usage

```jsx
import ReflectiveCard from './ReflectiveCard';

<div style={{ height: '600px', position: 'relative' }}>
  <ReflectiveCard
    overlayColor="rgba(0, 0, 0, 0.2)"
    blurStrength={10}
    glassDistortion={15}
    metalness={0.8}
    roughness={0.5}
    displacementStrength={25}
    noiseScale={1.5}
    specularConstant={2.0}
    grayscale={0.5}
    color="#ffffff"
  />
</div>
```

## Suggested Use Cases

- Product showcases
- Modern web apps
