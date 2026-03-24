# Generics

Generic functions, classes, constraints, defaults, and const type parameters.

## Generic Functions

```typescript
function identity<T>(value: T): T { return value; }

// Type inferred
const str = identity("hello"); // string
const num = identity(42);      // number

// Explicit annotation
const explicit = identity<string>("hello");
```

## Generic Constraints

### extends Keyword
```typescript
function getLength<T extends { length: number }>(item: T): number {
  return item.length;
}

getLength("hello");      // OK
getLength([1, 2, 3]);    // OK
// getLength(42);         // Error: number has no 'length'
```

### keyof Constraint
```typescript
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { name: "Alice", age: 30 };
const name = getProperty(user, "name"); // string
// getProperty(user, "foo");            // Error: "foo" not in keyof User
```

### Multiple Constraints
```typescript
function merge<T extends object, U extends object>(a: T, b: U): T & U {
  return { ...a, ...b };
}
```

## Generic Defaults

```typescript
interface ApiResponse<T = unknown, E = Error> {
  data: T;
  error: E | null;
}

type UserResponse = ApiResponse<User>;        // E defaults to Error
type RawResponse = ApiResponse;               // T = unknown, E = Error
type CustomErr = ApiResponse<User, AppError>; // Both specified
```

## const Type Parameters (TS 5.0+)

```typescript
// Without const: T inferred as string[]
function withoutConst<T extends readonly string[]>(arr: T) { return arr; }
const a = withoutConst(["a", "b"]); // string[]

// With const: T inferred as readonly ["a", "b"]
function withConst<const T extends readonly string[]>(arr: T) { return arr; }
const b = withConst(["a", "b"]); // readonly ["a", "b"]

// Practical: typed config objects
function defineRoutes<const T extends Record<string, { path: string }>>(routes: T): T {
  return routes;
}

const routes = defineRoutes({
  home: { path: "/" },
  about: { path: "/about" },
});
// typeof routes.home.path = "/"  (literal, not string)
```

## Generic Classes

```typescript
class TypedMap<K, V> {
  private map = new Map<K, V>();

  set(key: K, value: V): this { this.map.set(key, value); return this; }
  get(key: K): V | undefined { return this.map.get(key); }
}

const userMap = new TypedMap<string, User>();
userMap.set("alice", { name: "Alice", age: 30 });
```

## Generic Interfaces

```typescript
interface Repository<T extends { id: string }> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(data: Omit<T, "id">): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

class UserRepo implements Repository<User> {
  // All methods typed to User
}
```

## Generic Type Aliases

```typescript
type Nullable<T> = T | null;
type AsyncResult<T, E = Error> = Promise<{ data: T; error: null } | { data: null; error: E }>;

// Recursive generic
type Tree<T> = {
  value: T;
  children: Tree<T>[];
};
```

## Inference with Generics

```typescript
// Infer from return position
function createState<T>(initial: T) {
  let value = initial;
  return {
    get: (): T => value,
    set: (next: T) => { value = next; },
  };
}

const counter = createState(0);
counter.set(1);    // OK
// counter.set(""); // Error: string not assignable to number
```

## Common Patterns

```typescript
// Factory pattern
type Constructor<T = any> = new (...args: any[]) => T;

function createInstance<T>(ctor: Constructor<T>, ...args: any[]): T {
  return new ctor(...args);
}

// Wrapper type
type Wrapper<T> = { value: T; unwrap(): T };

// Mapped generic
type Async<T extends Record<string, (...args: any[]) => any>> = {
  [K in keyof T]: (...args: Parameters<T[K]>) => Promise<ReturnType<T[K]>>;
};
```
