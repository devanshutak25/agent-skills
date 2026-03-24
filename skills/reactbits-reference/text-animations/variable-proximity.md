# VariableProximity

> Letter styling changes continuously with pointer distance mapping.

**Category**: Text Animations  
**Docs**: https://reactbits.dev/text-animations/variable-proximity

## Dependencies

```bash
npm install motion
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `any` | `'Hover me! And then star React Bits on GitHub, ...` | Label |
| `className` | `any` | `'variable-proximity-demo'` | Additional CSS classes |
| `fromFontVariationSettings` | `string` | `"'wght' 400, 'opsz' 9"` | From Font Variation Settings |
| `toFontVariationSettings` | `string` | `"'wght' 1000, 'opsz' 40"` | To Font Variation Settings |
| `containerRef` | `any` | `containerRef` | Container ref |
| `radius` | `number` | `100` | Radius value |
| `falloff` | `string` | `"linear"` | Falloff |

## Usage

```jsx
import { useRef } from 'react';
import VariableProximity from './VariableProximity';

const containerRef = useRef(null);

<div
ref={containerRef}
style={{position: 'relative'}}
>
  <VariableProximity
    label={'Hover me! And then star React Bits on GitHub, or else...'}
    className={'variable-proximity-demo'}
    fromFontVariationSettings="'wght' 400, 'opsz' 9"
    toFontVariationSettings="'wght' 1000, 'opsz' 40"
    containerRef={containerRef}
    radius={100}
    falloff='linear'
  />
</div>
```

## Suggested Use Cases

- Hero section headlines
- Landing pages
