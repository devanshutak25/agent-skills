# Cache & "use cache"

## Overview

Next.js 16 introduces the stable `"use cache"` directive as the primary caching primitive, replacing `unstable_cache` and the per-fetch `cache` option. It operates at three levels: function, component, and module.

## `"use cache"` Directive

```ts
// Function-level — most common
import { unstable_cacheLife as cacheLife, unstable_cacheTag as cacheTag } from 'next/cache'

async function getProducts() {
  'use cache'
  cacheLife('hours')
  cacheTag('products')
  return db.query('SELECT * FROM products')
}

// Component-level — cache the rendered output
async function ProductList() {
  'use cache'
  cacheLife('minutes')
  cacheTag('products')
  const products = await getProducts()
  return <ul>{products.map(p => <li key={p.id}>{p.name}</li>)}</ul>
}

// Module-level — all exports in the file are cached
'use cache'
import { cacheLife } from 'next/cache'
cacheLife('days')
export async function getConfig() { ... }
export async function getFeatureFlags() { ... }
```

When to use each level:
- **Function** — data fetching, DB queries, external API calls
- **Component** — expensive render trees that combine multiple data sources
- **Module** — utility files where every export should be cached with the same policy

## `cacheLife()` Profiles

Built-in named profiles:

| Profile | `stale` | `revalidate` | `expire` | Use case |
|---------|---------|-------------|---------|---------|
| `"seconds"` | 0s | 1s | 10s | Real-time dashboards |
| `"minutes"` | 0s | 1min | 10min | Frequently updated content |
| `"hours"` | 5min | 1hr | 4hrs | Product listings, blog posts |
| `"days"` | 5min | 1day | 7days | Static-ish content |
| `"weeks"` | 5min | 7days | 30days | Rarely changing data |
| `"max"` | 5min | 365days | 365days | Immutable assets, fonts |

Custom profile:

```ts
import { unstable_cacheLife as cacheLife } from 'next/cache'

async function getUserProfile(id: string) {
  'use cache'
  cacheLife({
    stale: 30,         // serve stale for 30s without revalidating
    revalidate: 300,   // revalidate in background after 5min
    expire: 3600,      // hard expiry at 1hr — next request triggers fresh fetch
  })
  return db.users.findById(id)
}
```

Custom profiles can also be defined in `next.config.ts` for reuse:

```ts
// next.config.ts
const config: NextConfig = {
  cacheHandlers: {},
  experimental: {
    cacheLife: {
      'product-listing': { stale: 60, revalidate: 600, expire: 3600 },
    },
  },
}
```

Then use: `cacheLife('product-listing')`.

## `cacheTag()` — Targeted Revalidation

```ts
import { unstable_cacheTag as cacheTag, revalidateTag } from 'next/cache'

// Tag when caching
async function getPost(id: string) {
  'use cache'
  cacheTag(`post-${id}`, 'posts')
  return db.posts.findById(id)
}

// Invalidate in a Server Action
'use server'
export async function updatePost(id: string, data: PostData) {
  await db.posts.update(id, data)
  revalidateTag(`post-${id}`)  // invalidate only this post
  revalidateTag('posts')       // or invalidate all posts
}
```

Tags propagate: if a cached function calls another cached function with a tag, the parent inherits the child's tags.

## Migration from v15 Patterns

| v15 Pattern | v16 Equivalent | Notes |
|------------|---------------|-------|
| `unstable_cache(fn, keys, { tags, revalidate })` | `'use cache'` + `cacheTag()` + `cacheLife()` | Remove `unstable_` prefix pattern entirely |
| `fetch(url, { next: { revalidate: 60 } })` | `'use cache'` wrapper function | fetch inside `'use cache'` inherits the function's cache policy |
| `fetch(url, { next: { tags: ['x'] } })` | `cacheTag('x')` in the wrapping function | Same invalidation via `revalidateTag` |
| `fetch(url, { cache: 'no-store' })` | `cacheLife({ stale: 0, revalidate: 0, expire: 0 })` | Or use `noStore()` from `next/cache` |
| `cache()` from React | Still works for request-level dedup | Not for persistent caching |

`fetch()` cache options still work but `"use cache"` is the preferred path for new code.

## Partial Prerendering (PPR)

PPR splits a route into a static shell and dynamic holes at build time. `<Suspense>` boundaries define where the split happens.

