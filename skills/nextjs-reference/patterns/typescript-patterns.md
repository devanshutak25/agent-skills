# TypeScript Patterns

## Page and Layout Props

In Next.js 15+, `params` and `searchParams` are Promises. Await them before destructuring.

```ts
// app/posts/[slug]/page.tsx
type PageProps = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ q?: string; page?: string }>
}

export default async function PostPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const { q, page = '1' } = await searchParams

  const post = await fetchPost(slug)
  return <article>{post.content}</article>
}
```

```ts
// app/[lang]/[slug]/layout.tsx
type LayoutProps = {
  children: React.ReactNode
  params: Promise<{ lang: string; slug: string }>
}

export default async function SlugLayout({ children, params }: LayoutProps) {
  const { lang } = await params
  return <div lang={lang}>{children}</div>
}
```

## Route Params: `generateStaticParams`

```ts
// app/posts/[slug]/page.tsx
export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const posts = await fetchAllPosts()
  return posts.map((p) => ({ slug: p.slug }))
}
```

The return type must match the segment parameter shape. TypeScript will catch mismatches.

## Server Action Types

```ts
// features/posts/actions.ts
'use server'

import { z } from 'zod'

const CreatePostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
})

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function createPost(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const raw = Object.fromEntries(formData)
  const parsed = CreatePostSchema.safeParse(raw)

  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors.title?.[0] ?? 'Invalid input' }
  }

  const post = await db.post.create({ data: parsed.data })
  return { success: true, data: { id: post.id } }
}
```

## Metadata Types

```ts
import type { Metadata, ResolvingMetadata } from 'next'

// Static
export const metadata: Metadata = {
  title: { template: '%s | Site', default: 'Site' },
  description: 'Description',
  metadataBase: new URL('https://acme.com'),
}

// Dynamic
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params
  const post = await fetchPost(slug)
  return { title: post.title }
}
```

## Route Handler Types

```ts
// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(
  req: NextRequest,
  { params }: RouteContext
): Promise<NextResponse> {
  const { id } = await params
  const user = await db.user.findUnique({ where: { id } })

  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(user)
}

export async function PATCH(
  req: NextRequest,
  { params }: RouteContext
): Promise<NextResponse> {
  const { id } = await params
  const body: unknown = await req.json()
  // validate body with Zod before use
  return NextResponse.json({ id })
}
```

## NextConfig Type

```ts
// next.config.ts
import type { NextConfig } from 'next'

const config: NextConfig = {
  experimental: {
    ppr: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.acme.com' },
    ],
  },
  transpilePackages: ['@acme/ui'],
}

export default config
```

## Strict Null Checks with Async APIs

`cookies()`, `headers()`, and `searchParams` can all return `undefined` values. Handle them explicitly.

```ts
import { cookies, headers } from 'next/headers'

export async function getTheme(): Promise<'dark' | 'light'> {
  const cookieStore = await cookies()
  const theme = cookieStore.get('theme')?.value
  return theme === 'dark' ? 'dark' : 'light'
}

export async function getLocale(): Promise<string> {
  const headersList = await headers()
  return headersList.get('accept-language')?.split(',')[0] ?? 'en'
}
```

## Generic Reusable Page Patterns

```tsx
// components/paginated-list.tsx
type PaginatedListProps<T> = {
  items: T[]
  renderItem: (item: T) => React.ReactNode
  emptyState?: React.ReactNode
}

export function PaginatedList<T extends { id: string }>({
  items,
  renderItem,
  emptyState = <p>No items found.</p>,
}: PaginatedListProps<T>) {
  if (items.length === 0) return <>{emptyState}</>
  return <ul>{items.map((item) => <li key={item.id}>{renderItem(item)}</li>)}</ul>
}
```

## Type Safety Checklist

| Pattern | Type-safe approach |
|---------|-------------------|
| `params` / `searchParams` | `Promise<{...}>`, always await |
| Server Action input | Zod schema before use |
| Route Handler body | `unknown`, then Zod parse |
| `fetch` response | Type the return, never cast `any` |
| `cookies().get()` | Chain `?.value`, handle `undefined` |
| `session.user` fields | Extend `Session` type in `next-auth.d.ts` |

## Extending Session Types (Auth.js)

```ts
// types/next-auth.d.ts
import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      role: 'admin' | 'editor' | 'viewer'
      id: string
    }
  }
}
```

## Anti-Patterns

- **`params: { slug: string }` without `Promise`**: Breaks in Next.js 15+. Always wrap in `Promise`.
- **Casting `req.json() as MyType`**: Use Zod or type guards. Cast creates false confidence.
- **Skipping return type on Server Actions**: TypeScript cannot infer across the serialization boundary. Declare the return type explicitly.

## Cross-References

- [Server Actions](../core/server-actions.md)
- [Architecture](./architecture.md)
- [react-reference](../../react-reference/SKILL.md)
