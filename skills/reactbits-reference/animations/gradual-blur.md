# GradualBlur

> Progressively un-blurs content based on scroll or trigger creating a cinematic reveal.

**Category**: Animations  
**Docs**: https://reactbits.dev/animations/gradual-blur

## Dependencies

```bash
npm install mathjs
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `target` | `string` | `"parent"` | Target |
| `position` | `string` | `"bottom"` | Position |
| `height` | `string` | `"6rem"` | Height |
| `strength` | `number` | `2` | Strength |
| `divCount` | `number` | `5` | Div Count |
| `curve` | `string` | `"bezier"` | Curve |
| `exponential` | `boolean` | `true` | Exponential |
| `opacity` | `number` | `1` | Opacity (0-1) |

## Usage

```jsx
// Component added by Ansh - github.com/ansh-dhanani

import GradualBlur from './GradualBlur';

<section style={{position: 'relative',height: 500,overflow: 'hidden'}}>
  <div style={{ height: '100%',overflowY: 'auto',padding: '6rem 2rem' }}>
    <!-- Content Here - such as an image or text -->
  </div>

  <GradualBlur
    target="parent"
    position="bottom"
    height="6rem"
    strength={2}
    divCount={5}
    curve="bezier"
    exponential={true}
    opacity={1}
  />
</section>
```

## Suggested Use Cases

- Scroll-triggered reveals
- Creative landing pages
