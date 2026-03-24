# Type Guards & Narrowing

Type predicates, control flow narrowing, discriminated unions, and exhaustiveness checking.

## typeof Narrowing

```typescript
function process(value: string | number) {
  if (typeof value === "string") {
    return value.toUpperCase(); // string
  }
  return value.toFixed(2); // number
}
```

## instanceof Narrowing

```typescript
function formatError(error: Error | string) {
  if (error instanceof TypeError) {
    return error.message; // TypeError
  }
  if (typeof error === "string") {
    return error; // string
  }
  return error.message; // Error
}
```

## in Operator Narrowing

```typescript
interface Fish { swim(): void }
interface Bird { fly(): void }

function move(animal: Fish | Bird) {
  if ("swim" in animal) {
    animal.swim(); // Fish
  } else {
    animal.fly(); // Bird
  }
}
```

## Custom Type Predicates

```typescript
function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isUser(obj: unknown): obj is User {
  return typeof obj === "object" && obj !== null && "name" in obj && "age" in obj;
}

// Usage with array filter
const mixed: (string | number)[] = ["a", 1, "b", 2];
const strings = mixed.filter(isString); // string[]
```

## Inferred Type Predicates (TS 5.5+)

```typescript
// TS 5.5 automatically infers type predicates in some cases
const users = [null, { name: "Alice" }, undefined, { name: "Bob" }];

// filter(Boolean) now narrows correctly in TS 5.5+
const validUsers = users.filter(Boolean);
// Type: { name: string }[]  (null/undefined removed)

// Also works with inline predicates
const nums = [1, null, 2, undefined, 3];
const defined = nums.filter(x => x != null); // number[]
```

## Discriminated Unions

```typescript
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rect"; width: number; height: number }
  | { kind: "triangle"; base: number; height: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rect":
      return shape.width * shape.height;
    case "triangle":
      return 0.5 * shape.base * shape.height;
  }
}
```

## Exhaustiveness Checking

```typescript
// Using never to ensure all cases handled
function assertNever(x: never): never {
  throw new Error(`Unexpected value: ${x}`);
}

function getArea(shape: Shape): number {
  switch (shape.kind) {
    case "circle": return Math.PI * shape.radius ** 2;
    case "rect": return shape.width * shape.height;
    case "triangle": return 0.5 * shape.base * shape.height;
    default: return assertNever(shape); // Error if a case is missing
  }
}

// satisfies never pattern
function getLabel(shape: Shape): string {
  switch (shape.kind) {
    case "circle": return "Circle";
    case "rect": return "Rectangle";
    case "triangle": return "Triangle";
    default:
      shape satisfies never; // Compile error if non-exhaustive
      throw new Error("unreachable");
  }
}
```

## Assertion Functions

```typescript
function assertDefined<T>(value: T | null | undefined, msg?: string): asserts value is T {
  if (value == null) throw new Error(msg ?? "Value is null/undefined");
}

function loadConfig(): Config | null { /* ... */ }
const config = loadConfig();
assertDefined(config, "Config not found");
config.database; // Config (narrowed)
```

## Narrowing with Tagged Templates

```typescript
// Result pattern with discriminated union
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

function handleResult<T>(result: Result<T>) {
  if (result.ok) {
    console.log(result.value); // T
  } else {
    console.error(result.error); // Error
  }
}
```
