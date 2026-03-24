# Type Utility Libraries

Libraries that extend TypeScript's type system.

## ts-pattern (Pattern Matching)

```bash
npm i ts-pattern
```

```typescript
import { match, P } from "ts-pattern";

type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rect"; w: number; h: number }
  | { kind: "triangle"; base: number; height: number };

const area = (shape: Shape) =>
  match(shape)
    .with({ kind: "circle" }, ({ radius }) => Math.PI * radius ** 2)
    .with({ kind: "rect" }, ({ w, h }) => w * h)
    .with({ kind: "triangle" }, ({ base, height }) => 0.5 * base * height)
    .exhaustive(); // Compile error if case missing

// Pattern wildcards
const describe = (value: unknown) =>
  match(value)
    .with(P.string, (s) => `string: ${s}`)
    .with(P.number.gte(0), (n) => `positive: ${n}`)
    .with(P.array(P.string), (arr) => `strings: ${arr.join(",")}`)
    .with({ name: P.string, age: P.number }, (u) => `user: ${u.name}`)
    .with(P.nullish, () => "empty")
    .otherwise(() => "unknown");

// With discriminated unions
type Result<T> = { ok: true; data: T } | { ok: false; error: Error };

const handle = <T>(result: Result<T>) =>
  match(result)
    .with({ ok: true }, ({ data }) => data)
    .with({ ok: false }, ({ error }) => { throw error; })
    .exhaustive();
```

## type-fest (Utility Types)

```bash
npm i -D type-fest
```

```typescript
import type {
  SetRequired,
  SetOptional,
  Merge,
  Simplify,
  PartialDeep,
  ReadonlyDeep,
  Paths,
  Get,
  CamelCase,
  KebabCase,
  SnakeCase,
  JsonValue,
  Promisable,
  SetNonNullable,
  LiteralUnion,
} from "type-fest";

// Make specific properties required
type T1 = SetRequired<{ a?: string; b?: number; c?: boolean }, "a" | "b">;
// { a: string; b: number; c?: boolean }

// Deep partial
type DeepConfig = PartialDeep<{ db: { host: string; port: number } }>;
// { db?: { host?: string; port?: number } }

// Merge (like intersection but handles conflicts)
type T2 = Merge<{ a: string; b: number }, { b: string; c: boolean }>;
// { a: string; b: string; c: boolean }

// Simplify (flatten intersection display)
type T3 = Simplify<{ a: string } & { b: number }>;
// { a: string; b: number }  (shown clean in hover)

// String casing
type T4 = CamelCase<"foo-bar-baz">;  // "fooBarBaz"
type T5 = KebabCase<"fooBarBaz">;    // "foo-bar-baz"

// LiteralUnion (autocomplete for string union + any string)
type Color = LiteralUnion<"red" | "blue" | "green", string>;
// Autocompletes "red", "blue", "green" but accepts any string

// JSON-safe types
type Config = JsonValue; // string | number | boolean | null | JsonArray | JsonObject
```

## ts-reset

```bash
npm i -D @total-typescript/ts-reset
```

```typescript
// reset.d.ts (import once in project)
import "@total-typescript/ts-reset";

// Fixes:

// 1. .json() returns unknown instead of any
const data = await fetch("/api").then(r => r.json()); // unknown (was: any)

// 2. .filter(Boolean) narrows correctly
const arr = [1, null, 2, undefined, 3].filter(Boolean); // number[] (was: (number | null | undefined)[])

// 3. Array.includes on readonly arrays
const ROLES = ["admin", "user"] as const;
ROLES.includes(input); // Works with string input (was: error)

// 4. Map.has narrows
const map = new Map<string, number>();
if (map.has(key)) {
  map.get(key); // number (was: number | undefined)
}

// 5. Set.has narrows
const set = new Set(["a", "b", "c"] as const);
if (set.has(input)) {
  input; // "a" | "b" | "c" (narrowed)
}
```
