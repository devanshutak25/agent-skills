# FluidGlass

> Glassmorphism container with animated liquid distortion refraction.

**Category**: Components  
**Docs**: https://reactbits.dev/components/fluid-glass

## Dependencies

```bash
npm install three @react-three/fiber @react-three/drei maath
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `mode` | `string` | `"lens"` | Mode |
| `or` | `boolean` | `true` | Or |
| `bar` | `boolean` | `true` | Bar |
| `cube` | `boolean` | `true` | Cube |
| `lensProps` | `object` | `{       scale: 0.25,       ior: 1.15,       thi...` | Lens Props |
| `barProps` | `any` | `` | Bar Props |
| `add` | `boolean` | `true` | Add |
| `specific` | `boolean` | `true` | Specific |
| `props` | `boolean` | `true` | Props |
| `if` | `boolean` | `true` | If |
| `using` | `boolean` | `true` | Using |
| `bar` | `boolean` | `true` | Bar |
| `mode` | `boolean` | `true` | Mode |
| `cubeProps` | `any` | `` | Cube Props |
| `add` | `boolean` | `true` | Add |
| `specific` | `boolean` | `true` | Specific |
| `props` | `boolean` | `true` | Props |
| `if` | `boolean` | `true` | If |
| `using` | `boolean` | `true` | Using |
| `cube` | `boolean` | `true` | Cube |
| `mode` | `boolean` | `true` | Mode |

## Usage

```jsx
// IMPORTANT INFO BELOW
// This component requires a 3D model to function correctly.
// You can find three example models in the 'public/assets/3d' directory of the repository:
// - 'lens.glb'
// - 'bar.glb'
// - 'cube.glb'
// Make sure to place these models in the correct directory or update the paths accordingly.

import FluidGlass from './FluidGlass'

<div style={{ height: '600px', position: 'relative' }}>
  <FluidGlass 
    mode="lens" // or "bar", "cube"
    lensProps={{
      scale: 0.25,
      ior: 1.15,
      thickness: 5,
      chromaticAberration: 0.1,
      anisotropy: 0.01  
    }}
    barProps={} // add specific props if using bar mode
    cubeProps={} // add specific props if using cube mode
  />
</div>
```

## Suggested Use Cases

- Glassmorphism UI
- Modern web apps