```tsx
// next.config.ts — enable PPR
const config: NextConfig = {
  experimental: { ppr: true },
}

// app/product/[id]/page.tsx
import { Suspense } from 'react'
import { ProductDetails } from '@/components/product-details' // static — "use cache"
import { StockStatus } from '@/components/stock-status'       // dynamic — no cache

export default function ProductPage() {
  return (
    <>
      {/* Rendered at build time and served from CDN */}
      <ProductDetails />

      {/* Streamed at request time — dynamic hole */}
      <Suspense fallback={<StockSkeleton />}>
        <StockStatus />
      </Suspense>
    </>
  )
}
```

Enable PPR per route:

```ts
// Override config for a specific route
export const experimental_ppr = true
```

PPR requires `experimental.ppr: 'incremental'` in `next.config.ts` when opting in per route.

## Route Segment Config

```ts
// app/dashboard/page.tsx

// Force all fetches in this route to be dynamic (no caching)
export const dynamic = 'force-dynamic'

// Force static — throw if dynamic APIs are used
export const dynamic = 'force-static'

// Throw at build if the route cannot be statically rendered
export const dynamic = 'error'

// ISR: revalidate the whole route every N seconds
export const revalidate = 60

// Prevent dynamic params beyond generateStaticParams
export const dynamicParams = false

// Runtime selection
export const runtime = 'edge' // or 'nodejs' (default)
```

`revalidate` at the route segment level is the ISR equivalent — the lowest `revalidate` value across all fetches and the segment config wins.

## Cached DB Query Pattern

```ts
// lib/queries.ts
import { unstable_cacheTag as cacheTag, unstable_cacheLife as cacheLife } from 'next/cache'

export async function getPublishedPosts() {
  'use cache'
  cacheLife('hours')
  cacheTag('posts')
  return db.posts.findMany({ where: { published: true }, orderBy: { createdAt: 'desc' } })
}

export async function getPostBySlug(slug: string) {
  'use cache'
  cacheLife('hours')
  cacheTag(`post-${slug}`, 'posts')
  return db.posts.findUnique({ where: { slug } })
}
```

## Cached API Call Pattern

```ts
// lib/external.ts
export async function getExchangeRates(base: string) {
  'use cache'
  cacheLife('minutes')
  cacheTag('exchange-rates')
  const res = await fetch(`https://api.exchangerate.host/latest?base=${base}`)
  if (!res.ok) throw new Error('Failed to fetch exchange rates')
  return res.json()
}
```

## Component-Level Cache with Tags

```tsx
// components/product-list.tsx
import { unstable_cacheTag as cacheTag, unstable_cacheLife as cacheLife } from 'next/cache'

async function ProductList({ category }: { category: string }) {
  'use cache'
  cacheLife('hours')
  cacheTag('products', `category-${category}`)

  const products = await db.products.findMany({ where: { category } })
  return (
    <ul>
      {products.map(p => (
        <li key={p.id}>
          <a href={`/products/${p.slug}`}>{p.name}</a>
        </li>
      ))}
    </ul>
  )
}
```

## Revalidation in a Server Action

```ts
// lib/actions.ts
'use server'
import { revalidateTag, revalidatePath } from 'next/cache'

export async function publishPost(id: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  await db.posts.update({ where: { id }, data: { published: true } })
  revalidateTag(`post-${id}`)   // targeted — only this post's cache entries
  revalidateTag('posts')        // broad — all post listing caches
  revalidatePath('/blog')       // also revalidate the blog index path
}
```

## Anti-Patterns

| Anti-pattern | Problem | Fix |
|-------------|---------|-----|
| Caching user-specific data without user ID in cache key | Different users see same data | Include `userId` in the function arguments so cache key is unique per user |
| `'use cache'` on a component that reads `cookies()`/`headers()` | Dynamic data makes cache useless or throws | Move dynamic reads outside the cached boundary |
| Module-level `'use cache'` on files with mixed cache policies | All exports share same policy | Use function-level `'use cache'` instead |
| Forgetting `cacheTag()` on mutable data | Cannot invalidate without a tag | Always tag data you mutate via Server Actions |
| Overly broad `revalidateTag('all')` | Nukes entire cache on any mutation | Use fine-grained tags per resource type and ID |
| Caching inside a `'use client'` file | `'use cache'` only works on the server | Move to a server-side module |

## Cross-References

- [Caching Strategies](../patterns/caching-strategies.md) — patterns for ISR, on-demand revalidation, SWR
- [Server Actions](./server-actions.md) — `revalidateTag`/`revalidatePath` in mutations
- [App Router](./app-router.md) — `revalidate`, `dynamic` segment config
