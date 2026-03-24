# ORMs &amp; Database Libraries

Type-safe database access with TypeScript.

## Decision Matrix

| Library | Approach | Migrations | Best For |
|---------|----------|------------|----------|
| **Prisma** | Schema-first, codegen | Built-in | Rapid development, schema clarity |
| **Drizzle** | TypeScript-first, SQL-like | Kit or push | SQL control, lightweight, edge |
| **Kysely** | Query builder only | External | Existing schemas, raw SQL flexibility |

## Prisma

```prisma
// schema.prisma
model User {
  id    String @id @default(cuid())
  email String @unique
  name  String
  posts Post[]
}

model Post {
  id       String @id @default(cuid())
  title    String
  author   User   @relation(fields: [authorId], references: [id])
  authorId String
}
```

```typescript
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Fully typed queries
const user = await prisma.user.findUnique({
  where: { email: "alice@example.com" },
  include: { posts: true },
});
// user: { id: string; email: string; name: string; posts: Post[] } | null

// Type-safe create
await prisma.user.create({
  data: { email: "bob@example.com", name: "Bob" },
});

// Transaction
await prisma.$transaction([
  prisma.user.update({ where: { id: "1" }, data: { name: "Alice" } }),
  prisma.post.create({ data: { title: "Hello", authorId: "1" } }),
]);
```

## Drizzle

```typescript
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";

// Schema in TypeScript
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").unique().notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  authorId: uuid("author_id").references(() => users.id),
});

// Typed queries (SQL-like API)
const db = drizzle(pool);

const result = await db.select().from(users).where(eq(users.email, "alice@example.com"));
// { id: string; email: string; name: string; createdAt: Date | null }[]

// Joins
const withPosts = await db
  .select({ user: users, post: posts })
  .from(users)
  .leftJoin(posts, eq(users.id, posts.authorId));

// Insert
await db.insert(users).values({ email: "bob@example.com", name: "Bob" });

// Infer types from schema
type User = typeof users.$inferSelect;
type NewUser = typeof users.$inferInsert;
```

## Kysely

```typescript
import { Kysely, PostgresDialect } from "kysely";

// Define database interface
interface Database {
  users: { id: string; email: string; name: string };
  posts: { id: string; title: string; author_id: string };
}

const db = new Kysely<Database>({ dialect: new PostgresDialect({ pool }) });

// Fully typed query builder
const user = await db
  .selectFrom("users")
  .where("email", "=", "alice@example.com")
  .selectAll()
  .executeTakeFirst();
// { id: string; email: string; name: string } | undefined

// Joins
const result = await db
  .selectFrom("users")
  .innerJoin("posts", "posts.author_id", "users.id")
  .select(["users.name", "posts.title"])
  .execute();
```
