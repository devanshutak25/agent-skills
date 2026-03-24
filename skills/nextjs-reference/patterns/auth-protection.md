# Auth Protection

## Protection Layers

| Layer | Where | Responsibility | Fails to |
|-------|-------|----------------|----------|
| Proxy (`proxy.ts`) | Edge, before routing | Block unauthenticated requests early | Login redirect |
| Layout | Server Component | Redirect or render restricted shell | Redirect or null |
| Page | Server Component | Fine-grained access per route | 403 page or redirect |
| Server Action | Action function | Validate auth before any mutation | Throw or return error |
| Route Handler | GET/POST handler | Validate auth before any I/O | `401` / `403` response |
| Client Component | UI only | Hide controls, not enforce access | N/A — never enforce here |

**Rule**: Client components must never be the sole auth check. They are UI polish only.

## Proxy-Level Auth (Replaces Middleware Pattern)

In Next.js 16, `proxy.ts` (experimental) is the recommended replacement for `middleware.ts` for auth redirects. It runs at the edge before any route is resolved.

```ts
// proxy.ts (Next.js 16 experimental)
import { auth } from '@/lib/auth'
import type { NextRequest } from 'next/server'

export async function proxy(req: NextRequest) {
  const session = await auth.getSession(req)
  const isPublic = ['/login', '/signup', '/api/auth'].some((p) =>
    req.nextUrl.pathname.startsWith(p)
  )

  if (!session && !isPublic) {
    return Response.redirect(new URL('/login', req.url))
  }
}
```

If using Next.js 15 without `proxy.ts`, use `middleware.ts` with the same pattern.

## Layout-Level Protection

Use for entire route segments that require authentication (e.g., `/dashboard`).

```tsx
// app/dashboard/layout.tsx
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  return (
    <div>
      <nav>Logged in as {session.user.email}</nav>
      {children}
    </div>
  )
}
```

## Page-Level Protection

Use when individual pages within an authenticated segment have role or ownership requirements.

```tsx
// app/dashboard/admin/page.tsx
import { redirect, notFound } from 'next/navigation'
import { auth } from '@/lib/auth'

export default async function AdminPage() {
  const session = await auth()

  if (!session) redirect('/login')
  if (session.user.role !== 'admin') notFound() // or redirect('/403')

  return <AdminDashboard />
}
```

## Server Action Protection

Server Actions are public POST endpoints. Always validate auth inside the action body regardless of UI-level guards.

```ts
// app/actions/delete-post.ts
'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function deletePost(postId: string): Promise<{ error?: string }> {
  const session = await auth()

  if (!session) return { error: 'Unauthorized' }

  const post = await db.post.findUnique({ where: { id: postId } })
  if (!post) return { error: 'Not found' }
  if (post.authorId !== session.user.id && session.user.role !== 'admin') {
    return { error: 'Forbidden' }
  }

  await db.post.delete({ where: { id: postId } })
  return {}
}
```

## Route Handler Protection

```ts
// app/api/posts/[id]/route.ts
import { auth } from '@/lib/auth'
import { NextRequest } from 'next/server'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  // ownership check, then delete
  return Response.json({ deleted: id })
}
```

## RBAC Utility Pattern

Centralize role logic so it is reusable across all layers.

```ts
// lib/rbac.ts
import type { Session } from 'next-auth'

type Role = 'admin' | 'editor' | 'viewer'

const roleHierarchy: Record<Role, number> = {
  admin: 3,
  editor: 2,
  viewer: 1,
}

export function hasRole(session: Session | null, required: Role): boolean {
  if (!session?.user.role) return false
  return roleHierarchy[session.user.role as Role] >= roleHierarchy[required]
}

export function assertRole(session: Session | null, required: Role): void {
  if (!hasRole(session, required)) throw new Error('Forbidden')
}
```

## Auth.js v5 Integration

```ts
// lib/auth.ts
import NextAuth from 'next-auth'
import GitHub from 'next-auth/providers/github'

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [GitHub],
  callbacks: {
    session({ session, token }) {
      session.user.role = token.role as string
      return session
    },
  },
})
```

Import `auth` from `@/lib/auth` at every layer — layout, page, action, route handler, and proxy.

## Clerk Integration

```tsx
// app/dashboard/layout.tsx (Clerk)
import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const user = await currentUser()
  return <div data-user={user?.emailAddresses[0].emailAddress}>{children}</div>
}
```

Clerk's `auth()` is callable in Server Components, Actions, and Route Handlers identically.

## When NOT to Use Each Layer

- **Proxy/middleware only**: Cannot access database. Use only for token presence checks, not DB-backed role validation.
- **Layout only**: Layouts can be cached. Do not rely on layout auth checks for mutation routes — always add action-level checks.
- **Client component**: Never use as an auth gate. Treat as UI-only; the real check must happen server-side.

## Cross-References

- [Auth Libraries](../libraries/auth.md)
- [Proxy Routing](../core/proxy-routing.md)
- [Server Actions](../core/server-actions.md)
