# State Management

## Decision Matrix

| Library | SSR safe | Scope | Update cost | Best for |
|---|---|---|---|---|
| URL state / `nuqs` | Yes | Global, shareable | None (no re-render overhead) | Filters, pagination, tabs |
| Zustand | Yes (with care) | Global | Low | Client-only app-wide state |
| Jotai | Yes (with care) | Atom-level | Minimal (atom subscribers only) | Fine-grained reactive state |
| React Context | Yes | Subtree | Medium (all consumers re-render) | Theme, locale, auth session |
| `useState` / `useReducer` | Yes | Component | Local | UI, ephemeral form state |

## When NOT to Use Global State

Server Components eliminate most needs for global state. Fetch data on the server, pass as props or stream via Suspense. Global client state should only cover UI state the server cannot own (open modals, optimistic counters, client-only preferences).

## URL State with nuqs

URL state is the most shareable and SSR-safe option. `nuqs` provides type-safe `useQueryState`.

```tsx
// app/products/page.tsx — Server Component reads searchParams
export default function ProductsPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string };
}) {
  const q = searchParams.q ?? "";
  const page = Number(searchParams.page ?? "1");
  return <ProductSearch initialQ={q} initialPage={page} />;
}
```

```tsx
// app/products/ProductSearch.tsx
"use client";
import { useQueryState, parseAsInteger } from "nuqs";

export default function ProductSearch() {
  const [q, setQ] = useQueryState("q", { defaultValue: "" });
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));

  return (
    <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
  );
}
```

## Zustand — SSR-Safe Setup

A single module-level store leaks state across requests in serverless. Create one store per request using a factory + React context.

```ts
// lib/stores/cart-store.ts
import { createStore } from "zustand";

type CartState = { items: CartItem[]; add: (item: CartItem) => void };

export type CartStore = ReturnType<typeof createCartStore>;

export function createCartStore(init: { items: CartItem[] }) {
  return createStore<CartState>()((set) => ({
    items: init.items,
    add: (item) => set((s) => ({ items: [...s.items, item] })),
  }));
}
```

```tsx
// app/providers/CartProvider.tsx
"use client";
import { createContext, useContext, useRef } from "react";
import { useStore } from "zustand";
import { createCartStore, CartStore } from "@/lib/stores/cart-store";

const CartContext = createContext<CartStore | null>(null);

export function CartProvider({ children, initialItems }: { children: React.ReactNode; initialItems: CartItem[] }) {
  const store = useRef(createCartStore({ items: initialItems })).current;
  return <CartContext.Provider value={store}>{children}</CartContext.Provider>;
}

export function useCart<T>(selector: (s: CartState) => T) {
  const store = useContext(CartContext);
  if (!store) throw new Error("useCart must be used inside CartProvider");
  return useStore(store, selector);
}
```

## Jotai — SSR Hydration Pattern

```tsx
// app/providers/JotaiProvider.tsx
"use client";
import { createStore, Provider } from "jotai";
import { useRef } from "react";

export function JotaiProvider({ children }: { children: React.ReactNode }) {
  const store = useRef(createStore()).current;  // one store per mount, not module
  return <Provider store={store}>{children}</Provider>;
}
```

```ts
// lib/atoms/theme.ts
import { atom } from "jotai";
export const themeAtom = atom<"light" | "dark">("light");
```

```tsx
"use client";
import { useAtom } from "jotai";
import { themeAtom } from "@/lib/atoms/theme";

export function ThemeToggle() {
  const [theme, setTheme] = useAtom(themeAtom);
  return <button onClick={() => setTheme(t => t === "light" ? "dark" : "light")}>{theme}</button>;
}
```

## React Context — When It Is Enough

Context is fine for values that change rarely and do not need to be shared across URL navigations.

```tsx
// app/providers/LocaleProvider.tsx
"use client";
import { createContext, useContext } from "react";

const LocaleContext = createContext<string>("en");

export function LocaleProvider({ locale, children }: { locale: string; children: React.ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export const useLocale = () => useContext(LocaleContext);
```

Use for: theme, locale, open/close of a sidebar.
Avoid for: high-frequency updates (every keypress), large object trees.

## Pattern: Server Reads, Client Mutates

```tsx
// Server Component fetches initial state
export default async function CartPage() {
  const items = await db.cartItem.findMany({ where: { userId: session.userId } });
  return (
    <CartProvider initialItems={items}>
      <CartView />
    </CartProvider>
  );
}
```

## Cross-References

- [Data Fetching](./data-fetching.md) — server data eliminates most global state needs
- [react-reference State Management](../../react-reference/libraries/state-management.md) — useState, useReducer, Context fundamentals
