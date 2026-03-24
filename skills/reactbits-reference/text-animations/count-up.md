# CountUp

> Animated number counter supporting formatting and decimals.

**Category**: Text Animations  
**Docs**: https://reactbits.dev/text-animations/count-up

## Dependencies

```bash
npm install motion
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `from` | `number` | `0` | Start animation state |
| `to` | `number` | `100` | End animation state |
| `separator` | `string` | `","` | Separator |
| `direction` | `string` | `"up"` | Animation direction |
| `duration` | `number` | `1` | Animation duration |
| `className` | `string` | `"count-up-text"` | Additional CSS classes |

## Usage

```jsx
import CountUp from './CountUp'

<CountUp
  from={0}
  to={100}
  separator=","
  direction="up"
  duration={1}
  className="count-up-text"
/>
```

## Suggested Use Cases

- Hero section headlines
- Statistics dashboards
- Landing pages
