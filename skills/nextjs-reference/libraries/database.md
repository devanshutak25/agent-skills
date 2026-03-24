# Database

## Decision Matrix

| ORM / Driver | Type safety | Migration tooling | Edge runtime | Bundle size | Best for |
|---|---|---|---|---|---|
| Prisma v6 | Generated types | `prisma migrate` | No (Node.js only) | Large | Rapid development, complex relations |
| Drizzle ORM | Inferred from schema | `drizzle-kit` | Yes (HTTP drivers) | Small | Edge runtime, schema-as-code |
| Kysely | Inferred | None (raw SQL migrations) | With HTTP adapter | Small | SQL-first, strong typing |
| Raw `pg` / `mysql2` | Manual | None | No | Small | Full control, simple queries |

## Direct DB Queries in Server Components

This is the core Next.js pattern — no API layer needed for your own data.

```tsx
// app/products/page.tsx
import { db } from "@/lib/db";

export default async function ProductsPage() {
  // Runs on the server — DB credentials never reach the client
  const products = await db.product.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return <ProductList products={products} />;
}
```

Add `import "server-only"` to your DB module to prevent accidental client-side imports.

## Prisma v6 — Serverless Singleton

Module-level `new PrismaClient()` creates a new connection pool per hot-reload in dev — use a singleton.

```ts
// lib/db.ts
import "server-only";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
```

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Product {
  id          String   @id @default(cuid())
  name        String
  price       Decimal  @db.Decimal(10, 2)
  published   Boolean  @default(false)
  createdAt   DateTime @default(now())
}
```

```bash
npx prisma migrate dev --name init
npx prisma generate
```

## Drizzle ORM — Schema as Code

```ts
// lib/schema.ts
import { pgTable, text, boolean, timestamp, numeric } from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id:        text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name:      text("name").notNull(),
  price:     numeric("price", { precision: 10, scale: 2 }).notNull(),
  published: boolean("published").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

```ts
// lib/db.ts
import "server-only";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
export const db = drizzle(pool, { schema });
```

```ts
// Usage in a Server Component or Server Action
import { db } from "@/lib/db";
import { products } from "@/lib/schema";
import { eq } from "drizzle-orm";

const result = await db
  .select()
  .from(products)
  .where(eq(products.published, true))
  .limit(20);
```

## Connection Pooling in Serverless

Each serverless function invocation can open a new DB connection — pools saturate quickly without a proxy.

| Solution | Works with | Notes |
|---|---|---|
| PgBouncer | Prisma, Drizzle, raw `pg` | Self-hosted, transaction mode |
| Prisma Accelerate | Prisma only | Managed, edge-compatible via HTTP |
| Neon pooler | Drizzle, raw `pg`, Prisma | Built into Neon, serverless-first |
| Supabase pooler | All | Supavisor, transaction mode |

```bash
# .env — use pooled URL for app, direct URL for migrations
DATABASE_URL="postgres://user:pass@pooler.host:6543/db?pgbouncer=true"
DIRECT_URL="postgres://user:pass@direct.host:5432/db"
```

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")  // Prisma uses this for migrations only
}
```

## Edge Runtime Limitations

Node.js native drivers (`pg`, `mysql2`) do not run on the Edge Runtime (V8 isolates).

Use HTTP-based drivers for edge:
- Neon serverless: `@neondatabase/serverless` — WebSocket/HTTP
- PlanetScale: `@planetscale/database` — HTTP
- Turso (libSQL): `@libsql/client` — HTTP

```ts
// lib/db-edge.ts  — edge-compatible
import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL!);

export async function getProducts() {
  return sql`SELECT * FROM products WHERE published = true LIMIT 20`;
}
```

## DB Mutations in Server Actions

```ts
// app/products/actions.ts
"use server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const schema = z.object({ name: z.string().min(1), price: z.number().positive() });

export async function createProduct(formData: FormData) {
  const result = schema.safeParse({
    name: formData.get("name"),
    price: Number(formData.get("price")),
  });
  if (!result.success) return { errors: result.error.flatten().fieldErrors };

  await db.product.create({ data: result.data });
  revalidatePath("/products");
}
```

## Cross-References

- [Server Actions](../core/server-actions.md) — mutations, revalidation after DB writes
- [Data Fetching](./data-fetching.md) — fetching DB data in Server Components
- [Auth](./auth.md) — scoping DB queries to the authenticated user
