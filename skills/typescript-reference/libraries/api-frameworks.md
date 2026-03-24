# API Frameworks

End-to-end type-safe API development.

## Decision Matrix

| Framework | Runtime | Approach | Best For |
|-----------|---------|----------|----------|
| **tRPC** | Any (Node, Bun, Deno, edge) | RPC, no codegen | Full-stack TS apps (monorepo) |
| **Hono** | Any (edge-native) | HTTP framework | Edge/serverless, multi-runtime |
| **Elysia** | Bun | HTTP framework | Bun-native, high perf |

## tRPC

```typescript
// server/trpc.ts
import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";

const t = initTRPC.context<{ userId?: string }>().create();

const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.userId) throw new TRPCError({ code: "UNAUTHORIZED" });
  return next({ ctx: { userId: ctx.userId } });
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);

// server/router.ts
const appRouter = router({
  user: router({
    getById: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        return db.users.findById(input.id);
      }),

    create: protectedProcedure
      .input(z.object({ name: z.string(), email: z.string().email() }))
      .mutation(async ({ input, ctx }) => {
        return db.users.create({ ...input, createdBy: ctx.userId });
      }),
  }),
});

export type AppRouter = typeof appRouter;

// client.ts — Full type inference, no codegen
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "./server/router";

const trpc = createTRPCClient<AppRouter>({
  links: [httpBatchLink({ url: "http://localhost:3000/trpc" })],
});

const user = await trpc.user.getById.query({ id: "1" });
// Fully typed: { id: string; name: string; email: string } | null
```

## Hono

```typescript
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const app = new Hono()
  .get("/users/:id", async (c) => {
    const id = c.req.param("id"); // string
    const user = await db.users.findById(id);
    return c.json(user); // Response type inferred
  })
  .post(
    "/users",
    zValidator("json", z.object({ name: z.string(), email: z.string().email() })),
    async (c) => {
      const body = c.req.valid("json"); // { name: string; email: string }
      const user = await db.users.create(body);
      return c.json(user, 201);
    }
  );

// RPC mode — type-safe client
import { hc } from "hono/client";
type AppType = typeof app;

const client = hc<AppType>("http://localhost:3000");
const res = await client.users[":id"].$get({ param: { id: "1" } });
const user = await res.json(); // Typed response
```

## Elysia

```typescript
import { Elysia, t } from "elysia";

const app = new Elysia()
  .get("/users/:id", ({ params }) => {
    return db.users.findById(params.id);
  }, {
    params: t.Object({ id: t.String() }),
    response: t.Object({ id: t.String(), name: t.String() }),
  })
  .post("/users", ({ body }) => {
    return db.users.create(body);
  }, {
    body: t.Object({ name: t.String(), email: t.String({ format: "email" }) }),
  })
  .listen(3000);

// Eden — type-safe client (auto-generated from Elysia types)
import { treaty } from "@elysiajs/eden";
const client = treaty<typeof app>("localhost:3000");
const { data } = await client.users({ id: "1" }).get();
```
