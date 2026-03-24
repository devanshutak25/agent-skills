# Inference Patterns

Techniques for maximizing TypeScript's type inference to reduce manual annotations.

## satisfies for Inference

```typescript
// Problem: type annotation widens
const routes: Record<string, { path: string }> = {
  home: { path: "/" },
  about: { path: "/about" },
};
// routes.home — type is { path: string }, key autocomplete lost

// Solution: satisfies preserves inference
const routes = {
  home: { path: "/" },
  about: { path: "/about" },
} satisfies Record<string, { path: string }>;
// routes.home.path is "/" (literal)
// Object.keys(routes) → autocomplete: "home" | "about"
```

## const Type Parameters

```typescript
// Without const: values widen
function createConfig<T extends Record<string, unknown>>(config: T): T { return config; }
const cfg1 = createConfig({ port: 3000, debug: true });
// { port: number; debug: boolean } — widened

// With const: values stay literal
function createConfig<const T extends Record<string, unknown>>(config: T): T { return config; }
const cfg2 = createConfig({ port: 3000, debug: true });
// { readonly port: 3000; readonly debug: true } — literal
```

## NoInfer to Control Inference Sites

```typescript
// Problem: T inferred from both params
function createStore<T>(initial: T, fallback: T): T { /* ... */ }
createStore("hello", 42); // T = string | number (unexpected)

// Solution: NoInfer blocks inference from specific position
function createStore<T>(initial: T, fallback: NoInfer<T>): T { /* ... */ }
createStore("hello", 42); // Error: number not assignable to string
// T inferred only from `initial`

// Common: default values
function useState<T>(initial: T, reset?: NoInfer<T>): [T, (v: T) => void] { /* ... */ }

// Common: state machines
function defineFSM<S extends string>(config: {
  initial: NoInfer<S>;
  states: S[];
}) { /* ... */ }

defineFSM({ initial: "idle", states: ["idle", "loading", "done"] }); // OK
defineFSM({ initial: "oops", states: ["idle", "loading", "done"] }); // Error
```

## Return Type Inference

```typescript
// Let TS infer return types for internal functions
function createAPI(baseUrl: string) {
  return {
    get: <T>(path: string) => fetch(`${baseUrl}${path}`).then(r => r.json()) as Promise<T>,
    post: <T>(path: string, body: unknown) =>
      fetch(`${baseUrl}${path}`, { method: "POST", body: JSON.stringify(body) }).then(r => r.json()) as Promise<T>,
  };
}

// Return type automatically inferred — no need to define interface
const api = createAPI("/api");
// typeof api = { get<T>(path: string): Promise<T>; post<T>(path: string, body: unknown): Promise<T> }
```

## Function Overloads for Better Inference

```typescript
// Without overloads: loose return type
function parse(input: string | number): string | number {
  return typeof input === "string" ? input.trim() : input * 2;
}
const v = parse("hello"); // string | number (too wide)

// With overloads: precise per-input return
function parse(input: string): string;
function parse(input: number): number;
function parse(input: string | number): string | number {
  return typeof input === "string" ? input.trim() : input * 2;
}
const v1 = parse("hello"); // string
const v2 = parse(42);      // number
```

## Generic Inference from Callbacks

```typescript
// TS infers generics from callback return types
function defineHandler<T>(handler: () => T): { result: T } {
  return { result: handler() };
}

const h = defineHandler(() => ({ name: "Alice", age: 30 }));
// h.result: { name: string; age: number } — inferred from callback
```

## Inference from Array/Object Literals

```typescript
// Tuple inference with as const
const tuple = [1, "two", true] as const;
// readonly [1, "two", true]

// Array.map preserves tuple structure (TS 5.2+)
const mapped = ([1, 2, 3] as const).map(x => x * 2);
// number[] (not tuple — map doesn't preserve)

// Object.entries with const assertion
const obj = { a: 1, b: "two" } as const;
type Entries = (typeof obj)[keyof typeof obj]; // 1 | "two"
```

## Builder Inference Chain

```typescript
// Each method returns narrower type
function query() {
  const state = { table: "", cols: [] as string[], cond: "" };

  return {
    from: <T extends string>(table: T) => ({
      select: <C extends string[]>(...cols: C) => ({
        where: (cond: string) => ({
          build: () => `SELECT ${cols.join(",")} FROM ${table} WHERE ${cond}` as const,
        }),
        build: () => `SELECT ${cols.join(",")} FROM ${table}` as const,
      }),
    }),
  };
}

const sql = query().from("users").select("id", "name").where("active").build();
// Type: `SELECT id,name FROM users WHERE active`
```

## Conditional Return Type Inference

```typescript
// Use generics + conditional types for precise returns
function process<T extends "string" | "number">(
  type: T
): T extends "string" ? string : number;
function process(type: "string" | "number") {
  return type === "string" ? "hello" : 42;
}

const s = process("string"); // string
const n = process("number"); // number
```

## Tips

| Technique | When to Use |
|-----------|-------------|
| `satisfies` | Validate shape without losing literal types |
| `as const` | Freeze values to literal/tuple types |
| `const` type param | Preserve literal types through generics |
| `NoInfer<T>` | Block inference from specific argument positions |
| Overloads | Different return types based on input types |
| Return inference | Internal functions — skip explicit return types |
| `as const satisfies` | Validate shape + freeze to literals |
