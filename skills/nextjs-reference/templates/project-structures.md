# Project Structures

## Route-Based (Default)

Everything colocated alongside its route. Components and utilities live beside the pages that use them. Best for small to medium apps with clear route ownership.

```
app/
  layout.tsx
  page.tsx
  dashboard/
    _components/
      stats-card.tsx
      activity-feed.tsx
    layout.tsx
    page.tsx
    loading.tsx
    error.tsx
  posts/
    [slug]/
      _components/
        share-button.tsx
      page.tsx
      not-found.tsx
lib/
  db.ts
  auth.ts
  utils.ts
components/
  ui/
    button.tsx
    input.tsx
public/
next.config.ts
```

Prefix private folders with `_` to signal they are not routes. Next.js ignores `_` prefixed folders for routing.

## Feature-Based

Route files are thin entry points; all logic lives in `features/`. Best for larger teams where domain ownership matters.

```
app/
  layout.tsx
  page.tsx
  (auth)/
    login/page.tsx
    signup/page.tsx
  (app)/
    layout.tsx
    dashboard/page.tsx       → imports from features/dashboard
    settings/page.tsx        → imports from features/settings
    posts/
      page.tsx               → imports from features/posts
      [slug]/page.tsx
src/
  features/
    dashboard/
      components/
        stats-card.tsx
        revenue-chart.tsx
      actions/
        refresh-stats.ts
      queries/
        get-dashboard-data.ts
      types.ts
      index.ts               ← barrel export (selective)
    posts/
      components/
      actions/
      queries/
      types.ts
    auth/
      components/
        login-form.tsx
      actions/
        sign-in.ts
  lib/
    db.ts
    auth.ts
  components/
    ui/                      ← shadcn/ui or shared primitives
    server/                  ← shared server components
```

## `src/` Convention

| Use `src/` | Do not use `src/` |
|------------|-------------------|
| Personal/team preference for separation | Solo project with simple structure |
| Monorepo where root holds config files | `app/` at root already established |
| Consistency with non-Next.js packages in monorepo | Framework docs examples |

When using `src/`, `app/`, `lib/`, `features/`, and `components/` all move inside `src/`. Config files (`next.config.ts`, `tailwind.config.ts`, `tsconfig.json`) remain at the project root.

```
my-app/
  src/
    app/
    features/
    lib/
    components/
  public/
  next.config.ts
  tailwind.config.ts
  tsconfig.json
  package.json
```

## Monorepo with Turborepo

```
my-monorepo/
  apps/
    web/                    ← Next.js app
      src/
        app/
        features/
      next.config.ts
      package.json
    admin/                  ← separate Next.js app
      src/
        app/
      next.config.ts
      package.json
  packages/
    ui/                     ← shared React components
      src/
        components/
          button.tsx
          dialog.tsx
      package.json          ← "name": "@acme/ui"
    db/                     ← Prisma schema + client
      prisma/
        schema.prisma
      src/
        index.ts
      package.json          ← "name": "@acme/db"
    auth/                   ← Auth.js config + session types
      src/
        index.ts
      package.json          ← "name": "@acme/auth"
    config/
      eslint/
        base.js
      typescript/
        base.json
      package.json          ← "name": "@acme/config"
  turbo.json
  package.json              ← workspace root
```

```ts
// apps/web/next.config.ts
import type { NextConfig } from 'next'

const config: NextConfig = {
  transpilePackages: ['@acme/ui', '@acme/auth'],
}

export default config
```

```json
// turbo.json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**"]
    },
    "dev": { "cache": false, "persistent": true },
    "lint": {},
    "typecheck": {}
  }
}
```

## Shared Component Organization

```
components/
  ui/                       ← client-compatible primitives (shadcn, radix)
    button.tsx
    dialog.tsx
    input.tsx
  server/                   ← server-only components (no 'use client', may fetch data)
    user-avatar.tsx
    page-header.tsx
  layouts/                  ← layout-level shared components
    site-nav.tsx
    site-footer.tsx
```

Mark server components with a `server-only` import to enforce the boundary:

```ts
// components/server/user-avatar.tsx
import 'server-only'

export async function UserAvatar({ userId }: { userId: string }) {
  const user = await db.user.findUnique({ where: { id: userId } })
  return <img src={user?.image ?? '/default-avatar.png'} alt={user?.name ?? ''} />
}
```

## Structure Comparison

| Factor | Route-based | Feature-based | Monorepo |
|--------|-------------|---------------|----------|
| Setup complexity | Low | Medium | High |
| Team size | 1–3 | 3–10 | 5+ |
| Code sharing | Per-route | Cross-feature | Cross-app |
| Test isolation | Hard | Easy | Easiest |
| CI speed | Fast | Fast | Needs caching |
| When routes > 20 | Gets messy | Scales well | Scales best |

## Anti-Patterns

- **All components in `app/components/`**: No colocation. Move route-specific components beside the route.
- **No `server-only` guard on server components**: They can be accidentally imported in client files. Add `import 'server-only'` to files that use `db`, `cookies`, or `headers`.
- **Monorepo packages with deep relative imports**: Use package exports (`"exports"` in `package.json`) instead of `../../packages/ui/src/button`.
- **Feature barrel that re-exports everything**: Creates bundle analysis blind spots. Export only the public surface.

## Cross-References

- [Architecture](../patterns/architecture.md)
- [Starter Templates](./starter-templates.md)
- [Deployment](../deployment/deployment.md)
