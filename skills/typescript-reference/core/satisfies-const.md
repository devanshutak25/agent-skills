# satisfies & as const

The `satisfies` operator (TS 4.9+) and `as const` assertions for precise type control.

## satisfies Operator

### Purpose
Validates a value matches a type without widening or losing specificity.

```typescript
type Colors = Record<string, [number, number, number] | string>;

// Without satisfies — type is Colors (widened)
const colorsWide: Colors = {
  red: [255, 0, 0],
  green: "#00ff00",
};
colorsWide.red; // [number, number, number] | string — lost specificity

// With satisfies — validates shape, preserves literal types
const colors = {
  red: [255, 0, 0],
  green: "#00ff00",
} satisfies Colors;

colors.red;   // [number, number, number] — specific!
colors.green; // string — specific!
// colors.blue; // Error: property 'blue' does not exist (key checked)
```

### Common Uses

```typescript
// 1. Config objects — validate shape, keep literal keys
type Route = { path: string; auth: boolean };
const routes = {
  home: { path: "/", auth: false },
  dashboard: { path: "/dash", auth: true },
} satisfies Record<string, Route>;
// routes.home.path is "/" (literal), not string

// 2. Exhaustive mapping
type Status = "active" | "inactive" | "pending";
const labels = {
  active: "Active",
  inactive: "Inactive",
  pending: "Pending",
} satisfies Record<Status, string>;
// Missing a key → compile error

// 3. Function signatures
const handler = ((req, res) => {
  // ...
}) satisfies RequestHandler;
```

## as const

### Purpose
Makes all properties `readonly` and types literal.

```typescript
// Without as const
const config1 = { port: 3000, host: "localhost" };
// { port: number; host: string }

// With as const
const config2 = { port: 3000, host: "localhost" } as const;
// { readonly port: 3000; readonly host: "localhost" }

// Arrays become readonly tuples
const tuple = [1, "two", true] as const;
// readonly [1, "two", true]
```

### Extracting Union from as const

```typescript
const ROLES = ["admin", "user", "guest"] as const;
type Role = (typeof ROLES)[number]; // "admin" | "user" | "guest"

const STATUS_MAP = {
  active: 1,
  inactive: 2,
  pending: 3,
} as const;
type StatusKey = keyof typeof STATUS_MAP;    // "active" | "inactive" | "pending"
type StatusValue = (typeof STATUS_MAP)[StatusKey]; // 1 | 2 | 3
```

## as const satisfies (TS 5.0+)

Combines both: validate the shape AND preserve literal types with readonly.

```typescript
type Config = {
  env: "dev" | "staging" | "prod";
  port: number;
  features: string[];
};

const config = {
  env: "prod",
  port: 8080,
  features: ["auth", "logging"],
} as const satisfies Config;

// config.env is "prod" (literal, not "dev" | "staging" | "prod")
// config.port is 8080 (literal, not number)
// config.features is readonly ["auth", "logging"] (tuple, not string[])
// But shape is validated against Config
```

### Practical: Type-Safe Event Map

```typescript
type EventConfig = Record<string, { payload: unknown }>;

const events = {
  userCreated: { payload: { id: "", name: "" } },
  orderPlaced: { payload: { orderId: "", total: 0 } },
} as const satisfies EventConfig;

// Keys are literal union, payloads are precise types
type EventName = keyof typeof events;
type UserCreatedPayload = typeof events.userCreated.payload;
// { readonly id: ""; readonly name: "" }
```

## Decision Guide

| Need | Use |
|------|-----|
| Validate shape, keep literal types | `satisfies Type` |
| Make everything readonly + literal | `as const` |
| Validate shape + readonly + literal | `as const satisfies Type` |
| Widen to match interface exactly | `: Type` annotation |
| Cast to a type (unsafe) | `as Type` |
