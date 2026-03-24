# LogoLoop

> Continuously looping marquee of brand or tech logos with seamless repeat and hover pause.

**Category**: Animations  
**Docs**: https://reactbits.dev/animations/logo-loop

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `logos` | `any` | `techLogos` | Logos |
| `speed` | `number` | `120` | Animation speed |
| `direction` | `string` | `"left"` | Animation direction |
| `logoHeight` | `number` | `48` | Logo Height |
| `gap` | `number` | `40` | Item spacing |
| `hoverSpeed` | `number` | `0` | Hover Speed |
| `scaleOnHover` | `boolean` | `true` | Scale On Hover |
| `fadeOut` | `boolean` | `true` | Fade Out |
| `fadeOutColor` | `string` | `"#ffffff"` | Fade Out Color |
| `ariaLabel` | `string` | `"Technology partners"` | Aria Label |

## Usage

```jsx
import LogoLoop from './LogoLoop';
import { SiReact, SiNextdotjs, SiTypescript, SiTailwindcss } from 'react-icons/si';

const techLogos = [
  { node: <SiReact />, title: "React", href: "https://react.dev" },
  { node: <SiNextdotjs />, title: "Next.js", href: "https://nextjs.org" },
  { node: <SiTypescript />, title: "TypeScript", href: "https://www.typescriptlang.org" },
  { node: <SiTailwindcss />, title: "Tailwind CSS", href: "https://tailwindcss.com" },
];

// Alternative with image sources
const imageLogos = [
  { src: "/logos/company1.png", alt: "Company 1", href: "https://company1.com" },
  { src: "/logos/company2.png", alt: "Company 2", href: "https://company2.com" },
  { src: "/logos/company3.png", alt: "Company 3", href: "https://company3.com" },
];

function App() {
  return (
    <div style={{ height: '200px', position: 'relative', overflow: 'hidden'}}>
      {/* Basic horizontal loop */}
      <LogoLoop
        logos={techLogos}
        speed={120}
        direction="left"
        logoHeight={48}
        gap={40}
        hoverSpeed={0}
        scaleOnHover
        fadeOut
        fadeOutColor="#ffffff"
        ariaLabel="Technology partners"
      />
      
      {/* Vertical loop with deceleration on hover */}
      <LogoLoop
        logos={techLogos}
        speed={80}
        direction="up"
        logoHeight={48}
        gap={40}
        hoverSpeed={20}
        fadeOut
      />
    </div>
  );
}
```

## Suggested Use Cases

- Interactive hover effects
- Creative landing pages
