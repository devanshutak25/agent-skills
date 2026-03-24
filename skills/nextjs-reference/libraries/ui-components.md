# UI Components

## Decision Matrix

| Library | RSC compatible | Headless | Styled | Bundle cost | Best for |
|---|---|---|---|---|---|
| shadcn/ui | Yes (components are copied) | No — built on Radix | Yes (Tailwind) | Zero (no npm dep) | Rapid UI with design system |
| Radix Primitives | Yes (with `'use client'`) | Yes | No | Low | Custom-styled accessible components |
| Headless UI | Needs `'use client'` | Yes | No | Low | Tailwind-adjacent accessible components |
| MUI / Chakra | No — needs `'use client'` | No | Yes | Large | Design-system-heavy teams |
| HTML + Tailwind | Yes | Yes | Yes | Zero | Simple cases, no interaction needed |

## shadcn/ui Setup

shadcn/ui copies component source into your repo — you own the code, no runtime dependency.

```bash
npx shadcn@latest init
# Prompts: TypeScript, Tailwind, src/ dir, app router, aliases
npx shadcn@latest add button card input dialog
```

```tsx
// Components land in components/ui/ — edit freely
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{product.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{product.description}</p>
        <Button variant="default">Add to cart</Button>
      </CardContent>
    </Card>
  );
}
```

shadcn components that use React state/events include `'use client'` internally. Components that are purely structural (Card, Separator) do not — they work as Server Components.

## Radix Primitives — Custom Styling

Radix interactive components require event listeners — wrap them in a `'use client'` boundary.

```tsx
// components/ui/Dropdown.tsx
"use client";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

type Props = { trigger: React.ReactNode; items: { label: string; onClick: () => void }[] };

export function Dropdown({ trigger, items }: Props) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="rounded-md bg-white shadow-lg p-1">
          {items.map((item) => (
            <DropdownMenu.Item
              key={item.label}
              onSelect={item.onClick}
              className="cursor-pointer rounded px-3 py-2 text-sm hover:bg-zinc-100"
            >
              {item.label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
```

The parent Server Component can import this without being a Client Component itself — the `'use client'` boundary is inside `Dropdown.tsx`.

## Server vs Client Boundaries in UI

```tsx
// app/products/page.tsx — Server Component
import { Dropdown } from "@/components/ui/Dropdown"; // client component, imported from server

export default async function ProductsPage() {
  const categories = await db.category.findMany();

  // Passing server-fetched data as props into a client component is fine
  return (
    <div>
      <Dropdown
        trigger={<button>Filter</button>}
        items={categories.map((c) => ({ label: c.name, onClick: () => {} }))}
      />
    </div>
  );
}
```

Do NOT: pass functions (event handlers) created in Server Components as props to Client Components — functions are not serializable across the server/client boundary.

## Dark Mode with next-themes + shadcn

```tsx
// app/layout.tsx
import { ThemeProvider } from "@/components/ui/ThemeProvider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

```tsx
// components/ui/ThemeProvider.tsx
"use client";
import { ThemeProvider as NextThemesProvider } from "next-themes";
export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
```

shadcn themes use CSS variables (`--background`, `--foreground`, etc.) scoped to `.dark` — Tailwind's `dark:` utilities read these automatically.

## Loading UI with Skeletons

```tsx
// app/products/loading.tsx — automatically shown by Next.js during page load
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductsLoading() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}
```

For granular streaming, use Suspense with a skeleton fallback directly in the page:

```tsx
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<ProductGridSkeleton />}>
      <ProductGrid />   {/* async Server Component */}
    </Suspense>
  );
}
```

## Cross-References

- [Styling](./styling.md) — Tailwind v4 config, dark mode, next/font
- [App Router](../core/app-router.md) — `loading.tsx`, Suspense boundaries, layout nesting
- [react-reference UI Components](../../react-reference/libraries/ui-components.md) — composition patterns, accessible primitives
