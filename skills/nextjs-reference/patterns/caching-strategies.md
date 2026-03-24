# Caching Strategies

## Cache Layer Architecture

```
Browser Cache
  └── CDN / Edge Cache (Vercel Edge, Cloudflare)
        └── Full Route Cache (static HTML + RSC payload on disk)
              └── Data Cache (fetch() responses, persistent across requests)
                    └── Request Memoization (per-request dedup, in-memory only)
```

Each layer can be bypassed or configured independently. Lower layers are faster but narrower in scope.

## Static vs Dynamic Rendering Decision

| Condition | Rendering Mode |
|-----------|---------------|
| No dynamic APIs used, no `cache: 'no-store'` | Static (build time) |
| `cookies()`, `headers()`, `searchParams` used | Dynamic (per request) |
| `fetch` with `cache: 'no-store'` | Dynamic |
| `export const dynamic = 'force-static'` | Static (forced) |
| `export const dynamic = 'force-dynamic'` | Dynamic (forced) |
| `revalidate` set, no dynamic APIs | ISR |

```ts
// Force static even if dynamic APIs are present (will throw at runtime if used)
export const dynamic = 'force-static'

// Opt out of full route cache explicitly
export const dynamic = 'force-dynamic'

// ISR: revalidate every 60 seconds
export const revalidate = 60
```

## ISR: Incremental Static Regeneration

```ts
// app/posts/[slug]/page.tsx
export const revalidate = 3600 // revalidate at most every hour

// Generate static params at build time
export async function generateStaticParams() {
  const posts = await fetchPosts()
  return posts.map((p) => ({ slug: p.slug }))
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await fetch(`/api/posts/${slug}`).then((r) => r.json())
  return <article>{post.content}</article>
}
```

### On-Demand Revalidation

```ts
// app/api/revalidate/route.ts
import { revalidateTag, revalidatePath } from 'next/cache'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const { tag, path, secret } = await req.json()

  if (secret !== process.env.REVALIDATION_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (tag) revalidateTag(tag)
  if (path) revalidatePath(path)

  return Response.json({ revalidated: true })
}
```

```ts
// Tag data at fetch time
const data = await fetch('/api/posts', {
  next: { tags: ['posts'] },
})
```

## PPR: Partial Prerendering

PPR generates a static shell at build time and streams dynamic content into Suspense holes at request time.

```ts
// next.config.ts
import type { NextConfig } from 'next'

const config: NextConfig = {
  experimental: {
    ppr: true, // or 'incremental' to enable per-route
  },
}
export default config
```

```tsx
// app/dashboard/page.tsx
// Static shell renders at build time; dynamic content streams in
import { Suspense } from 'react'
import { UserGreeting } from './user-greeting' // dynamic (reads cookies)
import { StaticHero } from './static-hero'     // static

export default function DashboardPage() {
  return (
    <main>
      <StaticHero />
      <Suspense fallback={<p>Loading user...</p>}>
        <UserGreeting />
      </Suspense>
    </main>
  )
}
```

PPR requires that dynamic components sit inside a `<Suspense>` boundary. The boundary is the "hole" — the static shell is everything outside it.

## `"use cache"` Directive

Available in Next.js 15+ (canary) and 16. Replaces the implicit fetch cache with explicit function/component-level caching.

```ts
// Function-level cache
import { unstable_cacheLife as cacheLife, unstable_cacheTag as cacheTag } from 'next/cache'

async function getUser(id: string) {
  'use cache'
  cacheLife('hours') // built-in profile: seconds | minutes | hours | days | weeks | max
  cacheTag(`user-${id}`)

  return await db.user.findUnique({ where: { id } })
}
```

```tsx
// Component-level cache
async function ProductCard({ id }: { id: string }) {
  'use cache'
  cacheLife('minutes')
  cacheTag(`product-${id}`)

  const product = await fetchProduct(id)
  return <div>{product.name}</div>
}
```

### Custom `cacheLife` Profiles

```ts
// next.config.ts
const config: NextConfig = {
  experimental: {
    cacheLife: {
      frequent: { stale: 30, revalidate: 60, expire: 3600 },
    },
  },
}
```

## When to Use Each Strategy

| Use Case | Strategy | Config |
|----------|----------|--------|
| Marketing pages, blogs | Static | default or `revalidate = false` |
| Product listings (change hourly) | ISR | `revalidate = 3600` |
| Dashboard with static chrome + live data | PPR | `experimental.ppr: true` |
| Real-time feeds, user-specific pages | Dynamic | `dynamic = 'force-dynamic'` |
| Shared data read by many pages | `"use cache"` + `cacheTag` | per function |
| API aggregation with staleness tolerance | Data cache (`fetch` `next.revalidate`) | per fetch |

## Anti-Patterns

- **Caching user-specific data globally**: `"use cache"` at page level with personalized content leaks data across users. Always scope with `cacheTag` per user ID and validate session before returning.
- **Over-caching mutations**: Calling `revalidateTag` inside a cached function is a no-op. Revalidation must happen in Server Actions or Route Handlers outside the cache boundary.
- **Stale closures in cached functions**: Variables captured from outer scope are not part of the cache key. Pass all inputs as explicit arguments.
- **Using `force-dynamic` on every page**: Disables all caching benefits. Use only where real-time data is strictly required.
- **ISR with `generateStaticParams` returning nothing**: Falls back to dynamic rendering on first request. Pre-generate at least the top-N paths.

## Cross-References

- [Cache Components](../core/cache-components.md)
- [Server Actions](../core/server-actions.md)
- [Configuration](../core/configuration.md)
