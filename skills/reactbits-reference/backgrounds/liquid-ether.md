# LiquidEther

> Interactive liquid shader with flowing distortion and customizable colors.

**Category**: Backgrounds  
**Docs**: https://reactbits.dev/backgrounds/liquid-ether

## Dependencies

```bash
npm install three
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `colors` | `array` | `[ '#5227FF', '#FF9FFC', '#B19EEF' ]` | Color array |
| `mouseForce` | `number` | `20` | Mouse Force |
| `cursorSize` | `number` | `100` | Cursor Size |
| `isViscous` | `boolean` | `false` | Is Viscous |
| `viscous` | `number` | `30` | Viscous |
| `iterationsViscous` | `number` | `32` | Iterations Viscous |
| `iterationsPoisson` | `number` | `32` | Iterations Poisson |
| `resolution` | `number` | `0.5` | Resolution |
| `isBounce` | `boolean` | `false` | Is Bounce |
| `autoDemo` | `boolean` | `true` | Auto Demo |
| `autoSpeed` | `number` | `0.5` | Auto Speed |
| `autoIntensity` | `number` | `2.2` | Auto Intensity |
| `takeoverDuration` | `number` | `0.25` | Takeover Duration |
| `autoResumeDelay` | `number` | `3000` | Auto Resume Delay |
| `autoRampDuration` | `number` | `0.6` | Auto Ramp Duration |

## Usage

```jsx
import LiquidEther from './LiquidEther';

<div style={{ width: '100%', height: 600, position: 'relative' }}>
  <LiquidEther
    colors={[ '#5227FF', '#FF9FFC', '#B19EEF' ]}
    mouseForce={20}
    cursorSize={100}
    isViscous={false}
    viscous={30}
    iterationsViscous={32}
    iterationsPoisson={32}
    resolution={0.5}
    isBounce={false}
    autoDemo={true}
    autoSpeed={0.5}
    autoIntensity={2.2}
    takeoverDuration={0.25}
    autoResumeDelay={3000}
    autoRampDuration={0.6}
  />
</div>
```

## Suggested Use Cases

- Hero backgrounds
- Premium visuals
- Landing page sections
