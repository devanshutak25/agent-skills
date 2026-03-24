# MetallicPaint

> Liquid metallic paint shader which can be applied to SVG elements.

**Category**: Animations  
**Docs**: https://reactbits.dev/animations/metallic-paint

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `imageSrc` | `any` | `logo` | Image Src |
| `Pattern` | `boolean` | `true` | Pattern |
| `seed` | `number` | `42` | Seed |
| `scale` | `number` | `4` | Scale multiplier |
| `patternSharpness` | `number` | `1` | Pattern Sharpness |
| `noiseScale` | `number` | `0.5` | Noise Scale |
| `Animation` | `boolean` | `true` | Animation |
| `speed` | `number` | `0.3` | Animation speed |
| `liquid` | `number` | `0.75` | Liquid |
| `mouseAnimation` | `boolean` | `false` | Mouse Animation |
| `Visual` | `boolean` | `true` | Visual |
| `brightness` | `number` | `2` | Brightness |
| `contrast` | `number` | `0.5` | Contrast |
| `refraction` | `number` | `0.01` | Refraction |
| `blur` | `number` | `0.015` | Blur |
| `chromaticSpread` | `number` | `2` | Chromatic Spread |
| `fresnel` | `number` | `1` | Fresnel |
| `angle` | `number` | `0` | Angle |
| `waveAmplitude` | `number` | `1` | Wave Amplitude |
| `distortion` | `number` | `1` | Distortion |
| `contour` | `number` | `0.2` | Contour |
| `Colors` | `boolean` | `true` | Colors |
| `lightColor` | `string` | `"#ffffff"` | Light Color |
| `darkColor` | `string` | `"#000000"` | Dark Color |
| `tintColor` | `string` | `"#feb3ff"` | Tint Color |

## Usage

```jsx
// Effect inspired by Paper's Liquid Metal effect
  
import MetallicPaint from "./MetallicPaint";

// Replace with your own SVG path
// NOTE: Your SVG should have padding around the shape to prevent cutoff
// It should have a black fill color to allow the metallic effect to show through
import logo from './logo.svg';

export default function Component() {
  return (
    <div style={{ width: '100%', height: '400px' }}>
      <MetallicPaint
        imageSrc={logo}
        // Pattern
        seed={42}
        scale={4}
        patternSharpness={1}
        noiseScale={0.5}
        // Animation
        speed={0.3}
        liquid={0.75}
        mouseAnimation={false}
        // Visual
        brightness={2}
        contrast={0.5}
        refraction={0.01}
        blur={0.015}
        chromaticSpread={2}
        fresnel={1}
        angle={0}
        waveAmplitude={1}
        distortion={1}
        contour={0.2}
        // Colors
        lightColor="#ffffff"
        darkColor="#000000"
        tintColor="#feb3ff"
      />
    </div>
  );
}
```

## Suggested Use Cases

- Creative landing pages
