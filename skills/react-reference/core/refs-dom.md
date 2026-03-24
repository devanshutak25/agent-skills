# Refs & DOM APIs

## useRef

```tsx
const ref = useRef<HTMLDivElement>(null);

// Access DOM node
useEffect(() => {
  ref.current?.focus();
}, []);

return <div ref={ref} />;
```

### Mutable Ref (instance variable)
```tsx
const intervalId = useRef<ReturnType<typeof setInterval> | null>(null);
const prevValue = useRef(value);

useEffect(() => {
  prevValue.current = value; // track previous value
});
```

---

## ref as Prop (React 19)

```tsx
// No more forwardRef needed
function Input({ ref, ...props }: InputHTMLAttributes<HTMLInputElement> & { ref?: Ref<HTMLInputElement> }) {
  return <input ref={ref} {...props} />;
}

// Parent
const inputRef = useRef<HTMLInputElement>(null);
<Input ref={inputRef} placeholder="Type here" />
```

---

## Ref Cleanup Functions (React 19)

```tsx
<canvas ref={(node) => {
  const ctx = node.getContext('2d');
  drawChart(ctx);
  return () => {
    // cleanup when element unmounts or ref changes
    ctx.clearRect(0, 0, node.width, node.height);
  };
}} />
```

**Breaking change**: Previously refs were called with `null` on unmount. Now, if a cleanup function is returned, `null` callback is skipped.

**TypeScript gotcha** — avoid implicit returns:
```tsx
// Bad — returns the assignment result
<div ref={current => (instance = current)} />
// Good — explicit block, no return
<div ref={current => { instance = current; }} />
```

---

## Callback Refs

```tsx
function MeasuredComponent() {
  const [height, setHeight] = useState(0);

  const measuredRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      setHeight(node.getBoundingClientRect().height);
    }
  }, []);

  return <div ref={measuredRef}>Content (height: {height}px)</div>;
}
```

---

## useImperativeHandle

Customize what the parent receives via ref:

```tsx
function VideoPlayer({ ref }: { ref: Ref<VideoAPI> }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useImperativeHandle(ref, () => ({
    play() { videoRef.current?.play(); },
    pause() { videoRef.current?.pause(); },
    seek(time: number) { if (videoRef.current) videoRef.current.currentTime = time; },
  }), []);

  return <video ref={videoRef} />;
}

interface VideoAPI {
  play(): void;
  pause(): void;
  seek(time: number): void;
}
```

---

## createPortal

Renders children into a different DOM node:

```tsx
import { createPortal } from 'react-dom';

function Modal({ children, isOpen }: { children: ReactNode; isOpen: boolean }) {
  if (!isOpen) return null;
  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content">{children}</div>
    </div>,
    document.getElementById('modal-root')!
  );
}
```

**Key behavior**: Events bubble through React tree (not DOM tree). A click inside a portal still triggers parent React event handlers.

---

## flushSync

Forces synchronous DOM update (escape hatch):

```tsx
import { flushSync } from 'react-dom';

function handleClick() {
  flushSync(() => {
    setCount(c => c + 1);
  });
  // DOM is updated HERE, synchronously
  console.log(document.getElementById('counter')!.textContent); // updated value
}
```

**Use sparingly** — breaks batching, hurts performance. Common use case: scrolling to newly added list items.

```tsx
function addItem(text: string) {
  flushSync(() => {
    setItems(prev => [...prev, text]);
  });
  // DOM updated — safe to scroll
  listRef.current?.lastElementChild?.scrollIntoView();
}
```

---

## Common DOM Patterns

### Focus Management
```tsx
function SearchInput() {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus(); // auto-focus on mount
  }, []);

  return <input ref={inputRef} type="search" />;
}
```

### Scroll Into View
```tsx
function ScrollToItem({ items }: { items: Item[] }) {
  const itemRefs = useRef<Map<string, HTMLElement>>(new Map());

  function scrollTo(id: string) {
    itemRefs.current.get(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  return items.map(item => (
    <div key={item.id} ref={el => {
      if (el) itemRefs.current.set(item.id, el);
      else itemRefs.current.delete(item.id);
    }}>
      {item.name}
    </div>
  ));
}
```

### Forwarding Ref to Specific Child
```tsx
function Form({ ref }: { ref: Ref<HTMLFormElement> }) {
  return (
    <form ref={ref}>
      <input name="email" />
      <button type="submit">Submit</button>
    </form>
  );
}
```
