# TextPressure

> Characters scale / warp interactively based on pointer pressure zone.

**Category**: Text Animations  
**Docs**: https://reactbits.dev/text-animations/text-pressure

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `string` | `"Hello!"` | Text content |
| `flex` | `boolean` | `true` | Flex |
| `alpha` | `boolean` | `false` | Alpha |
| `stroke` | `boolean` | `false` | Stroke |
| `width` | `boolean` | `true` | Width |
| `weight` | `boolean` | `true` | Weight |
| `italic` | `boolean` | `true` | Italic |
| `textColor` | `string` | `"#ffffff"` | Text Color |
| `strokeColor` | `string` | `"#ff0000"` | Stroke Color |
| `minFontSize` | `number` | `36` | Min Font Size |

## Usage

```jsx
// Component ported from https://codepen.io/JuanFuentes/full/rgXKGQ
// Font used - https://compressa.preusstype.com/
  
import TextPressure from './TextPressure';

// Note:
// Make sure the font you're using supports all the variable properties. 
// React Bits does not take responsibility for the fonts used

<div style={{position: 'relative', height: '300px'}}>
  <TextPressure
    text="Hello!"
    flex={true}
    alpha={false}
    stroke={false}
    width={true}
    weight={true}
    italic={true}
    textColor="#ffffff"
    strokeColor="#ff0000"
    minFontSize={36}
  />
</div>
```

## Suggested Use Cases

- Hero section headlines
- Interactive text
- Landing pages
