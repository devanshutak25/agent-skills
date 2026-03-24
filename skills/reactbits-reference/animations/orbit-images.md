# OrbitImages

> SVG Path customizable orbiting images effect

**Category**: Animations  
**Docs**: https://reactbits.dev/animations/orbit-images

## Dependencies

```bash
npm install motion
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `images` | `any` | `images` | Image sources array |
| `shape` | `string` | `"ellipse"` | Shape |
| `radiusX` | `number` | `340` | Radius X |
| `radiusY` | `number` | `80` | Radius Y |
| `rotation` | `number` | `-8` | Rotation |
| `duration` | `number` | `30` | Animation duration |
| `itemSize` | `number` | `80` | Item Size |
| `responsive` | `boolean` | `true` | Responsive |

## Usage

```jsx
// Component created by Dominik Koch
// https://x.com/dominikkoch

import OrbitImages from './OrbitImages'

const images = [
  "https://picsum.photos/300/300?grayscale&random=1",
  "https://picsum.photos/300/300?grayscale&random=2",
  "https://picsum.photos/300/300?grayscale&random=3",
  "https://picsum.photos/300/300?grayscale&random=4",
  "https://picsum.photos/300/300?grayscale&random=5",
  "https://picsum.photos/300/300?grayscale&random=6",
];

<OrbitImages
  images={images}
  shape="ellipse"
  radiusX={340}
  radiusY={80}
  rotation={-8}
  duration={30}
  itemSize={80}
  responsive={true}
/>
```

## Suggested Use Cases

- Creative landing pages
