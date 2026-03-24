# TargetCursor

> A cursor follow animation with 4 corners that lock onto targets.

**Category**: Animations  
**Docs**: https://reactbits.dev/animations/target-cursor

## Dependencies

```bash
npm install gsap
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `spinDuration` | `number` | `2` | Spin Duration |
| `hideDefaultCursor` | `boolean` | `true` | Hide Default Cursor |
| `parallaxOn` | `boolean` | `true` | Parallax On |

## Usage

```jsx
import TargetCursor from './TargetCursor';

export default function App() {
  return (
    <div>
      <TargetCursor 
        spinDuration={2}
        hideDefaultCursor={true}
        parallaxOn={true}
      />
      
      <h1>Hover over the elements below</h1>
      <button className="cursor-target">Click me!</button>
      <div className="cursor-target">Hover target</div>
    </div>
  );
}
```

## Suggested Use Cases

- Custom cursor effects
- Creative landing pages
