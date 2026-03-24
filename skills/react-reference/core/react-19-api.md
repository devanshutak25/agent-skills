# React 19 API Reference

## New APIs

### `use(resource)`
Reads a Promise or Context during render. Unlike other hooks, can be called inside conditionals and loops.

```tsx
import { use } from 'react';

// Read a promise (suspends until resolved)
function Comments({ commentsPromise }: { commentsPromise: Promise<Comment[]> }) {
  const comments = use(commentsPromise);
  return comments.map(c => <p key={c.id}>{c.text}</p>);
}

// Read context conditionally (unlike useContext)
function Heading({ show }: { show: boolean }) {
  if (!show) return null;
  const theme = use(ThemeContext);
  return <h1 className={theme}>Hello</h1>;
}
```

**Key rules:**
- Cannot be used in try-catch blocks — use Error Boundaries instead
- Promises created in render are not supported — pass from Server Components or lift outside
- Resolved values must be serializable when crossing server/client boundary

### `cache(fn)` (Server Components only)
Memoizes function results across components within a single server request.

```tsx
import { cache } from 'react';

const getUser = cache(async (id: string) => {
  return await db.user.findUnique({ where: { id } });
});

// Both components share the same cached result
async function Profile({ id }: { id: string }) {
  const user = await getUser(id); // fetches
  return <Name user={user} />;
}
async function Avatar({ id }: { id: string }) {
  const user = await getUser(id); // cache hit
  return <img src={user.avatar} />;
}
```

**vs `useMemo` vs `memo`:**
| API | Scope | Environment |
|-----|-------|-------------|
| `cache` | Across components (per request) | Server Components |
| `useMemo` | Within single component | Client Components |
| `memo` | Prevents re-render if props unchanged | Client Components |

**Rules:** Define at module level, not inside components. Uses `Object.is` for cache key comparison — pass primitives for reliable hits.

---

## Actions (Async Form Handling)

React 19 integrates async functions with `<form>`:

```tsx
<form action={async (formData: FormData) => {
  'use server';
  await saveData(formData);
}}>
  <input name="email" />
  <button type="submit">Save</button>
</form>
```

Actions automatically manage pending states, errors, optimistic updates, and sequential requests. Forms reset on successful submission.

---

## `ref` as Prop (replaces `forwardRef`)

```tsx
// Before (React 18)
const Input = forwardRef<HTMLInputElement, Props>((props, ref) => (
  <input ref={ref} {...props} />
));

// After (React 19) — ref is just a prop
function Input({ ref, ...props }: Props & { ref?: React.Ref<HTMLInputElement> }) {
  return <input ref={ref} {...props} />;
}
```

`forwardRef` still works but is deprecated. Codemod: `npx types-react-codemod@latest preset-19`

### Ref Cleanup Functions

```tsx
<input ref={(el) => {
  // setup
  return () => {
    // cleanup on unmount (replaces ref called with null)
  };
}} />
```

---

## `<Context>` as Provider

```tsx
// Before
<ThemeContext.Provider value="dark">{children}</ThemeContext.Provider>

// After (React 19)
<ThemeContext value="dark">{children}</ThemeContext>
```

`<Context.Provider>` still works but is deprecated.

---

## Document Metadata

`<title>`, `<meta>`, `<link>` auto-hoist to `<head>` when rendered anywhere:

```tsx
function BlogPost({ post }: { post: Post }) {
  return (
    <article>
      <title>{post.title}</title>
      <meta name="description" content={post.summary} />
      <link rel="canonical" href={post.url} />
      <h1>{post.title}</h1>
    </article>
  );
}
```

Works in client-only apps, SSR, and Server Components.

---

## Stylesheet Precedence

```tsx
<link rel="stylesheet" href="base.css" precedence="default" />
<link rel="stylesheet" href="theme.css" precedence="high" />
```

React ensures correct insertion order and deduplicates across components.

---

## Resource Preloading APIs (`react-dom`)

```tsx
import { prefetchDNS, preconnect, preload, preinit } from 'react-dom';

preinit('/script.js', { as: 'script' });    // eager load + execute
preload('/font.woff2', { as: 'font' });     // preload
preconnect('https://api.example.com');       // early connection
prefetchDNS('https://cdn.example.com');      // DNS prefetch
```

---

## Static Rendering APIs (`react-dom/static`)

```tsx
import { prerender } from 'react-dom/static';

const { prelude } = await prerender(<App />, {
  bootstrapScripts: ['/main.js']
});
// prelude is a ReadableStream of complete HTML
```

`prerenderToNodeStream()` — same for Node.js streams.

---

## Error Handling Improvements

```tsx
createRoot(document.getElementById('root')!, {
  onCaughtError: (error, errorInfo) => { /* Error Boundary caught */ },
  onUncaughtError: (error, errorInfo) => { /* not caught */ },
  onRecoverableError: (error, errorInfo) => { /* auto-recovered */ },
});
```

Hydration errors now show a single message with a clear mismatch diff.

---

## Other React 19 Changes

- **Async scripts**: `<script async src="..." />` — auto-deduplicated
- **Custom Elements**: full Web Components support (proper property/attribute handling)
- **Third-party compatibility**: hydration skips unexpected tags from browser extensions
- **`useDeferredValue` initial value**: `useDeferredValue(value, initialValue)`

## Deprecated in React 19

| Deprecated | Replacement |
|-----------|-------------|
| `forwardRef` | `ref` as prop |
| `<Context.Provider>` | `<Context>` directly |
| `ReactDOM.useFormState` | `React.useActionState` |
| `ref` called with `null` on unmount | Ref cleanup functions |
