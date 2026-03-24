# Dock

> macOS style magnifying dock with proximity scaling of icons.

**Category**: Components  
**Docs**: https://reactbits.dev/components/dock

## Dependencies

```bash
npm install motion
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `any` | `items` | Items array |
| `panelHeight` | `number` | `68` | Panel height (px) |
| `baseItemSize` | `number` | `50` | Base item size (px) |
| `magnification` | `number` | `70` | Hover magnification |

## Usage

```jsx
import Dock from './Dock';

  const items = [
    { icon: <VscHome size={18} />, label: 'Home', onClick: () => alert('Home!') },
    { icon: <VscArchive size={18} />, label: 'Archive', onClick: () => alert('Archive!') },
    { icon: <VscAccount size={18} />, label: 'Profile', onClick: () => alert('Profile!') },
    { icon: <VscSettingsGear size={18} />, label: 'Settings', onClick: () => alert('Settings!') },
  ];

  <Dock 
    items={items}
    panelHeight={68}
    baseItemSize={50}
    magnification={70}
  />
```

## Suggested Use Cases

- App navigation
- Modern web apps
