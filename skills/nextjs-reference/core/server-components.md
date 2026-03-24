# Server Components

## Mental Model

In the App Router, **all components are Server Components by default**. Add `'use client'` at the top of a file to mark it and everything it imports as a Client Component. There is no `'use server'` on components — `'use server'` marks [Server Actions](./server-actions.md).

## What Runs Where

| Capability | Server | Client |
|-----------|--------|--------|
| `async/await` in component body | Yes | No |
| `fetch`, `fs`, database access | Yes | No (use API routes) |
| React hooks (`useState`, `useEffect`, etc.) | No | Yes |
| Browser APIs (`window`, `document`) | No | Yes |
| Event handlers (`onClick`, `onChange`) | No | Yes |
| `import 'server-only'` packages | Yes | Throws at build |
| Access `cookies()`, `headers()` | Yes | No |
| Context providers | No (create in client) | Yes |
| Streaming with `<Suspense>` | Yes | Yes (limited) |

## `'use client'` Directive

`'use client'` marks a **module boundary**. Everything in the file and everything it imports becomes part of the client bundle.

```tsx
// components/counter.tsx
'use client'

import { useState } from 'react'

export function Counter({ initial }: { initial: number }) {
  const [count, setCount] = useState(initial)
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>
}
```

The boundary is the file, not the component. If you import a Client Component into a Server Component file, only the Client Component is sent to the client — the server component itself never ships.

## Composition Patterns

### Server wraps Client (correct)

```tsx
// app/page.tsx — Server Component
import { Counter } from '@/components/counter' // client component
import { fetchUser } from '@/lib/db'

export default async function Page() {
  const user = await fetchUser() // runs on server, never sent to client
  return (
    <div>
      <h1>{user.name}</h1>
      <Counter initial={user.score} />  {/* data passed as serializable prop */}
    </div>
  )
}
```

### Passing Server Components as children to Client Components

```tsx
// components/modal.tsx — Client Component
'use client'
import { useState } from 'react'

export function Modal({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return open ? <div>{children}</div> : <button onClick={() => setOpen(true)}>Open</button>
}

// app/page.tsx — Server Component
import { Modal } from '@/components/modal'
import { ServerContent } from '@/components/server-content' // Server Component

export default function Page() {
  // ServerContent renders on the server even though it's inside a Client Component
  // because it's passed as children (a prop), not imported into the client file
  return <Modal><ServerContent /></Modal>
}
```

## Streaming with Suspense

```tsx
// app/dashboard/page.tsx
import { Suspense } from 'react'
import { SlowData } from '@/components/slow-data'

export default function Page() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Suspense fallback={<p>Loading stats...</p>}>
        {/* SlowData is an async Server Component — streamed when ready */}
        <SlowData />
      </Suspense>
    </div>
  )
}
```

Multiple `<Suspense>` boundaries stream independently. The page shell renders immediately; each boundary fills in as its data resolves.

## Server-Only Imports

```tsx
// lib/db.ts
import 'server-only' // throws at build if imported in client bundle

export async function getUser(id: string) {
  return db.query('SELECT * FROM users WHERE id = $1', [id])
}
```

Use `server-only` for:
- Database clients
- Secret-using utilities
- Admin SDK wrappers

Pair with `client-only` from the `client-only` package for browser-only modules.

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Using `useState`/`useEffect` in a Server Component | Add `'use client'` to that file |
| Passing a function as a prop to a Client Component | Pass serializable data; use Server Actions for callbacks |
| Importing a server-only module into a client file | Wrap in an API route or Server Action |
| Wrapping the whole app in `'use client'` | Push `'use client'` to leaf components |
| Expecting Server Component to re-render on state change | Server Components render once per request; use client state in Client Components |

## Data Fetching Pattern

```tsx
// Fetch in Server Components directly — no useEffect, no loading state
export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  // fetch is automatically deduplicated across the render tree
  const product = await fetch(`https://api.example.com/products/${id}`, {
    next: { tags: ['products'] },
  }).then(r => r.json())

  return <ProductView product={product} />
}
```

See [Cache & use cache](./cache-components.md) for caching strategy on data fetching.

## Cross-References

- [react-reference Server Components](../../react-reference/core/server-components.md) — React-level RSC model
- [Server Actions](./server-actions.md) — `'use server'`, mutations, forms
- [App Router](./app-router.md) — file conventions, routing
- [Cache & use cache](./cache-components.md) — caching data fetches
