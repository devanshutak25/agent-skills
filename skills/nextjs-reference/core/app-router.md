# App Router

## File Conventions

| File | Purpose | Notes |
|------|---------|-------|
| `page.tsx` | Route UI, makes segment publicly accessible | Required for a route to be accessible |
| `layout.tsx` | Shared UI wrapping children, persists across navigations | Does NOT remount on navigation |
| `template.tsx` | Like layout but remounts on every navigation | Use when you need fresh state per navigation |
| `loading.tsx` | Suspense boundary wrapper, shown during segment load | Auto-wraps `page.tsx` in `<Suspense>` |
| `error.tsx` | Error boundary for the segment | Must be a Client Component (`'use client'`) |
| `global-error.tsx` | Catches errors in root layout | Replaces root layout when active — include `<html>/<body>` |
| `not-found.tsx` | Rendered when `notFound()` is thrown | Also handles unmatched routes at root |
| `default.tsx` | Fallback for parallel routes when slot has no match | Required to avoid 404 in parallel route setups |
| `route.ts` | API endpoint — exports HTTP method handlers | Cannot coexist with `page.tsx` in same segment |

## Route Segments

### Dynamic Routes

```tsx
// app/blog/[slug]/page.tsx — single dynamic segment
// app/blog/[...slug]/page.tsx — catch-all (matches /blog/a/b/c)
// app/blog/[[...slug]]/page.tsx — optional catch-all (matches /blog too)

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params // params is async in Next.js 15+
  return <h1>{slug}</h1>
}
```

### Route Groups

```
app/
  (marketing)/
    about/page.tsx      → /about
    contact/page.tsx    → /contact
  (app)/
    dashboard/page.tsx  → /dashboard
```

Route groups `(name)` do not affect the URL. Use them to share layouts between routes without affecting the path, or to split the app into logical sections with different layouts.

### Parallel Routes

```
app/
  layout.tsx
  @team/page.tsx        → rendered in {team} slot
  @analytics/page.tsx   → rendered in {analytics} slot
  page.tsx
```

```tsx
// app/layout.tsx
export default function Layout({
  children,
  team,
  analytics,
}: {
  children: React.ReactNode
  team: React.ReactNode
  analytics: React.ReactNode
}) {
  return (
    <>
      {children}
      {team}
      {analytics}
    </>
  )
}
```

### Intercepting Routes

| Convention | Intercepts |
|-----------|-----------|
| `(.)segment` | Same level |
| `(..)segment` | One level up |
| `(..)(..)segment` | Two levels up |
| `(...)segment` | From root |

Intercepting routes let you load a route within the current layout (e.g., opening a photo in a modal while the URL updates). Direct navigation to the URL shows the full page.

## Async APIs (Next.js 15+)

`cookies()`, `headers()`, `params`, and `searchParams` are all async — they return Promises.

```tsx
import { cookies, headers } from 'next/headers'

// In a Server Component or Route Handler
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ q?: string }>
}) {
  const { id } = await params
  const { q } = await searchParams
  const cookieStore = await cookies()
  const headersList = await headers()

  const token = cookieStore.get('token')
  const userAgent = headersList.get('user-agent')

  return <div>{id}</div>
}
```

## Static Generation with `generateStaticParams`

```tsx
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await fetchAllPosts()
  return posts.map((post) => ({ slug: post.slug }))
}

// Statically generates all returned param combinations at build time
// Requests for params NOT in this list → 404 (set dynamicParams = false)
export const dynamicParams = false // default: true
```

## Metadata API

```tsx
import type { Metadata, ResolvingMetadata } from 'next'

// Static metadata
export const metadata: Metadata = {
  title: 'My Page',
  description: 'Page description',
  openGraph: {
    title: 'My Page',
    images: ['/og-image.png'],
  },
}

// Dynamic metadata
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { slug } = await params
  const post = await fetchPost(slug)
  const parentOG = (await parent).openGraph?.images ?? []

  return {
    title: post.title,
    openGraph: {
      images: [post.image, ...parentOG],
    },
  }
}
```

`generateMetadata` is deduplicated with the same fetch call in `page.tsx` — no double fetching.

## Navigation

```tsx
// Server: redirect (throws — do not use in try/catch)
import { redirect, permanentRedirect, notFound } from 'next/navigation'

redirect('/login')           // 307 temporary
permanentRedirect('/new')    // 308 permanent
notFound()                   // triggers not-found.tsx

// Client: Link component
import Link from 'next/link'
<Link href="/about" prefetch={false}>About</Link>

// Client: programmatic navigation
'use client'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
const router = useRouter()
router.push('/dashboard')
router.replace('/login')
router.prefetch('/heavy-page')
```

**When to use `redirect()` vs `<Link>`:**
- `redirect()` — after server-side logic (auth check, form submission, missing data)
- `<Link>` — user-initiated navigation, supports prefetching
- `useRouter().push()` — programmatic client-side navigation after events

## Cross-References

- [Server Components](./server-components.md) — rendering model, RSC patterns
- [Cache & use cache](./cache-components.md) — `generateStaticParams`, ISR, PPR
- [Configuration](./configuration.md) — `next.config.ts` redirects/rewrites
