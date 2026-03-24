# DecryptedText

> Hacker-style decryption cycling random glyphs until resolving to real text.

**Category**: Text Animations  
**Docs**: https://reactbits.dev/text-animations/decrypted-text

## Dependencies

```bash
npm install motion
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `string` | `"Hover me!"` | Text content |

## Usage

```jsx
import DecryptedText from './DecryptedText';

{/* Example 1: Defaults (hover to decrypt) */}
<DecryptedText text="Hover me!" />

{/* Example 2: Customized speed and characters */}
<DecryptedText
text="Customize me"
speed={100}
maxIterations={20}
characters="ABCD1234!?"
className="revealed"
parentClassName="all-letters"
encryptedClassName="encrypted"
/>

{/* Example 3: Animate on view (runs once) */}
<div style={{ marginTop: '4rem' }}>
<DecryptedText
  text="This text animates when in view"
  animateOn="view"
  revealDirection="center"
/>
</div>
```

## Suggested Use Cases

- Hero section headlines
- Landing pages
