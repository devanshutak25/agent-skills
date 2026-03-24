# Next.js 15 Reference

## App Router Architecture

### File Conventions
```
app/
  layout.tsx          # Root layout (wraps all routes, persists across navigation)
  page.tsx            # Route UI (renders at this path)
  loading.tsx         # Suspense fallback
  error.tsx           # Error boundary
  not-found.tsx       # 404 UI
  template.tsx        # Like layout but re-mounts on navigate
  route.ts            # API route handler
  (group)/            # Route group — no URL segment
  [param]/            # Dynamic segment
  [...slug]/          # Catch-all
  [[...slug]]/        # Optional catch-all
  @slot/              # Parallel route
  (.)route/           # Intercepting route (same level)
  (..)route/          # Intercepting route (one level up)
```

### Server vs Client Components
```tsx
// Server Component (default) — no directive needed
export default async function Page() {
  const data = await db.query('SELECT * FROM posts');
  return <div>{data.title}</div>;
}

// Client Component
'use client';
import { useState } from 'react';
export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

---

## Server Actions

```tsx
// File-level
'use server';
export async function createPost(formData: FormData) {
  await db.post.create({ data: { title: formData.get('title') as string } });
  revalidatePath('/posts');
}

// With useActionState (React 19)
'use client';
import { useActionState } from 'react';
import { createPost } from './actions';

function Form() {
  const [state, action, isPending] = useActionState(createPost, {});
  return (
    <form action={action}>
      <input name="title" />
      <button disabled={isPending}>Create</button>
      {state.error && <p>{state.error}</p>}
    </form>
  );
}
```

---

## Caching (Next.js 15 Changes)

**Breaking change:** `fetch` and `GET` route handlers are **NOT cached by default** (unlike v14).

### Four Cache Layers
| Layer | Scope | Default (v15) |
|-------|-------|---------------|
| Request Memoization | Single render | Active (React `cache`) |
| Data Cache | Across requests | **Opt-in** (changed from v14) |
| Full Route Cache | Rendered HTML/RSC | Opt-in for dynamic routes |
| Router Cache | Client-side | Pages: 0s, Layouts: cached |

### Fetch Options
```tsx
// Opt into caching
fetch(url, { cache: 'force-cache' });

// Time-based revalidation
fetch(url, { next: { revalidate: 3600 } });

// Tag-based
fetch(url, { next: { tags: ['posts'] } });

// No cache (default in v15)
fetch(url, { cache: 'no-store' });
```

### On-Demand Revalidation
```tsx
import { revalidateTag, revalidatePath } from 'next/cache';

// In Server Action
export async function updatePost(id: string) {
  'use server';
  await db.post.update({ where: { id } });
  revalidateTag('posts');
  revalidatePath('/blog');
}
```

### unstable_cache (Non-Fetch Data)
```tsx
import { unstable_cache } from 'next/cache';

const getCachedUser = unstable_cache(
  async (id: string) => db.user.findUnique({ where: { id } }),
  ['user'],
  { tags: ['users'], revalidate: 300 }
);
```

---

## Parallel Routes

```
app/
  layout.tsx
  @analytics/page.tsx
  @team/page.tsx
```

```tsx
export default function Layout({
  children, analytics, team,
}: {
  children: React.ReactNode;
  analytics: React.ReactNode;
  team: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-3">
      <main>{children}</main>
      <aside>{analytics}</aside>
      <aside>{team}</aside>
    </div>
  );
}
```

---

## Intercepting Routes (Modal Pattern)

```
app/
  @modal/default.tsx          # Returns null
  @modal/(.)photo/[id]/page.tsx  # Modal view (intercepted)
  photo/[id]/page.tsx         # Full page (direct navigation)
```

---

## Route Handlers

```tsx
// app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const page = request.nextUrl.searchParams.get('page') ?? '1';
  const posts = await db.post.findMany({ skip: (parseInt(page) - 1) * 10, take: 10 });
  return NextResponse.json(posts);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const post = await db.post.create({ data: body });
  return NextResponse.json(post, { status: 201 });
}

// Dynamic: app/api/posts/[id]/route.ts
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // Async in Next.js 15
  return NextResponse.json(await db.post.findUnique({ where: { id } }));
}
```

---

## Middleware

```tsx
// middleware.ts (project root)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/protected/:path*'],
};
```

---

## Image & Font Optimization

```tsx
import Image from 'next/image';
import { Inter } from 'next/font/google';

// Image — automatic optimization, lazy loading, CLS prevention
<Image src="/hero.jpg" alt="Hero" width={800} height={600} priority />

// Font — zero CLS, self-hosted
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
<html className={inter.variable}>
```

---

## Turbopack

```bash
next dev --turbo   # Stable for dev
# next build — still webpack (Turbopack build not yet stable)
```

76% faster dev server startup, 96% faster HMR.

---

## Deployment

```ts
// next.config.ts — standalone for self-hosting
const nextConfig = {
  output: 'standalone',
};
```

| Feature | Vercel | Self-Host |
|---------|--------|-----------|
| ISR | Native | Custom cache handler needed |
| Image optimization | Automatic | Requires `sharp` |
| Edge Middleware | Global CDN | Single region |
