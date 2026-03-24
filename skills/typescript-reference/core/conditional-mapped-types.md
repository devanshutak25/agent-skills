# Conditional & Mapped Types

Advanced type-level programming with conditional types, mapped types, and template literal types.

## Conditional Types

### Basic Syntax
```typescript
type IsString<T> = T extends string ? true : false;

type A = IsString<"hello">; // true
type B = IsString<42>;      // false
```

### Distributive Conditional Types
```typescript
// Distributes over union members automatically
type ToArray<T> = T extends any ? T[] : never;

type T1 = ToArray<string | number>; // string[] | number[]

// Prevent distribution with []
type ToArrayNonDist<T> = [T] extends [any] ? T[] : never;
type T2 = ToArrayNonDist<string | number>; // (string | number)[]
```

### infer Keyword
```typescript
// Extract types from positions
type UnpackPromise<T> = T extends Promise<infer U> ? U : T;
type T3 = UnpackPromise<Promise<string>>; // string

// infer in function signatures
type FirstArg<T> = T extends (first: infer F, ...rest: any[]) => any ? F : never;
type T4 = FirstArg<(name: string, age: number) => void>; // string

// infer with extends constraint (TS 5.0+)
type GetString<T> = T extends { value: infer V extends string } ? V : never;
```

### Nested Conditionals
```typescript
type TypeName<T> =
  T extends string ? "string" :
  T extends number ? "number" :
  T extends boolean ? "boolean" :
  T extends Function ? "function" :
  "object";
```

## Mapped Types

### Basic Mapped Type
```typescript
type Optional<T> = { [K in keyof T]?: T[K] };
type ReadonlyAll<T> = { readonly [K in keyof T]: T[K] };
```

### Key Remapping (as clause)
```typescript
// Rename keys with template literals
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

interface Person { name: string; age: number }
type PersonGetters = Getters<Person>;
// { getName: () => string; getAge: () => number }

// Filter keys
type OnlyStrings<T> = {
  [K in keyof T as T[K] extends string ? K : never]: T[K];
};
```

### Modifier Manipulation
```typescript
// Remove readonly
type Mutable<T> = { -readonly [K in keyof T]: T[K] };

// Remove optional
type Concrete<T> = { [K in keyof T]-?: T[K] };
```

### Mapped Type over Union
```typescript
type EventMap = {
  [E in "click" | "focus" | "blur"]: Event;
};
```

## Template Literal Types

### Basic Templates
```typescript
type Greeting = `Hello, ${string}`;
type T5 = Greeting; // `Hello, ${string}`

const g: Greeting = "Hello, world"; // OK
// const bad: Greeting = "Goodbye"; // Error
```

### Union Expansion
```typescript
type Color = "red" | "blue";
type Size = "sm" | "lg";
type Variant = `${Color}-${Size}`;
// "red-sm" | "red-lg" | "blue-sm" | "blue-lg"
```

### String Parsing
```typescript
type ExtractRoute<S extends string> =
  S extends `${infer _Start}:${infer Param}/${infer Rest}`
    ? Param | ExtractRoute<Rest>
    : S extends `${infer _Start}:${infer Param}`
    ? Param
    : never;

type Params = ExtractRoute<"/users/:userId/posts/:postId">;
// "userId" | "postId"
```

### Intrinsic String Types in Templates
```typescript
type PropEventMap<T> = {
  [K in keyof T as `on${Capitalize<string & K>}Change`]: (value: T[K]) => void;
};

interface Form { name: string; email: string }
type FormEvents = PropEventMap<Form>;
// { onNameChange: (value: string) => void; onEmailChange: (value: string) => void }
```

## Combining Conditional + Mapped

### Deep Readonly
```typescript
type DeepReadonly<T> = T extends Function
  ? T
  : T extends object
  ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;
```

### Deep Partial
```typescript
type DeepPartial<T> = T extends object
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T;
```

### Extract Object Paths
```typescript
type Paths<T, Prefix extends string = ""> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ? `${Prefix}${K}` | Paths<T[K], `${Prefix}${K}.`>
        : `${Prefix}${K}`;
    }[keyof T & string]
  : never;

interface Config { db: { host: string; port: number }; app: { name: string } }
type ConfigPaths = Paths<Config>; // "db" | "db.host" | "db.port" | "app" | "app.name"
```
