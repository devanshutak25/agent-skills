# Project Structures

## Feature-Based (Recommended for Scale)

```
src/
  features/
    auth/
      api/                 # Feature-specific API calls
      components/          # Feature-specific components
      hooks/               # Feature-specific hooks
      stores/              # Feature state
      types/               # Feature types
      index.ts             # Public API barrel
    posts/
      api/
      components/
      hooks/
      types/
      index.ts
  components/              # Shared UI components (Button, Modal)
  hooks/                   # Shared hooks
  lib/                     # Third-party config (queryClient, axios)
  stores/                  # Global state (rarely needed)
  types/                   # Global TypeScript types
  utils/                   # Pure utility functions
  app.tsx
  main.tsx
```

### Feature Index (Controlled Public API)
```ts
// features/posts/index.ts
export { PostList } from './components/PostList';
export { PostCard } from './components/PostCard';
export { usePost } from './hooks/usePost';
export type { Post, CreatePostInput } from './types';
// Don't export internals
```

**Rule:** Features import from `shared`. Features do NOT import from other features.

---

## Layer-Based (Simple Apps)

```
src/
  components/      # All React components
  hooks/           # All custom hooks
  services/        # API calls
  stores/          # State management
  types/           # TypeScript interfaces
  utils/           # Pure functions
  pages/           # Route-level components
```

**Trade-off:** Simple to start, hard to navigate past ~20 components.

---

## Route-Based Colocation (Next.js)

```
app/
  (marketing)/
    page.tsx
    _components/        # Route-specific components
      Hero.tsx
  (app)/
    dashboard/
      page.tsx
      loading.tsx
      _components/
        StatsCard.tsx
    posts/
      [id]/
        page.tsx
        _components/
          PostContent.tsx
  _components/          # Shared (underscore = not a route)
  _lib/
```

---

## Feature Slices (FSD)

```
src/
  shared/              # Reusable primitives
    api/
    ui/
    lib/
  entities/            # Business objects (User, Post)
    user/
      model/
      ui/
      api/
  features/            # User interactions
    auth/
    create-post/
  widgets/             # Composed sections (Header, Sidebar)
  pages/               # Route-level
  app/                 # Entry, providers, routing
```

**Dependency rule:** `pages → widgets → features → entities → shared` (only import from lower layers).

---

## Monorepo

```
apps/
  web/                  # Next.js app
  admin/                # Admin app
  api/                  # API server (optional)
packages/
  ui/                   # Shared component library
  types/                # Shared TypeScript types
  utils/                # Shared utilities
  config/
    eslint/
    typescript/
    tailwind/
```

---

## Barrel Files

```ts
// components/index.ts
export { Button } from './Button';
export { Input } from './Input';
```

**Pros:** Clean imports, enforced public API
**Cons:** Potential tree-shaking issues, slow TS language server in huge codebases

**Safe practices:**
- Use named re-exports (not `export *`)
- Next.js: `optimizePackageImports` for third-party barrels
- Vite/webpack 5 handle ESM barrel tree-shaking correctly

---

## Choosing Guide

| Team / App Size | Structure |
|----------------|-----------|
| Solo / small | Layer-based |
| 2-5 devs | Feature-based |
| 5+ devs | Feature slices (FSD) |
| Multiple apps | Monorepo + feature-based per app |
| Next.js | Route-based colocation |
