# Authentication Libraries

## Decision Matrix

| Library | Type | Free Tier | Best For |
|---------|------|-----------|----------|
| **Auth.js v5** | Self-hosted OSS | Unlimited | Full control, zero vendor lock-in |
| **Clerk** | Managed service | 10K MAU | Best DX, pre-built UI, Next.js |
| **Supabase Auth** | BaaS | 50K MAU | Already using Supabase DB |
| **Firebase Auth** | BaaS | Unlimited (basic) | Google ecosystem, mobile apps |

**Lucia Auth**: Deprecated (March 2025) — do not use for new projects.

---

## Auth.js v5 (NextAuth.js)

```bash
npm install next-auth@beta
```

### Setup
```ts
// auth.ts
import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { db } from './db';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    GitHub,
    Credentials({
      credentials: {
        email: { label: 'Email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });
        if (!user || !await verify(credentials.password as string, user.passwordHash)) {
          return null;
        }
        return user;
      },
    }),
  ],
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: { ...session.user, id: user.id, role: user.role },
    }),
  },
});
```

### Route Handler
```ts
// app/api/auth/[...nextauth]/route.ts
import { handlers } from '@/auth';
export const { GET, POST } = handlers;
```

### Universal `auth()` Function
```tsx
// Server Component
import { auth } from '@/auth';

export default async function Dashboard() {
  const session = await auth();
  if (!session) redirect('/login');
  return <h1>Welcome {session.user.name}</h1>;
}

// Middleware
import { auth } from '@/auth';

export default auth((req) => {
  if (!req.auth && req.nextUrl.pathname !== '/login') {
    return Response.redirect(new URL('/login', req.url));
  }
});

// Server Action
import { auth } from '@/auth';

export async function createPost(data: FormData) {
  'use server';
  const session = await auth();
  if (!session) throw new Error('Unauthorized');
  // ...
}
```

### Sign In/Out
```tsx
import { signIn, signOut } from '@/auth';

// Server Action
export async function handleSignIn() {
  'use server';
  await signIn('github');
}

// Client Component
'use client';
import { signIn, signOut } from 'next-auth/react';

<button onClick={() => signIn('github')}>Sign in with GitHub</button>
<button onClick={() => signOut()}>Sign out</button>
```

---

## Clerk

```bash
npm install @clerk/nextjs
```

### Setup
```tsx
// app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html><body>{children}</body></html>
    </ClerkProvider>
  );
}
```

### Middleware (Route Protection)
```ts
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublic = createRouteMatcher(['/', '/sign-in(.*)', '/sign-up(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublic(req)) {
    await auth.protect(); // redirects to sign-in if not authenticated
  }
});
```

### Pre-built Components
```tsx
import { SignIn, SignUp, UserButton, SignedIn, SignedOut } from '@clerk/nextjs';

// Drop-in auth pages
<SignIn />
<SignUp />

// Conditional rendering
<SignedIn>
  <UserButton afterSignOutUrl="/" />
</SignedIn>
<SignedOut>
  <a href="/sign-in">Sign In</a>
</SignedOut>
```

### Server-Side
```tsx
import { auth, currentUser } from '@clerk/nextjs/server';

// In Server Component or Server Action
const { userId } = await auth();
const user = await currentUser();
```

---

## Supabase Auth

```bash
npm install @supabase/supabase-js @supabase/ssr
```

```tsx
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}

// Usage in Server Component
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();

// Row Level Security — auth integrates with DB queries
const { data: posts } = await supabase
  .from('posts')
  .select('*'); // RLS automatically filters by authenticated user
```

---

## Choosing Guide

```
Full control, zero cost, OSS?           → Auth.js v5
Best DX, pre-built UI, fast setup?      → Clerk
Using Supabase DB + RLS?                → Supabase Auth
Google/Firebase ecosystem?              → Firebase Auth
Enterprise SSO (SAML, OIDC)?            → Auth0 or Clerk
```
