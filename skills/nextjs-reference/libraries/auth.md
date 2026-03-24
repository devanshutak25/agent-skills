# Authentication

## Decision Matrix

| Library | Self-hosted | Managed | Complexity | Edge runtime | Best for |
|---|---|---|---|---|---|
| Auth.js v5 (NextAuth) | Yes | No | Medium | Yes (JWT strategy) | Open-source, full control |
| Clerk | No | Yes | Low | Yes | Fast setup, enterprise features |
| Lucia | Yes | No | High | Yes | Custom auth without magic |
| Custom JWT | Yes | No | High | Yes | Full control, no library overhead |

## Auth.js v5 Setup

```ts
// auth.ts  — root of project
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "jwt" }, // use "database" for server-side sessions
  callbacks: {
    jwt({ token, user }) {
      if (user) token.role = user.role; // extend token with custom fields
      return token;
    },
    session({ session, token }) {
      session.user.role = token.role as string;
      return session;
    },
  },
});
```

```ts
// app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/auth";
export const { GET, POST } = handlers;
```

## Accessing the Session Per Layer

| Layer | How to get session |
|---|---|
| Middleware (`middleware.ts`) | `const session = await auth()` — import from `@/auth` |
| Root layout (Server Component) | `const session = await auth()` |
| Page / Server Component | `const session = await auth()` |
| Server Action | `const session = await auth()` |
| Route Handler | `const session = await auth(req, ctx)` |
| Client Component | `useSession()` from `next-auth/react` + `<SessionProvider>` |

```ts
// middleware.ts — protect routes at the edge
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  if (!req.auth && req.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
});

export const config = { matcher: ["/dashboard/:path*", "/api/protected/:path*"] };
```

```tsx
// app/dashboard/page.tsx — Server Component
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return <div>Hello, {session.user.name}</div>;
}
```

```ts
// app/actions/update-profile.ts — Server Action
"use server";
import { auth } from "@/auth";

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  await db.user.update({
    where: { id: session.user.id },
    data: { name: formData.get("name") as string },
  });
}
```

## Clerk Setup

```tsx
// app/layout.tsx
import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en"><body>{children}</body></html>
    </ClerkProvider>
  );
}
```

```ts
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtected = createRouteMatcher(["/dashboard(.*)", "/api/protected(.*)"]);

export default clerkMiddleware((auth, req) => {
  if (isProtected(req)) auth().protect();
});

export const config = { matcher: ["/((?!_next|.*\\..*).*)"] };
```

```tsx
// app/dashboard/page.tsx — Server Component
import { auth } from "@clerk/nextjs/server";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  return <div>Hello, {user?.firstName}</div>;
}
```

## JWT vs Session Strategy

| | JWT | Database session |
|---|---|---|
| Edge runtime | Yes | Depends on adapter |
| Revocation | No (until expiry) | Yes (delete from DB) |
| Payload size | ~4 KB limit in cookies | Minimal (session ID only) |
| Scalability | High (stateless) | Requires DB lookup per request |

Use JWT when: edge runtime required, stateless preferred, revocation not critical.
Use database sessions when: immediate revocation needed, role changes must be instant.

## Protecting Route Handlers

```ts
// app/api/protected/route.ts
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json({ data: await fetchSecureData(session.user.id) });
}
```

## Cross-References

- [Auth Protection Patterns](../patterns/auth-protection.md) — RBAC, route groups, conditional layouts
- [Middleware](../core/middleware.md) — matcher config, edge execution
