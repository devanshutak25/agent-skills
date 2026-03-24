# PillNav

> Minimal pill nav with sliding active highlight + smooth easing.

**Category**: Components  
**Docs**: https://reactbits.dev/components/pill-nav

## Dependencies

```bash
npm install gsap
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `logo` | `any` | `logo` | Logo |
| `logoAlt` | `string` | `"Company Logo"` | Logo Alt |
| `items` | `array` | `[     { label: 'Home', href: '/' },     { label...` | Items array |
| `activeHref` | `string` | `"/"` | Active Href |
| `className` | `string` | `"custom-nav"` | Additional CSS classes |
| `ease` | `string` | `"power2.easeOut"` | Easing function |
| `baseColor` | `string` | `"#000000"` | Base Color |
| `pillColor` | `string` | `"#ffffff"` | Pill Color |
| `hoveredPillTextColor` | `string` | `"#ffffff"` | Hovered Pill Text Color |
| `pillTextColor` | `string` | `"#000000"` | Pill Text Color |

## Usage

```jsx
import PillNav from './PillNav';
import logo from '/path/to/logo.svg';

<PillNav
  logo={logo}
  logoAlt="Company Logo"
  items={[
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Services', href: '/services' },
    { label: 'Contact', href: '/contact' }
  ]}
  activeHref="/"
  className="custom-nav"
  ease="power2.easeOut"
  baseColor="#000000"
  pillColor="#ffffff"
  hoveredPillTextColor="#ffffff"
  pillTextColor="#000000"
/>
```

## Suggested Use Cases

- App navigation
- Modern web apps
