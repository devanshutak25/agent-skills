# StaggeredMenu

> Menu with staggered item animations and smooth transitions on open/close.

**Category**: Components  
**Docs**: https://reactbits.dev/components/staggered-menu

## Dependencies

```bash
npm install gsap
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `position` | `string` | `"right"` | Position |
| `items` | `any` | `menuItems` | Items array |
| `socialItems` | `any` | `socialItems` | Social Items |
| `displaySocials` | `boolean` | `true` | Display Socials |
| `displayItemNumbering` | `boolean` | `true` | Display Item Numbering |
| `menuButtonColor` | `string` | `"#fff"` | Menu Button Color |
| `openMenuButtonColor` | `string` | `"#fff"` | Open Menu Button Color |
| `changeMenuColorOnOpen` | `boolean` | `true` | Change Menu Color On Open |
| `colors` | `array` | `['#B19EEF', '#5227FF']` | Color array |
| `logoUrl` | `string` | `"/path-to-your-logo.svg"` | Logo Url |
| `accentColor` | `string` | `"#ff6b6b"` | Accent Color |
| `onMenuOpen` | `any` | `() =` | On Menu Open |

## Usage

```jsx
import StaggeredMenu from './StaggeredMenu';

const menuItems = [
  { label: 'Home', ariaLabel: 'Go to home page', link: '/' },
  { label: 'About', ariaLabel: 'Learn about us', link: '/about' },
  { label: 'Services', ariaLabel: 'View our services', link: '/services' },
  { label: 'Contact', ariaLabel: 'Get in touch', link: '/contact' }
];

const socialItems = [
  { label: 'Twitter', link: 'https://twitter.com' },
  { label: 'GitHub', link: 'https://github.com' },
  { label: 'LinkedIn', link: 'https://linkedin.com' }
];

<div style={{ height: '100vh', background: '#1a1a1a' }}>
  <StaggeredMenu
    position="right"
    items={menuItems}
    socialItems={socialItems}
    displaySocials={true}
    displayItemNumbering={true}
    menuButtonColor="#fff"
    openMenuButtonColor="#fff"
    changeMenuColorOnOpen={true}
    colors={['#B19EEF', '#5227FF']}
    logoUrl="/path-to-your-logo.svg"
    accentColor="#ff6b6b"
    onMenuOpen={() => console.log('Menu opened')}
    onMenuClose={() => console.log('Menu closed')}
  />
</div>
```

## Suggested Use Cases

- App navigation
- Modern web apps
