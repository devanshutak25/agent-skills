# React Compiler

## What It Does

The React Compiler (formerly React Forget) automatically applies memoization optimizations at build time. It analyzes your components and inserts the equivalent of `useMemo`, `useCallback`, and `React.memo` where beneficial.

## Status (2026)

- React Compiler v1.0 reached stable in October 2025
- Babel plugin: `babel-plugin-react-compiler`
- Meta reported: **12% faster initial page loads**, **2.5x faster interactions** in production

## What It Replaces

| Manual Code | Compiler Auto-Optimizes |
|-------------|------------------------|
| `useMemo(() => expensive(a, b), [a, b])` | Automatically memoizes expensive computations |
| `useCallback((x) => fn(x), [fn])` | Automatically stabilizes function references |
| `React.memo(Component)` | Automatically skips re-renders when props unchanged |

You can still write these manually — the compiler won't double-wrap. But for new code, you can skip them entirely.

## Setup

### Vite
```bash
npm install babel-plugin-react-compiler
```

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
  ],
});
```

### Next.js
```ts
// next.config.ts
const nextConfig = {
  experimental: {
    reactCompiler: true,
  },
};
export default nextConfig;
```

### With SWC (Vite)
If using `@vitejs/plugin-react-swc`, you need the SWC-based compiler plugin instead:
```bash
npm install @anthropic-ai/react-compiler-swc  # check actual package name
```

## Configuration

```ts
// babel-plugin-react-compiler options
{
  plugins: [
    ['babel-plugin-react-compiler', {
      // Target specific files/directories
      sources: (filename: string) => {
        return filename.includes('src/components');
      },
      // Compilation mode
      compilationMode: 'all', // 'all' | 'annotation'
    }],
  ],
}
```

### Annotation Mode
Opt-in per component with `'use memo'` directive:
```tsx
function ExpensiveList({ items }: { items: Item[] }) {
  'use memo';
  return items.map(item => <ExpensiveItem key={item.id} item={item} />);
}
```

### Opt-Out
Skip compilation for specific components:
```tsx
function ThirdPartyWrapper() {
  'use no memo';
  return <LegacyComponent />;
}
```

## Rules of React (Enforced)

The compiler assumes your code follows React's rules:
1. **Components are pure** — same props = same output
2. **Hooks follow the rules** — top-level only, same order every render
3. **No mutation of props/state** during render
4. **Side effects in useEffect** only, not during render

Code that violates these rules may produce incorrect optimizations.

## ESLint Plugin

```bash
npm install eslint-plugin-react-compiler
```

```json
{
  "plugins": ["react-compiler"],
  "rules": {
    "react-compiler/react-compiler": "error"
  }
}
```

Reports code patterns that would break compiler optimizations.

## DevTools Integration

React DevTools shows a "Memo" badge on components optimized by the compiler, distinguishing compiler-optimized from manually-memoized components.

## Migration Strategy

1. Add ESLint plugin first — fix violations
2. Enable compiler on a subset of files (`sources` option)
3. Monitor for regressions (especially in components with side effects in render)
4. Gradually expand to full codebase
5. Remove manual `useMemo`/`useCallback`/`memo` (optional — no harm in keeping)
