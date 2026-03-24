# ModelViewer

> Three.js model viewer with orbit controls and lighting presets.

**Category**: Components  
**Docs**: https://reactbits.dev/components/model-viewer

## Dependencies

```bash
npm install three @react-three/fiber @react-three/drei
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `url` | `string` | `"https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/ToyCar/glTF-Binary/ToyCar.glb"` | Url |
| `width` | `number` | `400` | Width |
| `height` | `number` | `400` | Height |

## Usage

```jsx
import ModelViewer from './ModelViewer';

<ModelViewer
  url="https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/ToyCar/glTF-Binary/ToyCar.glb"
  width={400}
  height={400}
/>
```

## Suggested Use Cases

- Modern web apps
