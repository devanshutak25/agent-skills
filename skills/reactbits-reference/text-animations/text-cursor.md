# TextCursor

> Make any text element follow your cursor, leaving a trail of copies behind it.

**Category**: Text Animations  
**Docs**: https://reactbits.dev/text-animations/text-cursor

## Dependencies

```bash
npm install motion
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `string` | `"Hello!"` | Text content |
| `spacing` | `number` | `80` | Spacing |
| `followMouseDirection` | `boolean` | `true` | Follow Mouse Direction |
| `randomFloat` | `boolean` | `true` | Random Float |
| `exitDuration` | `number` | `0.3` | Exit Duration |
| `removalInterval` | `number` | `20` | Removal Interval |
| `maxPoints` | `number` | `10` | Max Points |

## Usage

```jsx
import TextCursor from './TextCursor';

<TextCursor
  text="Hello!"
  spacing={80}
  followMouseDirection={true}
  randomFloat={true}
  exitDuration={0.3}
  removalInterval={20}
  maxPoints={10}
/>
```

## Suggested Use Cases

- Hero section headlines
- Interactive text
- Landing pages
