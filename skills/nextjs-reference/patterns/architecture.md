# Architecture

## Server/Client Boundary Placement

**Rule**: push `'use client'` as deep as possible. Every component above the boundary is a Server Component and can fetch data, read env vars, and access the filesystem directly.

```
app/
  layout.tsx          ← Server (auth, session, nav data)
  page.tsx            ← Server (data fetching)
    ProductList.tsx   ← Server (renders list)
      ProductCard.tsx ← Server (renders individual card)
        AddToCart.tsx ← 'use client' (button click handler)
```

Only `AddToCart.tsx` needs `'use client'`. Everything above it stays server-side.

## Component Hierarchy Pattern

```tsx
// app/shop/page.tsx — Server Component, fetches data
import { ProductList } from '@/features/shop/components/product-list'

export default async function ShopPage() {
  const products = await fetchProducts()
  return <ProductList products={products} />
}
```

```tsx
// features/shop/components/product-list.tsx — Server Component, renders list
import { AddToCart } from './add-to-cart'

export function ProductList({ products }: { products: Product[] }) {
  return (
    <ul>
      {products.map((p) => (
        <li key={p.id}>
          <span>{p.name}</span>
          <AddToCart productId={p.id} /> {/* client island */}
        </li>
      ))}
    </ul>
  )
}
```

```tsx
// features/shop/components/add-to-cart.tsx — Client Component
'use client'
import { addToCart } from '../actions'

export function AddToCart({ productId }: { productId: string }) {
  return <button onClick={() => addToCart(productId)}>Add</button>
}
```

## Route Colocation

Keep components, hooks, and utils next to the routes that use them. Prefix with `_` or `(folders)` to prevent accidental routing.

```
app/
  dashboard/
    _components/         # not a route — colocated components
      stats-card.tsx
      recent-activity.tsx
    _hooks/
      use-dashboard-data.ts
    layout.tsx
    page.tsx
    loading.tsx
    error.tsx
```

## Feature-Based Organization

Preferred for apps with 10+ routes or domain complexity. Routes remain thin; logic lives in `features/`.

```
src/
  app/
    shop/
      page.tsx           # imports from features/shop
      [id]/
        page.tsx
  features/
    shop/
      components/
        product-list.tsx
        product-card.tsx
      actions/
        add-to-cart.ts
      queries/
        get-products.ts
      types.ts
    auth/
      components/
      actions/
  lib/
    db.ts
    auth.ts
  components/
    ui/                  # shared primitives (shadcn, etc.)
```

### Barrel Exports for Features

```ts
// features/shop/index.ts
export { ProductList } from './components/product-list'
export { addToCart } from './actions/add-to-cart'
export type { Product } from './types'
```

Use sparingly — barrel exports can break tree shaking if a bundler cannot statically analyze them.

## Shared Layouts and Nested Layouts

```
app/
  layout.tsx                  # root layout — html, body, fonts, global providers
  (marketing)/
    layout.tsx                # marketing shell — nav, footer
    page.tsx                  # homepage
    about/page.tsx
  (app)/
    layout.tsx                # app shell — sidebar, auth check
    dashboard/page.tsx
    settings/page.tsx
```

Route groups `(folder)` share a layout without affecting the URL. Use them to apply different shells to different sections.

## Route Groups for Organizational Boundaries

| Pattern | Purpose |
|---------|---------|
| `(marketing)` | Marketing pages with different layout from app |
| `(auth)` | Login/signup pages with minimal layout |
| `(app)` | Authenticated app section |
| `(admin)` | Admin section with admin layout + auth |

## Monorepo Setup with Turborepo

```
apps/
  web/                  # Next.js app
  docs/                 # separate Next.js site
packages/
  ui/                   # shared React components (no framework deps)
  db/                   # Prisma schema + client
  config/               # shared tsconfig, eslint, tailwind configs
  auth/                 # shared auth config and types
turbo.json
```

```json
// packages/ui/package.json
{
  "name": "@acme/ui",
  "exports": {
    "./button": "./src/components/button.tsx"
  }
}
```

Mark shared packages as `"internal"` (no publish) by omitting `"version"` and `"private": true`. Use `transpilePackages` in `next.config.ts` to compile them:

```ts
// apps/web/next.config.ts
const config: NextConfig = {
  transpilePackages: ['@acme/ui', '@acme/auth'],
}
```

## `src/` Directory Convention

| Use `src/` | Do not use `src/` |
|------------|-------------------|
| Team preference for separating source from config | Small projects, solo developer |
| Co-existing `test/` at root level | Monorepo workspace package |
| Aligning with non-Next.js conventions in monorepo | Already using `app/` at root |

When using `src/`, place `app/`, `lib/`, `features/`, and `components/` all under `src/`. Config files (`next.config.ts`, `tailwind.config.ts`) stay at the project root.

## Anti-Patterns

- **Putting all components in `app/components/`**: Breaks colocation. Move shared-only components there; keep route-specific ones beside the route.
- **Deep barrel re-exports**: `index.ts` that re-exports from other `index.ts` files defeats static analysis and slows builds.
- **`'use client'` at layout level**: Forces the entire subtree to be client-rendered. Move interactivity to leaf components.
- **Mixing server and client logic in one file**: If a file has `'use client'`, none of its imports are server-only. Separate data-fetching from interaction logic.

## Cross-References

- [Project Structures](../templates/project-structures.md)
- [TypeScript Patterns](./typescript-patterns.md)
- [Caching Strategies](./caching-strategies.md)
