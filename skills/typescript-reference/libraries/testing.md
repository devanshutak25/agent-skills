# Testing

Type-safe testing with Vitest and Jest.

## Vitest (Recommended)

### Setup
```bash
npm i -D vitest @vitest/coverage-v8
```

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node", // or "jsdom", "happy-dom"
    coverage: { provider: "v8", reporter: ["text", "json", "html"] },
    typecheck: { enabled: true }, // Run type tests
  },
});
```

### Basic Testing
```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

describe("UserService", () => {
  let service: UserService;

  beforeEach(() => {
    service = new UserService(mockDb);
  });

  it("creates a user", async () => {
    const user = await service.create({ name: "Alice", email: "a@b.com" });
    expect(user).toMatchObject({ name: "Alice", email: "a@b.com" });
    expect(user.id).toBeDefined();
  });
});
```

### Typed Mocks
```typescript
import { vi, type Mock } from "vitest";

// Mock module
vi.mock("./db", () => ({
  getUser: vi.fn(),
}));

import { getUser } from "./db";
const mockGetUser = getUser as Mock; // Typed mock

mockGetUser.mockResolvedValue({ id: "1", name: "Alice" });

// Typed spy
const spy = vi.spyOn(service, "create");
spy.mockResolvedValueOnce({ id: "1", name: "Alice", email: "a@b.com" });

// vi.fn with type
const handler = vi.fn<[Request], Response>();
```

### Type Testing (expectTypeOf)
```typescript
import { expectTypeOf, test } from "vitest";

test("type inference", () => {
  expectTypeOf<string>().toBeString();
  expectTypeOf<{ name: string }>().toMatchTypeOf<{ name: string }>();

  // Function types
  expectTypeOf(createUser).parameter(0).toEqualTypeOf<CreateUserInput>();
  expectTypeOf(createUser).returns.resolves.toEqualTypeOf<User>();

  // Assert not assignable
  expectTypeOf<string>().not.toEqualTypeOf<number>();
});
```

### @ts-expect-error in Tests
```typescript
test("rejects invalid input", () => {
  // @ts-expect-error — testing runtime validation
  expect(() => createUser({ name: 123 })).toThrow();

  // @ts-expect-error — should not accept wrong type
  const _: User = { invalid: true };
});
```

## Jest

### Setup with TypeScript
```bash
npm i -D jest ts-jest @types/jest
# OR with SWC (faster):
npm i -D jest @swc/jest
```

```javascript
// jest.config.js
module.exports = {
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: "tsconfig.test.json" }],
    // OR with SWC:
    // "^.+\\.tsx?$": ["@swc/jest"],
  },
};
```

### Typed Mocks in Jest
```typescript
import { jest } from "@jest/globals";

const mockFetch = jest.fn<typeof fetch>();
mockFetch.mockResolvedValue(new Response(JSON.stringify({ ok: true })));

// Mock module
jest.mock("./db");
import { getUser } from "./db";
const mockedGetUser = jest.mocked(getUser); // Fully typed
mockedGetUser.mockResolvedValue({ id: "1", name: "Alice" });
```

## Comparison

| Feature | Vitest | Jest |
|---------|--------|------|
| Speed | Fast (Vite-based, ESM) | Moderate |
| Config | Near-zero (reuses vite.config) | Separate config |
| Type testing | Built-in `expectTypeOf` | External (`tsd`, `expect-type`) |
| ESM support | Native | Requires config |
| Watch mode | Fast HMR-based | File-based |
| Compatibility | Jest-compatible API | Industry standard |
| Recommendation | **New projects** | Existing Jest setups |
