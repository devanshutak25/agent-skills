# Suspense & Transitions

## Suspense

### Basic Usage
```tsx
<Suspense fallback={<Spinner />}>
  <LazyComponent />
</Suspense>
```

Suspense shows `fallback` while children are "suspended" (loading). Triggers include:
- `React.lazy()` component loading
- `use(promise)` awaiting resolution
- Data fetching via Suspense-compatible libraries (TanStack Query, Relay)

### Nested Suspense
```tsx
<Suspense fallback={<PageSkeleton />}>
  <Header />
  <Suspense fallback={<SidebarSkeleton />}>
    <Sidebar />
  </Suspense>
  <Suspense fallback={<ContentSkeleton />}>
    <MainContent />
  </Suspense>
</Suspense>
```
- Each boundary is independent — inner components can load at different rates
- If a child suspends and no inner boundary exists, bubbles up to nearest parent `<Suspense>`

### Suspense with Server Components (Streaming SSR)
```tsx
async function Page() {
  return (
    <main>
      <Suspense fallback={<p>Loading comments...</p>}>
        <Comments /> {/* async server component — streams when ready */}
      </Suspense>
    </main>
  );
}
```
- Server sends HTML progressively as each boundary resolves
- Client hydrates independently per boundary (selective hydration)
- User interacts with hydrated parts while others still load

---

## useTransition

```tsx
const [isPending, startTransition] = useTransition();
```

Marks state updates as **non-urgent**. React keeps showing current UI while the transition renders in the background.

### Basic Usage
```tsx
function TabContainer() {
  const [tab, setTab] = useState('home');
  const [isPending, startTransition] = useTransition();

  function selectTab(nextTab: string) {
    startTransition(() => {
      setTab(nextTab); // non-blocking update
    });
  }

  return (
    <div>
      <TabBar onSelect={selectTab} />
      {isPending && <Spinner />}
      <TabContent tab={tab} />
    </div>
  );
}
```

### Async Transitions (React 19)
```tsx
const [isPending, startTransition] = useTransition();

function handleSubmit() {
  startTransition(async () => {
    const result = await saveData(formData);
    setStatus(result); // runs after await completes
  });
}
```
- `isPending` stays `true` through the entire async operation
- Errors in async transitions propagate to nearest Error Boundary

### `startTransition` (standalone)
```tsx
import { startTransition } from 'react';

// No isPending — use when you don't need pending state
startTransition(() => {
  setState(newValue);
});
```

### Key Behaviors
- Transition updates are **interruptible** — urgent updates (typing, clicking) take priority
- If component suspends inside transition, React shows **current** UI (not Suspense fallback)
- Multiple `startTransition` calls are batched

---

## useDeferredValue

```tsx
const deferredValue = useDeferredValue(value);
// React 19: with initial value
const deferredValue = useDeferredValue(value, initialValue);
```

Returns a deferred copy of a value. During urgent updates, React renders with the **old** deferred value first, then re-renders with the **new** value in the background.

### Search Input Pattern
```tsx
function SearchPage() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const isStale = query !== deferredQuery;

  return (
    <div>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <div style={{ opacity: isStale ? 0.5 : 1 }}>
        <SearchResults query={deferredQuery} />
      </div>
    </div>
  );
}
```

### With Suspense
```tsx
function App() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  return (
    <>
      <SearchInput value={query} onChange={setQuery} />
      <Suspense fallback={<Spinner />}>
        {/* Shows previous results while new ones load */}
        <Results query={deferredQuery} />
      </Suspense>
    </>
  );
}
```

---

## useTransition vs useDeferredValue

| Feature | `useTransition` | `useDeferredValue` |
|---------|----------------|-------------------|
| Controls | State update itself | A value (derived from state) |
| Use when | You own the state setter | You receive value as prop |
| `isPending` | Yes | Compare `value !== deferredValue` |
| Wraps | `setState` call | A value |

---

## Code Splitting with Suspense

### React.lazy
```tsx
const LazyEditor = lazy(() => import('./Editor'));

function App() {
  const [showEditor, setShowEditor] = useState(false);
  return (
    <div>
      <button onClick={() => setShowEditor(true)}>Open Editor</button>
      {showEditor && (
        <Suspense fallback={<EditorSkeleton />}>
          <LazyEditor />
        </Suspense>
      )}
    </div>
  );
}
```

### Route-Based Splitting
```tsx
const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
}
```

### Preloading Lazy Components
```tsx
const LazyEditor = lazy(() => import('./Editor'));

// Preload on hover
<button
  onMouseEnter={() => import('./Editor')}
  onClick={() => setShowEditor(true)}
>
  Open Editor
</button>
```
