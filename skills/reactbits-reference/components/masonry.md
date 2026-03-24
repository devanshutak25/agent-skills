# Masonry

> Responsive masonry layout with animated reflow + gaps optimization.

**Category**: Components  
**Docs**: https://reactbits.dev/components/masonry

## Dependencies

```bash
npm install gsap
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `any` | `items` | Items array |
| `ease` | `string` | `"power3.out"` | Easing function |
| `duration` | `number` | `0.6` | Animation duration |
| `stagger` | `number` | `0.05` | Stagger |
| `animateFrom` | `string` | `"bottom"` | Animate From |
| `scaleOnHover` | `boolean` | `true` | Scale On Hover |
| `hoverScale` | `number` | `0.95` | Hover Scale |
| `blurToFocus` | `boolean` | `true` | Blur To Focus |
| `colorShiftOnHover` | `boolean` | `false` | Color Shift On Hover |

## Usage

```jsx
import Masonry from './Masonry';

const items = [
    {
      id: "1",
      img: "https://picsum.photos/id/1015/600/900?grayscale",
      url: "https://example.com/one",
      height: 400,
    },
    {
      id: "2",
      img: "https://picsum.photos/id/1011/600/750?grayscale",
      url: "https://example.com/two",
      height: 250,
    },
    {
      id: "3",
      img: "https://picsum.photos/id/1020/600/800?grayscale",
      url: "https://example.com/three",
      height: 600,
    },
    // ... more items
];

<Masonry
  items={items}
  ease="power3.out"
  duration={0.6}
  stagger={0.05}
  animateFrom="bottom"
  scaleOnHover={true}
  hoverScale={0.95}
  blurToFocus={true}
  colorShiftOnHover={false}
/>
```

## Suggested Use Cases

- Image galleries
- Modern web apps
