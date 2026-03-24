# PixelTransition

> Pixel dissolve transition for content reveal on hover.

**Category**: Animations  
**Docs**: https://reactbits.dev/animations/pixel-transition

## Dependencies

```bash
npm install gsap
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `firstContent` | `any` | `<img       src="https://upload.wikimedia.org/wi...` | First Content |

## Usage

```jsx
import PixelTransition from './PixelTransition';

<PixelTransition
  firstContent={
    <img
      src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Cat03.jpg/1200px-Cat03.jpg"
      alt="default pixel transition content, a cat!"
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
  }
  secondContent={
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "grid",
        placeItems: "center",
        backgroundColor: "#111"
      }}
    >
      <p style={{ fontWeight: 900, fontSize: "3rem", color: "#ffffff" }}>Meow!</p>
    </div>
  }
  gridSize={12}
  pixelColor='#ffffff'
  once={false}
  animationStepDuration={0.4}
  className="custom-pixel-card"
/>
```

## Suggested Use Cases

- Interactive hover effects
- Creative landing pages
