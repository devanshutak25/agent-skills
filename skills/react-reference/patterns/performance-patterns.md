# Performance Patterns

## Code Splitting

### Route-Based (Most Impact)
```tsx
const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

<Suspense fallback={<PageSkeleton />}>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/dashboard" element={<Dashboard />} />
  </Routes>
</Suspense>
```

### Component-Level
```tsx
const RichEditor = lazy(() => import('./Editor').then(m => ({ default: m.RichEditor })));

{showEditor && (
  <Suspense fallback={<EditorSkeleton />}>
    <RichEditor />
  </Suspense>
)}
```

### Preload on Hover
```tsx
const EditorModule = () => import('./Editor');
const LazyEditor = lazy(EditorModule);

<button
  onMouseEnter={() => EditorModule()} // preload
  onClick={() => setShowEditor(true)}
>
  Open Editor
</button>
```

---

## React Server Components (Zero Bundle)

```tsx
// These imports NEVER reach the client bundle
import { marked } from 'marked';     // ~50 kB
import { format } from 'date-fns';   // ~30 kB

export async function BlogPost({ slug }: { slug: string }) {
  const post = await db.post.findUnique({ where: { slug } });
  return (
    <article>
      <time>{format(post.createdAt, 'MMM d, yyyy')}</time>
      <div dangerouslySetInnerHTML={{ __html: marked(post.content) }} />
    </article>
  );
}
```

---

## Memoization

### React Compiler (Preferred — Auto)
With React Compiler enabled, manual `useMemo`/`useCallback`/`memo` are unnecessary. See [react-compiler.md](../core/react-compiler.md).

### Manual (When Needed)
```tsx
// Expensive computation
const filtered = useMemo(() =>
  items.filter(item => matchesSearch(item, query)),
  [items, query]
);

// Stable callback for child component
const handleClick = useCallback((id: string) => {
  setSelected(id);
}, []);

// Skip re-render if props unchanged
const ExpensiveChild = memo(function ExpensiveChild({ data }: Props) {
  return <HeavyVisualization data={data} />;
});
```

---

## Virtualization

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

function LargeList({ items }: { items: Item[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 64,
    overscan: 5,
  });

  return (
    <div ref={parentRef} style={{ height: '500px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map(vRow => (
          <div key={vRow.index} style={{
            position: 'absolute', top: 0, left: 0, width: '100%',
            height: `${vRow.size}px`,
            transform: `translateY(${vRow.start}px)`,
          }}>
            <ListItem item={items[vRow.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

| Rows | Strategy |
|------|----------|
| < 100 | No virtualization |
| 100 - 10K | TanStack Virtual |
| 10K+ | Virtual + server-side pagination |

---

## Web Vitals Optimization

### LCP (Largest Contentful Paint)
```tsx
// Preload hero image
<link rel="preload" as="image" href="/hero.jpg" />

// Next.js: priority prop
<Image src="/hero.jpg" alt="Hero" priority />

// Don't lazy-load above-the-fold images
```

### CLS (Cumulative Layout Shift)
```tsx
// Always set dimensions on images
<img src="..." width={800} height={600} />

// Reserve space for dynamic content
<div style={{ minHeight: '200px' }}>
  {data ? <Content /> : <Skeleton height={200} />}
</div>

// Use next/font for zero-CLS fonts
```

### INP (Interaction to Next Paint)
```tsx
// Use transitions for non-urgent updates
const [isPending, startTransition] = useTransition();
startTransition(() => setFilter(newFilter));

// Break up long tasks
async function processLargeDataset(items: Item[]) {
  for (let i = 0; i < items.length; i += 100) {
    processChunk(items.slice(i, i + 100));
    await new Promise(r => setTimeout(r, 0)); // yield to browser
  }
}
```

---

## Bundle Analysis

```bash
# Vite
npm install -D rollup-plugin-visualizer
# Add to vite.config.ts plugins

# Next.js
ANALYZE=true npm run build
# Requires @next/bundle-analyzer

# Check package size before installing
# https://bundlephobia.com
```

---

## Image Optimization

```tsx
// Next.js — automatic
import Image from 'next/image';
<Image src="/photo.jpg" width={800} height={600} alt="Photo" />

// Vite — use vite-imagetools or CDN (Cloudinary, imgix)
// Native: loading="lazy" for below-fold
<img src="/photo.jpg" loading="lazy" decoding="async" width={800} height={600} />
```

---

## Quick Checklist

- [ ] Route-based code splitting
- [ ] React Server Components for data-heavy pages
- [ ] Virtualize lists > 100 items
- [ ] `priority` on LCP images, `loading="lazy"` on rest
- [ ] `useTransition` for non-urgent state updates
- [ ] Bundle analysis — identify large dependencies
- [ ] `next/font` or self-hosted fonts (no layout shift)
- [ ] Enable React Compiler
