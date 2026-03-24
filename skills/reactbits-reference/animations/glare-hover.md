# GlareHover

> Adds a realistic moving glare highlight on hover over any element.

**Category**: Animations  
**Docs**: https://reactbits.dev/animations/glare-hover

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `glareColor` | `string` | `"#ffffff"` | Glare Color |
| `glareOpacity` | `number` | `0.3` | Glare Opacity |
| `glareAngle` | `number` | `-30` | Glare Angle |
| `glareSize` | `number` | `300` | Glare Size |
| `transitionDuration` | `number` | `800` | Transition Duration |
| `playOnce` | `boolean` | `false` | Play Once |

## Usage

```jsx
import GlareHover from './GlareHover'

<div style={{ height: '600px', position: 'relative' }}>
  <GlareHover
    glareColor="#ffffff"
    glareOpacity={0.3}
    glareAngle={-30}
    glareSize={300}
    transitionDuration={800}
    playOnce={false}
  >
    <h2 style={{ fontSize: '3rem', fontWeight: '900', color: '#333', margin: 0 }}>
      Hover Me
    </h2>
  </GlareHover>
</div>
```

## Suggested Use Cases

- Interactive hover effects
- Creative landing pages
