# AnimatedList

> List items enter with staggered motion variants for polished reveals.

**Category**: Components  
**Docs**: https://reactbits.dev/components/animated-list

## Dependencies

```bash
npm install motion
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `any` | `items` | Items array |
| `onItemSelect` | `any` | `(item, index) =` | On Item Select |

## Usage

```jsx
import AnimatedList from './AnimatedList'

const items = ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5', 'Item 6', 'Item 7', 'Item 8', 'Item 9', 'Item 10']; 
  
<AnimatedList
  items={items}
  onItemSelect={(item, index) => console.log(item, index)}
  showGradients={true}
  enableArrowNavigation={true}
  displayScrollbar={true}
/>
```

## Suggested Use Cases

- Content feeds
- Modern web apps
