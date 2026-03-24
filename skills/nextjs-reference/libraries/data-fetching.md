# Data Fetching

## Decision Matrix

| Approach | Where it runs | Cache control | Type safety | Best for |
|---|---|---|---|---|
| Server Component `fetch()` | Server | `force-cache` / `no-store` / `"use cache"` | Manual | Static/dynamic server data |
| TanStack Query | Client (hydrated from server) | stale-while-revalidate | Manual | Real-time, paginated, optimistic |
| SWR | Client | stale-while-revalidate | Manual | Simple client polling |
| tRPC | Server + Client | TanStack Query under the hood | End-to-end inferred | Full-stack type safety |
| Route Handler | Server (HTTP) | HTTP cache headers | Manual | Webhooks, third-party callbacks |

## Server Component fetch()

No wrapper needed — `fetch()` in a Server Component runs on the server at request time.

```tsx
// app/products/page.tsx
export default async function ProductsPage() {
  const res = await fetch("https://api.example.com/products", {
    next: { revalidate: 60 }, // ISR: revalidate every 60s
  });
  if (!res.ok) throw new Error("Failed to fetch products");
  const products: Product[] = await res.json();

  return <ProductList products={products} />;
}
```

For cache opt-out (always fresh):

```tsx
const res = await fetch(url, { cache: "no-store" });
```

See [Cache Components](../core/cache-components.md) for `"use cache"` directive and tagged revalidation.

## Parallel Fetching

Avoid sequential waterfalls — kick off independent fetches simultaneously.

```tsx
// app/dashboard/page.tsx
export default async function DashboardPage() {
  // Both start at the same time
  const [user, stats] = await Promise.all([
    fetchUser(),
    fetchStats(),
  ]);

  return <Dashboard user={user} stats={stats} />;
}
```

## TanStack Query — Hydration Pattern

Fetch on the server, hydrate on the client to avoid a client-side loading flash.

```tsx
// app/providers.tsx  — must be 'use client'
"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient());
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
```

```tsx
// app/products/page.tsx
import { HydrationBoundary, dehydrate, QueryClient } from "@tanstack/react-query";
import ProductList from "./ProductList";

export default async function ProductsPage() {
  const qc = new QueryClient();
  await qc.prefetchQuery({ queryKey: ["products"], queryFn: fetchProducts });

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <ProductList />
    </HydrationBoundary>
  );
}
```

```tsx
// app/products/ProductList.tsx  — 'use client'
"use client";
import { useQuery } from "@tanstack/react-query";

export default function ProductList() {
  const { data, isPending } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts, // same fn as server prefetch
  });

  if (isPending) return <Skeleton />;
  return <ul>{data?.map((p) => <li key={p.id}>{p.name}</li>)}</ul>;
}
```

## SWR — Lighter Alternative

Use when TanStack Query's feature set is overkill.

```tsx
"use client";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function UserCard({ id }: { id: string }) {
  const { data, error, isLoading } = useSWR(`/api/users/${id}`, fetcher);

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage />;
  return <div>{data.name}</div>;
}
```

## tRPC — End-to-End Type Safety

```ts
// server/trpc.ts
import { initTRPC } from "@trpc/server";
const t = initTRPC.create();
export const router = t.router;
export const publicProcedure = t.procedure;
```

```ts
// server/routers/product.ts
import { router, publicProcedure } from "../trpc";
import { z } from "zod";

export const productRouter = router({
  list: publicProcedure.query(async () => fetchProducts()),
  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => fetchProductById(input.id)),
});
```

```tsx
// Client usage — types inferred from server router
"use client";
import { trpc } from "@/lib/trpc/client";

export default function ProductList() {
  const { data } = trpc.product.list.useQuery();
  return <ul>{data?.map((p) => <li key={p.id}>{p.name}</li>)}</ul>;
}
```

## Route Handlers

Use for webhooks, OAuth callbacks, and integrations that need an HTTP endpoint.

```ts
// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature") ?? "";

  const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  await handleStripeEvent(event);

  return NextResponse.json({ received: true });
}
```

When NOT to use Route Handlers:
- Fetching data for your own pages — use Server Components instead.
- Server-to-server mutations — use Server Actions instead.

## Server → Client Prop Pattern

Fetch on the server, pass result as props — no client fetch needed.

```tsx
// app/profile/page.tsx (Server Component)
export default async function ProfilePage() {
  const user = await db.user.findFirst({ where: { id: getSession().userId } });
  return <ProfileCard user={user} />;  // ProfileCard can be 'use client'
}
```

## Cross-References

- [Cache Components](../core/cache-components.md) — `"use cache"`, `cacheTag`, `revalidateTag`
- [Server Actions](../core/server-actions.md) — mutations counterpart to fetching
- [react-reference Data Fetching](../../react-reference/libraries/data-fetching.md) — React fundamentals
