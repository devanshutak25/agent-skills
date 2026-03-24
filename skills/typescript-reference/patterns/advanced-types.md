# Advanced Types

Recursive types, deep object paths, variadic tuples, and higher-kinded type patterns.

## Recursive Types

```typescript
// JSON type
type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

// Linked list
type List<T> = { value: T; next: List<T> | null };

// Deep readonly
type DeepReadonly<T> = T extends Function
  ? T
  : T extends object
  ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;

// Deep partial
type DeepPartial<T> = T extends object
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T;

// Recursive flatten
type Flatten<T extends readonly any[]> = T extends readonly [infer Head, ...infer Tail]
  ? Head extends readonly any[]
    ? [...Flatten<Head>, ...Flatten<Tail>]
    : [Head, ...Flatten<Tail>]
  : [];

type F = Flatten<[1, [2, 3], [4, [5]]]>; // [1, 2, 3, 4, 5]
```

## Deep Object Paths

```typescript
// Dot-notation paths for nested objects
type Paths<T, Prefix extends string = ""> = T extends object
  ? {
      [K in keyof T & string]:
        | `${Prefix}${K}`
        | Paths<T[K], `${Prefix}${K}.`>;
    }[keyof T & string]
  : never;

// Get value type at a path
type Get<T, P extends string> =
  P extends `${infer Key}.${infer Rest}`
    ? Key extends keyof T
      ? Get<T[Key], Rest>
      : never
    : P extends keyof T
    ? T[P]
    : never;

// Usage
interface Config {
  db: { host: string; port: number; ssl: { cert: string } };
  app: { name: string };
}

type ConfigPaths = Paths<Config>;
// "db" | "db.host" | "db.port" | "db.ssl" | "db.ssl.cert" | "app" | "app.name"

type T1 = Get<Config, "db.host">;     // string
type T2 = Get<Config, "db.ssl.cert">; // string

// Type-safe getter
function get<T, P extends Paths<T>>(obj: T, path: P): Get<T, P & string> {
  return path.split(".").reduce((o: any, k) => o?.[k], obj);
}
```

## Variadic Tuple Types

```typescript
// Spread in tuple positions
type Concat<A extends any[], B extends any[]> = [...A, ...B];
type T3 = Concat<[1, 2], [3, 4]>; // [1, 2, 3, 4]

// Head and Tail
type Head<T extends any[]> = T extends [infer H, ...any[]] ? H : never;
type Tail<T extends any[]> = T extends [any, ...infer R] ? R : never;

// Last element
type Last<T extends any[]> = T extends [...any[], infer L] ? L : never;

// Typed zip
type Zip<A extends any[], B extends any[]> =
  A extends [infer AH, ...infer AT]
    ? B extends [infer BH, ...infer BT]
      ? [[AH, BH], ...Zip<AT, BT>]
      : []
    : [];

type Z = Zip<[1, 2, 3], ["a", "b", "c"]>; // [[1, "a"], [2, "b"], [3, "c"]]

// Typed function composition
type Composable = readonly [(...args: any[]) => any, ...readonly ((...args: any[]) => any)[]];

type LastReturn<T extends Composable> = T extends [...any[], (...args: any[]) => infer R] ? R : never;
```

## Tuple Length & Arithmetic

```typescript
// Tuple of N length
type TupleOf<T, N extends number, R extends T[] = []> =
  R["length"] extends N ? R : TupleOf<T, N, [...R, T]>;

type Five = TupleOf<string, 5>; // [string, string, string, string, string]

// Type-level addition
type Add<A extends number, B extends number> =
  [...TupleOf<0, A>, ...TupleOf<0, B>]["length"];

type Sum = Add<3, 4>; // 7
```

## Higher-Kinded Types (HKT Pattern)

```typescript
// TypeScript doesn't have native HKTs, but we can emulate them

// 1. URI-based pattern (fp-ts style)
interface URItoKind<A> {
  Option: Option<A>;
  Array: A[];
  Promise: Promise<A>;
}
type URIS = keyof URItoKind<any>;
type Kind<F extends URIS, A> = URItoKind<A>[F];

interface Functor<F extends URIS> {
  map: <A, B>(fa: Kind<F, A>, f: (a: A) => B) => Kind<F, B>;
}

// 2. Type-lambda pattern (simpler)
interface TypeLambda {
  readonly type: unknown;
  readonly target: unknown;
}

type Apply<F extends TypeLambda, A> = (F & { readonly target: A })["type"];

// Define a "type function" for Array
interface ArrayF extends TypeLambda {
  readonly type: Array<this["target"]>;
}

type T4 = Apply<ArrayF, string>; // string[]
```

## Template Literal Parsing

```typescript
// Parse route params
type ParseRoute<S extends string> =
  S extends `${string}:${infer Param}/${infer Rest}`
    ? { [K in Param | keyof ParseRoute<Rest>]: string }
    : S extends `${string}:${infer Param}`
    ? { [K in Param]: string }
    : {};

type Params = ParseRoute<"/users/:id/posts/:postId">;
// { id: string; postId: string }

// Split string
type Split<S extends string, D extends string> =
  S extends `${infer Head}${D}${infer Tail}`
    ? [Head, ...Split<Tail, D>]
    : [S];

type Parts = Split<"a.b.c", ".">; // ["a", "b", "c"]
```

## Mapped Discriminated Union

```typescript
// Convert union to mapped type and back
type EventMap = {
  click: { x: number; y: number };
  keydown: { key: string; code: string };
  resize: { width: number; height: number };
};

// Union from map
type Event = {
  [K in keyof EventMap]: { type: K } & EventMap[K];
}[keyof EventMap];
// { type: "click"; x: number; y: number }
// | { type: "keydown"; key: string; code: string }
// | { type: "resize"; width: number; height: number }
```
