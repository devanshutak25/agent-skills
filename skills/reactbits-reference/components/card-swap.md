# CardSwap

> Cards animate position swapping with smooth layout transitions.

**Category**: Components  
**Docs**: https://reactbits.dev/components/card-swap

## Dependencies

```bash
npm install gsap
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `style` | `object` | `{ height: '600px', position: 'relative' }` | Inline style object |

## Usage

```jsx
import CardSwap, { Card } from './CardSwap'

<div style={{ height: '600px', position: 'relative' }}>
  <CardSwap
    cardDistance={60}
    verticalDistance={70}
    delay={5000}
    pauseOnHover={false}
  >
    <Card>
      <h3>Card 1</h3>
      <p>Your content here</p>
    </Card>
    <Card>
      <h3>Card 2</h3>
      <p>Your content here</p>
    </Card>
    <Card>
      <h3>Card 3</h3>
      <p>Your content here</p>
    </Card>
  </CardSwap>
</div>
```

## Suggested Use Cases

- Product showcases
- Modern web apps
