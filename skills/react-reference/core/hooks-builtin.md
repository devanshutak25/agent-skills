# Built-in React Hooks Reference

## State Hooks

### `useState<T>(initialState: T | (() => T)): [T, Dispatch<SetStateAction<T>>]`
```tsx
const [count, setCount] = useState(0);
setCount(5);             // direct value
setCount(prev => prev + 1); // updater function
```
- Initializer function runs only on first render
- `setState` with same value (Object.is) skips re-render
- Updates are batched in event handlers

### `useReducer<R>(reducer: R, initialArg, init?): [state, dispatch]`
```tsx
type Action = { type: 'increment' } | { type: 'set'; value: number };
function reducer(state: number, action: Action): number {
  switch (action.type) {
    case 'increment': return state + 1;
    case 'set': return action.value;
  }
}
const [count, dispatch] = useReducer(reducer, 0);
dispatch({ type: 'increment' });
```

---

## Context Hooks

### `useContext<T>(context: Context<T>): T`
```tsx
const theme = useContext(ThemeContext);
```
- Subscribes to nearest `<Context>` provider above
- Re-renders when context value changes

### `use(context)` (React 19)
Same as `useContext` but can be called conditionally. See [react-19-api.md](./react-19-api.md).

---

## Ref Hooks

### `useRef<T>(initialValue: T): MutableRefObject<T>`
```tsx
const inputRef = useRef<HTMLInputElement>(null);
// Access: inputRef.current
```
- Persists across re-renders, does NOT trigger re-render on mutation
- Common uses: DOM refs, storing previous values, instance variables

### `useImperativeHandle<T>(ref: Ref<T>, createHandle: () => T, deps?: DependencyList)`
```tsx
function FancyInput({ ref }: { ref: Ref<{ focus: () => void }> }) {
  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
  }), []);
  return <input ref={inputRef} />;
}
```

---

## Effect Hooks

### `useEffect(setup: () => (void | (() => void)), deps?: DependencyList)`
```tsx
useEffect(() => {
  const conn = createConnection(roomId);
  conn.connect();
  return () => conn.disconnect(); // cleanup
}, [roomId]);
```
- Runs after paint (non-blocking)
- Empty deps `[]` = mount/unmount only
- No deps = runs after every render

### `useLayoutEffect(setup, deps?)`
Same API as `useEffect` but fires **before browser paint**. Use for DOM measurements and synchronous visual updates.

### `useInsertionEffect(setup, deps?)`
Fires before DOM mutations. **Library authors only** — for injecting dynamic `<style>` tags.

### `useEffectEvent(fn)` (Experimental)
Creates a stable function that reads latest values without being a dependency:
```tsx
const onVisit = useEffectEvent((url: string) => {
  logVisit(url, numberOfItems); // always reads latest numberOfItems
});
useEffect(() => {
  onVisit(url);
}, [url]); // numberOfItems NOT in deps
```

---

## Performance Hooks

### `useMemo<T>(factory: () => T, deps: DependencyList): T`
```tsx
const filtered = useMemo(() => items.filter(predicate), [items, predicate]);
```
- Caches computation result between re-renders
- React Compiler may auto-insert these — see [react-compiler.md](./react-compiler.md)

### `useCallback<T extends Function>(fn: T, deps: DependencyList): T`
```tsx
const handleClick = useCallback((id: string) => {
  setSelected(id);
}, []);
```
Equivalent to `useMemo(() => fn, deps)`. Caches the function identity.

### `useTransition(): [isPending: boolean, startTransition: (action: () => void) => void]`
```tsx
const [isPending, startTransition] = useTransition();
startTransition(async () => {
  await updateData();       // React 19: async transitions
  setTab('results');
});
```
- Marks state updates as non-blocking (low priority)
- React 19: supports async functions in transitions
- See [suspense-transitions.md](./suspense-transitions.md)

### `useDeferredValue<T>(value: T, initialValue?: T): T`
```tsx
const deferredQuery = useDeferredValue(query);
// React 19: optional initial value for first render
const deferredQuery = useDeferredValue(query, '');
```
- Returns deferred version of a value
- Lets urgent updates render without waiting for expensive re-renders

---

## React 19 Hooks

### `useActionState<State>(action, initialState, permalink?): [state, dispatch, isPending]`
```tsx
const [state, submitAction, isPending] = useActionState(
  async (prev: FormState, formData: FormData) => {
    const error = await updateName(formData.get('name') as string);
    return error ? { error } : { success: true };
  },
  { error: null }
);

<form action={submitAction}>
  <input name="name" />
  <button disabled={isPending}>Save</button>
  {state.error && <p>{state.error}</p>}
</form>
```
- Manages Action state with automatic pending tracking
- Can be used with `<form action>` directly
- Sequential execution — multiple dispatches are queued

### `useOptimistic<T>(passthrough: T, reducer?): [optimistic: T, setOptimistic]`
```tsx
const [optimisticLikes, setOptimisticLikes] = useOptimistic(likes);

startTransition(async () => {
  setOptimisticLikes(prev => prev + 1); // instant UI update
  await saveLike();                      // rolls back on failure
});
```
- Shows optimistic value during async Action
- Auto-reverts to real state when transition completes
- Must be called inside `startTransition` or Action prop

### `useFormStatus(): { pending, data, method, action }` (react-dom)
```tsx
import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>Submit</button>;
}
```
- Reads status of parent `<form>` — no prop drilling needed
- Must be rendered inside a `<form>` that uses an Action

---

## Utility Hooks

### `useId(): string`
```tsx
const id = useId(); // ":r1:" — unique, stable across server/client
<label htmlFor={id}>Email</label>
<input id={id} />
```
- Generates unique IDs safe for SSR hydration
- Do NOT use for list keys

### `useSyncExternalStore<T>(subscribe, getSnapshot, getServerSnapshot?): T`
```tsx
const width = useSyncExternalStore(
  (cb) => { window.addEventListener('resize', cb); return () => window.removeEventListener('resize', cb); },
  () => window.innerWidth,
  () => 1024 // server snapshot
);
```
- Subscribe to external stores (Redux, browser APIs, etc.)
- Guarantees consistent reads during concurrent rendering

### `useDebugValue<T>(value: T, format?: (value: T) => string)`
```tsx
useDebugValue(isOnline ? 'Online' : 'Offline');
```
Labels custom hooks in React DevTools.
