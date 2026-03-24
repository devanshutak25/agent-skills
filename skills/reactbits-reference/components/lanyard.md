# Lanyard

> Swinging 3D lanyard / badge card with realistic inertial motion.

**Category**: Components  
**Docs**: https://reactbits.dev/components/lanyard

## Dependencies

```bash
npm install three meshline @react-three/fiber @react-three/drei @react-three/rapier
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `position` | `array` | `[0, 0, 20]` | Position |
| `gravity` | `array` | `[0, -40, 0]` | Gravity |

## Usage

```jsx
import Lanyard from './Lanyard'

<Lanyard position={[0, 0, 20]} gravity={[0, -40, 0]} />

/* IMPORTANT INFO BELOW

1. You MUST have the card.glb and lanyard.png files in your project and import them
- these can be downloaded from the repo's files, under src/assets/lanyard

2. You can edit your card.glb file in this online .glb editor and change the texture:
- https://modelviewer.dev/editor/

4. The png file is the texture for the lanyard's band and can be edited in any image editor

5. Your Vite configuration must be updated to include the following in vite.config.js:
assetsInclude: ['**/*.glb']

6. For TS users, you might need these changes:

- src/global.d.ts
export { };

declare module '*.glb';
declare module '*.png';

declare module 'meshline' {
  export const MeshLineGeometry: any;
  export const MeshLineMaterial: any;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      meshLineGeometry: any;
      meshLineMaterial: any;
    }
  }
}

- src/vite-env.d.ts
/// <reference types="vite/client" />
declare module '*.glb';
declare module '*.png';
*/
```

## Suggested Use Cases

- Product showcases
- Content feeds
- Modern web apps
