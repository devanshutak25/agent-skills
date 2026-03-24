# Validation Libraries

Type-safe validation with schema inference. All support Standard Schema 1.0.

## Decision Matrix

| Library | Bundle (min+gz) | Approach | Ecosystem | Best For |
|---------|----------------|----------|-----------|----------|
| **Zod** | ~14 KB | Builder API | Largest | Most projects — best DX, widest adoption |
| **Valibot** | ~1-5 KB | Modular/tree-shake | Growing | Bundle-sensitive apps |
| **ArkType** | ~4 KB | String syntax | Small | Type-level perf, novel syntax |
| **TypeBox** | ~8 KB | JSON Schema | Moderate | APIs needing JSON Schema output |

## Zod

```typescript
import { z } from "zod";

const UserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  age: z.number().int().positive().optional(),
  role: z.enum(["admin", "user", "guest"]),
  tags: z.array(z.string()).default([]),
});

type User = z.infer<typeof UserSchema>; // Inferred type

// Parsing (throws on failure)
const user = UserSchema.parse(rawData);

// Safe parsing (returns result object)
const result = UserSchema.safeParse(rawData);
if (result.success) {
  result.data; // User
} else {
  result.error.issues; // ZodIssue[]
}

// Transform
const CreateUserSchema = UserSchema.omit({ role: true }).extend({
  password: z.string().min(8),
});

// Async refinement
const UniqueEmail = z.string().email().refine(
  async (email) => !(await emailExists(email)),
  "Email already taken"
);
```

## Valibot

```typescript
import * as v from "valibot";

const UserSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1)),
  email: v.pipe(v.string(), v.email()),
  age: v.optional(v.pipe(v.number(), v.integer(), v.minValue(1))),
  role: v.picklist(["admin", "user", "guest"]),
});

type User = v.InferOutput<typeof UserSchema>;

// Parse (throws)
const user = v.parse(UserSchema, rawData);

// Safe parse
const result = v.safeParse(UserSchema, rawData);
if (result.success) {
  result.output; // User
} else {
  result.issues; // Issue[]
}
```

## ArkType

```typescript
import { type } from "arktype";

const User = type({
  name: "string > 0",
  email: "string.email",
  "age?": "integer > 0",
  role: "'admin' | 'user' | 'guest'",
});

type User = typeof User.infer;

const result = User({ name: "Alice", email: "a@b.com", role: "admin" });
if (result instanceof type.errors) {
  result.summary; // Human-readable errors
} else {
  result; // User
}
```

## Standard Schema (v1.0)

```typescript
// Unified interface — works with Zod, Valibot, ArkType
import type { StandardSchemaV1 } from "@standard-schema/spec";

async function validate<T>(schema: StandardSchemaV1<T>, data: unknown): Promise<T> {
  const result = await schema["~standard"].validate(data);
  if (result.issues) throw new ValidationError(result.issues);
  return result.value;
}

// Works with any conforming library
validate(zodSchema, data);
validate(valibotSchema, data);
validate(arktypeSchema, data);
```
