# React Server Components (RSC)

## Mental Model

Server Components render on the server at build time or request time. They produce serialized UI (RSC payload) — never ship JS to the client.

```
Server Component (default) → runs on server, zero bundle cost
  ↓ renders
Client Component ('use client') → hydrated on client, included in bundle
```

## Directives

### `'use client'`
Marks the **entry point** into client code. Everything imported by this file is also client.

```tsx
'use client';
import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c + 1)}>{count}</button>;
}
```

### `'use server'`
Marks a function as a **Server Action** — callable from client but runs on server.

```tsx
// actions.ts
'use server';

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string;
  await db.post.create({ data: { title } });
  revalidatePath('/posts');
}
```

```tsx
// Client Component
'use client';
import { createPost } from './actions';

export function PostForm() {
  return (
    <form action={createPost}>
      <input name="title" />
      <button type="submit">Create</button>
    </form>
  );
}
```

---

## Server Component Rules

**Can:**
- `async/await` directly in component body
- Access server resources (DB, filesystem, env vars)
- Import and render Client Components
- Use `cache()` for request-level memoization
- Render `<Suspense>` boundaries

**Cannot:**
- Use hooks (`useState`, `useEffect`, etc.)
- Use browser APIs (`window`, `document`)
- Use event handlers (`onClick`, `onChange`)
- Use Context (use prop drilling or Server Actions instead)

---

## Async Server Components

```tsx
async function UserProfile({ id }: { id: string }) {
  const user = await db.user.findUnique({ where: { id } });
  return (
    <div>
      <h1>{user.name}</h1>
      <Suspense fallback={<PostsSkeleton />}>
        <UserPosts userId={id} />
      </Suspense>
    </div>
  );
}

async function UserPosts({ userId }: { userId: string }) {
  const posts = await db.post.findMany({ where: { authorId: userId } });
  return posts.map(p => <PostCard key={p.id} post={p} />);
}
```

---

## Composition Patterns

### Server → Client (passing serializable props)
```tsx
// Server Component
async function Page() {
  const data = await fetchData();
  return <ClientChart data={data} />; // data must be serializable
}
```

### Client → Server (children pattern)
```tsx
// Client Component wrapping Server Component via children
'use client';
export function Sidebar({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return open ? <aside>{children}</aside> : null;
}

// Server Component
function Layout() {
  return (
    <Sidebar>
      <ServerNav /> {/* Still renders on server */}
    </Sidebar>
  );
}
```

### Serialization Rules
Props passed from Server → Client must be serializable:
- Primitives, Date, Map, Set, TypedArrays
- JSX elements (`<Component />`)
- Server Actions (functions marked `'use server'`)
- **NOT:** class instances, functions (except Server Actions), closures

---

## Streaming & Suspense SSR

```tsx
function App() {
  return (
    <html>
      <body>
        <Header />                           {/* streams immediately */}
        <Suspense fallback={<Spinner />}>
          <SlowContent />                    {/* streams when ready */}
        </Suspense>
        <Footer />                           {/* streams immediately */}
      </body>
    </html>
  );
}
```

- Server sends HTML progressively as each Suspense boundary resolves
- Client hydrates each chunk independently (selective hydration)
- User can interact with already-hydrated parts while others load

---

## Server-Only Packages

```bash
npm install server-only
```

```tsx
import 'server-only';

// This module will throw at build time if imported from a Client Component
export async function getSecret() {
  return process.env.SECRET_KEY;
}
```

Similarly: `client-only` prevents server import.

---

## Data Fetching Patterns

### Fetch in Server Component (recommended)
```tsx
async function Products() {
  const products = await fetch('https://api.example.com/products', {
    next: { revalidate: 3600 } // Next.js specific
  }).then(r => r.json());
  return <ProductList products={products} />;
}
```

### Parallel Data Fetching
```tsx
async function Dashboard() {
  const [user, analytics, notifications] = await Promise.all([
    getUser(),
    getAnalytics(),
    getNotifications(),
  ]);
  return <DashboardView user={user} analytics={analytics} notifications={notifications} />;
}
```

### Preloading with `cache`
```tsx
const getUser = cache(async (id: string) => db.user.findUnique({ where: { id } }));

function Page({ id }: { id: string }) {
  getUser(id); // start fetch early
  return (
    <Suspense fallback={<Skeleton />}>
      <Profile id={id} />
    </Suspense>
  );
}

async function Profile({ id }: { id: string }) {
  const user = await getUser(id); // cache hit
  return <div>{user.name}</div>;
}
```
