# TiltedCard

> 3D perspective tilt card reacting to pointer.

**Category**: Components  
**Docs**: https://reactbits.dev/components/tilted-card

## Dependencies

```bash
npm install motion
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `imageSrc` | `string` | `"https://i.scdn.co/image/ab67616d0000b273d9985092cd88bffd97653b58"` | Image Src |
| `altText` | `string` | `"Kendrick Lamar - GNX Album Cover"` | Alt Text |
| `captionText` | `string` | `"Kendrick Lamar - GNX"` | Caption Text |
| `containerHeight` | `string` | `"300px"` | Container Height |
| `containerWidth` | `string` | `"300px"` | Container Width |
| `imageHeight` | `string` | `"300px"` | Image Height |
| `imageWidth` | `string` | `"300px"` | Image Width |
| `rotateAmplitude` | `number` | `12` | Rotate Amplitude |
| `scaleOnHover` | `number` | `1.2` | Scale On Hover |
| `showMobileWarning` | `boolean` | `false` | Show Mobile Warning |
| `showTooltip` | `boolean` | `true` | Show Tooltip |
| `displayOverlayContent` | `boolean` | `true` | Display Overlay Content |
| `overlayContent` | `any` | `<p className="tilted-card-demo-text"` | Overlay Content |

## Usage

```jsx
import TiltedCard from './TiltedCard';

<TiltedCard
  imageSrc="https://i.scdn.co/image/ab67616d0000b273d9985092cd88bffd97653b58"
  altText="Kendrick Lamar - GNX Album Cover"
  captionText="Kendrick Lamar - GNX"
  containerHeight="300px"
  containerWidth="300px"
  imageHeight="300px"
  imageWidth="300px"
  rotateAmplitude={12}
  scaleOnHover={1.2}
  showMobileWarning={false}
  showTooltip={true}
  displayOverlayContent={true}
  overlayContent={
    <p className="tilted-card-demo-text">
      Kendrick Lamar - GNX
    </p>
  }
/>
```

## Suggested Use Cases

- Product showcases
- Modern web apps
