# Waves

> Layered lines that form smooth wave patterns with animation.

**Category**: Backgrounds  
**Docs**: https://reactbits.dev/backgrounds/waves

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `lineColor` | `string` | `"#fff"` | Line Color |
| `backgroundColor` | `string` | `"rgba(255, 255, 255, 0.2)"` | Background Color |
| `waveSpeedX` | `number` | `0.02` | Wave Speed X |
| `waveSpeedY` | `number` | `0.01` | Wave Speed Y |
| `waveAmpX` | `number` | `40` | Wave Amp X |
| `waveAmpY` | `number` | `20` | Wave Amp Y |
| `friction` | `number` | `0.9` | Friction |
| `tension` | `number` | `0.01` | Tension |
| `maxCursorMove` | `number` | `120` | Max Cursor Move |
| `xGap` | `number` | `12` | X Gap |
| `yGap` | `number` | `36` | Y Gap |

## Usage

```jsx
import Waves from './Waves';

<Waves
  lineColor="#fff"
  backgroundColor="rgba(255, 255, 255, 0.2)"
  waveSpeedX={0.02}
  waveSpeedY={0.01}
  waveAmpX={40}
  waveAmpY={20}
  friction={0.9}
  tension={0.01}
  maxCursorMove={120}
  xGap={12}
  yGap={36}
/>
```

## Suggested Use Cases

- Hero backgrounds
- Elegant backgrounds
- Landing page sections
