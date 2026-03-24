# MetaBalls

> Liquid metaball blobs that merge and separate with smooth implicit surface animation.

**Category**: Animations  
**Docs**: https://reactbits.dev/animations/meta-balls

## Dependencies

```bash
npm install ogl
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `color` | `string` | `"#ffffff"` | Primary color |
| `cursorBallColor` | `string` | `"#ffffff"` | Cursor Ball Color |
| `cursorBallSize` | `number` | `2` | Cursor Ball Size |
| `ballCount` | `number` | `15` | Ball Count |
| `animationSize` | `number` | `30` | Animation Size |
| `enableMouseInteraction` | `boolean` | `true` | Enable Mouse Interaction |
| `enableTransparency` | `boolean` | `true` | Enable Transparency |
| `hoverSmoothness` | `number` | `0.05` | Hover Smoothness |
| `clumpFactor` | `number` | `1` | Clump Factor |
| `speed` | `number` | `0.3` | Animation speed |

## Usage

```jsx
import MetaBalls from './MetaBalls';

<MetaBalls
  color="#ffffff"
  cursorBallColor="#ffffff"
  cursorBallSize={2}
  ballCount={15}
  animationSize={30}
  enableMouseInteraction={true}
  enableTransparency={true}
  hoverSmoothness={0.05}
  clumpFactor={1}
  speed={0.3}
/>
```

## Suggested Use Cases

- Creative landing pages
