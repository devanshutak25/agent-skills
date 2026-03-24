# FloatingLines

> 3D floating lines that react to cursor movement.

**Category**: Backgrounds  
**Docs**: https://reactbits.dev/backgrounds/floating-lines

## Dependencies

```bash
npm install three
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `enabledWaves` | `array` | `['top', 'middle', 'bottom']` | Enabled Waves |
| `Array` | `boolean` | `true` | Array |
| `specify` | `boolean` | `true` | Specify |
| `line` | `boolean` | `true` | Line |
| `count` | `boolean` | `true` | Count |
| `per` | `boolean` | `true` | Per |
| `wave` | `boolean` | `true` | Wave |
| `Number` | `boolean` | `true` | Number |
| `same` | `boolean` | `true` | Same |
| `count` | `boolean` | `true` | Count |
| `for` | `boolean` | `true` | For |
| `all` | `boolean` | `true` | All |
| `waves` | `boolean` | `true` | Waves |
| `lineCount` | `array` | `[10, 15, 20]` | Line Count |
| `Array` | `boolean` | `true` | Array |
| `specify` | `boolean` | `true` | Specify |
| `line` | `boolean` | `true` | Line |
| `distance` | `boolean` | `true` | Travel distance (px) |
| `per` | `boolean` | `true` | Per |
| `wave` | `boolean` | `true` | Wave |
| `Number` | `boolean` | `true` | Number |
| `same` | `boolean` | `true` | Same |
| `distance` | `boolean` | `true` | Travel distance (px) |
| `for` | `boolean` | `true` | For |
| `all` | `boolean` | `true` | All |
| `waves` | `boolean` | `true` | Waves |
| `lineDistance` | `array` | `[8, 6, 4]` | Line Distance |
| `bendRadius` | `number` | `5.0` | Bend Radius |
| `bendStrength` | `number` | `-0.5` | Bend Strength |
| `interactive` | `boolean` | `true` | Interactive |
| `parallax` | `boolean` | `true` | Parallax |

## Usage

```jsx
import FloatingLines from './FloatingLines';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <FloatingLines 
    enabledWaves={['top', 'middle', 'bottom']}
    // Array - specify line count per wave; Number - same count for all waves
    lineCount={[10, 15, 20]}
    // Array - specify line distance per wave; Number - same distance for all waves
    lineDistance={[8, 6, 4]}
    bendRadius={5.0}
    bendStrength={-0.5}
    interactive={true}
    parallax={true}
  />
</div>
```

## Suggested Use Cases

- Hero backgrounds
- Landing page sections
