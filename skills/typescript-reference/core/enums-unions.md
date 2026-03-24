# Enums vs Union Types

When to use enums, const enums, and union types.

## String Unions (Preferred)

```typescript
type Status = "active" | "inactive" | "pending";

function setStatus(status: Status) { /* ... */ }
setStatus("active"); // OK, autocomplete works
// setStatus("invalid"); // Error

// Extract values
const statuses: Status[] = ["active", "inactive", "pending"];
```

## Numeric Unions

```typescript
type HttpStatus = 200 | 201 | 400 | 404 | 500;

function isSuccess(code: HttpStatus): boolean {
  return code >= 200 && code < 300;
}
```

## String Enums

```typescript
enum Direction {
  Up = "UP",
  Down = "DOWN",
  Left = "LEFT",
  Right = "RIGHT",
}

// Type-safe usage
function move(dir: Direction) { /* ... */ }
move(Direction.Up);
// move("UP"); // Error: string not assignable to Direction

// Reverse: no reverse mapping for string enums
```

## Numeric Enums

```typescript
enum Priority {
  Low = 0,
  Medium = 1,
  High = 2,
  Critical = 3,
}

// Reverse mapping exists
Priority[0]; // "Low"
Priority.High; // 2

// Danger: any number is assignable
const p: Priority = 999; // No error! (type-safety gap)
```

## const enum

```typescript
const enum HttpMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
}

// Fully inlined at compile time — no runtime object
const method = HttpMethod.GET; // Compiled to: const method = "GET"

// Caveats:
// - Cannot iterate over values (no runtime object)
// - `isolatedModules` / `verbatimModuleSyntax` disallows const enum (use `preserveConstEnums`)
// - Cannot be used across package boundaries
```

## Object as Enum Pattern

```typescript
const Status = {
  Active: "active",
  Inactive: "inactive",
  Pending: "pending",
} as const;

type Status = (typeof Status)[keyof typeof Status];
// "active" | "inactive" | "pending"

// Best of both worlds:
// - Runtime object for iteration
// - Union type for type safety
// - Tree-shakeable
// - Works with isolatedModules

Object.values(Status); // ["active", "inactive", "pending"]
```

## Decision Matrix

| Approach | Runtime Object | Type Safety | Tree-Shake | `isolatedModules` |
|----------|---------------|-------------|------------|--------------------|
| String union | No | Best | N/A | Yes |
| String enum | Yes | Good | No | Yes |
| Numeric enum | Yes | Weak (any number) | No | Yes |
| const enum | No (inlined) | Good | Yes | No* |
| `as const` object | Yes | Best | Yes | Yes |

**Recommendation:** Use string unions for simple cases. Use `as const` object when you need both a runtime object and type safety. Avoid numeric enums (weak type safety).

## Migration: Enum → Union

```typescript
// Before
enum Color { Red = "red", Blue = "blue", Green = "green" }

// After (preferred)
const Color = { Red: "red", Blue: "blue", Green: "green" } as const;
type Color = (typeof Color)[keyof typeof Color]; // "red" | "blue" | "green"
```
