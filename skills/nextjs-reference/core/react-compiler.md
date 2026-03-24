# React Compiler

## Status in Next.js 16

React Compiler is **stable and enabled by default** in Next.js 16. No experimental flag required. For projects upgrading from v15, it was under `experimental.reactCompiler`.

```ts
// next.config.ts — Next.js 16 (stable, on by default)
import type { NextConfig } from 'next'

const config: NextConfig = {
  // reactCompiler is enabled by default in v16
  // To disable entirely:
  reactCompiler: false,
}

export default config
```

## What the Compiler Does

React Compiler automatically inserts memoization at the JavaScript level during the build step. It analyzes components and hooks for compliance with the Rules of React, then generates optimized output — equivalent to manually wrapping values in `useMemo`, `useCallback`, and components in `React.memo`.

```tsx
// You write this
function ProductCard({ product }: { product: Product }) {
  const price = formatPrice(product.price, product.currency)
  return <div>{product.name}: {price}</div>
}

// Compiler generates the equivalent of this (conceptually)
const ProductCard = React.memo(function ProductCard({ product }: { product: Product }) {
  const price = useMemo(
    () => formatPrice(product.price, product.currency),
    [product.price, product.currency]
  )
  return <div>{product.name}: {price}</div>
})
```

## What to Remove

With React Compiler active, most manual memoization is redundant. The compiler handles it with finer granularity than manual annotations.

| Before | After |
|--------|-------|
| `useMemo(() => compute(a, b), [a, b])` | Just `compute(a, b)` |
| `useCallback((e) => handler(e, id), [id])` | Just `(e) => handler(e, id)` |
| `React.memo(Component)` | Just `Component` |

Do not remove these immediately in bulk. Let the compiler take over, verify with profiler, then clean up incrementally.

## When Manual Memoization Is Still Needed

These cases are NOT handled by the compiler:

| Case | Reason |
|------|--------|
| Referential stability for third-party libs (e.g., passing a callback to a non-React event emitter) | Compiler only optimizes React render paths |
| Objects passed to `useEffect` deps that must be stable across renders | Compiler cannot reason about effects with complex dep requirements |
| Components that intentionally mutate state in ways that violate Rules of React | Compiler will skip — opt out explicitly |
| `useMemo` for side-effect-free expensive pure computation depended on by multiple consumers | Compiler may inline it into each consumer — profile if needed |

## `'use no memo'` — Per-File Opt-Out

```tsx
// Opt out of compiler optimization for this file
'use no memo'

// Useful when:
// - A third-party component requires reference-stable callbacks
// - The component uses patterns the compiler cannot yet handle
// - Debugging a compiler-related regression

export function LegacyChart({ data }: { data: DataPoint[] }) {
  const handleClick = useCallback(() => console.log('clicked'), [])
  return <ThirdPartyChart data={data} onPointClick={handleClick} />
}
```

Prefer per-component opt-out over per-file when only one component is problematic.

## Rules of React Enforcement

The compiler enforces Rules of React at build time and will skip (not break) non-compliant components:

- Components and hooks must be pure functions with respect to render
- Hooks must only be called at the top level of components/hooks
- State must not be mutated directly
- No side effects during render

If the compiler skips a component, it logs a warning during build. The component still works — it just gets no automatic memoization.

## ESLint Plugin

```bash
npm install --save-dev eslint-plugin-react-compiler
```

```json
// .eslintrc.json
{
  "plugins": ["react-compiler"],
  "rules": {
    "react-compiler/react-compiler": "error"
  }
}
```

The plugin surfaces Rules of React violations that would cause the compiler to skip a component. Run it in CI to keep the codebase compiler-compatible.

## Verifying Compiler Output

Use React DevTools (v5+) to see which components were optimized. Components compiled by the React Compiler show a "Memo ✓" badge in the component tree.

Alternatively, check build output — the compiler emits a summary of how many components were optimized vs skipped.

## Cross-References

- [react-reference React Compiler](../../react-reference/core/react-compiler.md) — React-level compiler details, Rules of React
- [Configuration](./configuration.md) — `next.config.ts` options
