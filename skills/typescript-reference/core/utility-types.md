# Utility Types

Built-in TypeScript utility types with signatures and practical examples.

## Object Types

### Partial\<T\> / Required\<T\>
```typescript
type Partial<T> = { [P in keyof T]?: T[P] };
type Required<T> = { [P in keyof T]-?: T[P] };

interface User { name: string; age: number; email?: string }
type PartialUser = Partial<User>;   // all optional
type RequiredUser = Required<User>; // all required, including email

// Common: patch/update functions
function updateUser(id: string, patch: Partial<User>) { /* ... */ }
```

### Readonly\<T\>
```typescript
type Readonly<T> = { readonly [P in keyof T]: T[P] };

const config: Readonly<{ host: string; port: number }> = { host: "localhost", port: 3000 };
// config.port = 8080; // Error: Cannot assign to 'port'
```

### Pick\<T, K\> / Omit\<T, K\>
```typescript
type Pick<T, K extends keyof T> = { [P in K]: T[P] };
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

type UserPreview = Pick<User, "name" | "email">;
type UserWithoutEmail = Omit<User, "email">;
```

### Record\<K, V\>
```typescript
type Record<K extends keyof any, T> = { [P in K]: T };

type Roles = "admin" | "user" | "guest";
const permissions: Record<Roles, string[]> = {
  admin: ["read", "write", "delete"],
  user: ["read", "write"],
  guest: ["read"],
};
```

## Union / Intersection Utilities

### Exclude\<T, U\> / Extract\<T, U\>
```typescript
type Exclude<T, U> = T extends U ? never : T;
type Extract<T, U> = T extends U ? T : never;

type T1 = Exclude<"a" | "b" | "c", "a">;       // "b" | "c"
type T2 = Extract<"a" | "b" | "c", "a" | "f">; // "a"
```

### NonNullable\<T\>
```typescript
type NonNullable<T> = T & {};  // TS 5.4+ simplified

type T3 = NonNullable<string | null | undefined>; // string
```

## Function Utilities

### Parameters\<T\> / ReturnType\<T\>
```typescript
type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;
type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any;

function createUser(name: string, age: number): User { /* ... */ }
type CreateParams = Parameters<typeof createUser>;  // [string, number]
type CreateReturn = ReturnType<typeof createUser>;   // User
```

### ConstructorParameters\<T\> / InstanceType\<T\>
```typescript
class UserService {
  constructor(private db: Database, private logger: Logger) {}
}
type Args = ConstructorParameters<typeof UserService>; // [Database, Logger]
type Instance = InstanceType<typeof UserService>;       // UserService
```

## String Utilities

### Uppercase / Lowercase / Capitalize / Uncapitalize
```typescript
type T4 = Uppercase<"hello">;     // "HELLO"
type T5 = Lowercase<"HELLO">;     // "hello"
type T6 = Capitalize<"hello">;    // "Hello"
type T7 = Uncapitalize<"Hello">;  // "hello"

// Useful in template literal types
type EventName<T extends string> = `on${Capitalize<T>}`;
type T8 = EventName<"click">; // "onClick"
```

## Async Utilities

### Awaited\<T\> (TS 4.5+)
```typescript
type Awaited<T> = T extends PromiseLike<infer U> ? Awaited<U> : T;

type A = Awaited<Promise<string>>;              // string
type B = Awaited<Promise<Promise<number>>>;     // number (recursive unwrap)
type C = Awaited<boolean | Promise<string>>;    // boolean | string
```

## TS 5.4+ Additions

### NoInfer\<T\> (TS 5.4)
```typescript
// Prevents inference from a specific position
function createFSM<S extends string>(config: {
  initial: NoInfer<S>;
  states: S[];
}) { /* ... */ }

// S inferred from `states` only, not `initial`
createFSM({ initial: "idle", states: ["idle", "loading", "done"] }); // OK
createFSM({ initial: "oops", states: ["idle", "loading", "done"] }); // Error
```

## Quick Reference Table

| Utility | Purpose |
|---------|---------|
| `Partial<T>` | All properties optional |
| `Required<T>` | All properties required |
| `Readonly<T>` | All properties readonly |
| `Pick<T, K>` | Subset of properties |
| `Omit<T, K>` | All except specified properties |
| `Record<K, V>` | Object type from key/value types |
| `Exclude<T, U>` | Remove types from union |
| `Extract<T, U>` | Keep types in union |
| `NonNullable<T>` | Remove null/undefined |
| `Parameters<T>` | Function parameter types |
| `ReturnType<T>` | Function return type |
| `ConstructorParameters<T>` | Constructor parameter types |
| `InstanceType<T>` | Class instance type |
| `Awaited<T>` | Unwrap Promise type |
| `NoInfer<T>` | Block inference at position |
| `Uppercase<S>` | Uppercase string literal |
| `Lowercase<S>` | Lowercase string literal |
| `Capitalize<S>` | Capitalize first char |
| `Uncapitalize<S>` | Uncapitalize first char |
