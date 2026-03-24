# Testing

## Decision Matrix

| Tool | Purpose | Speed | Next.js integration |
|---|---|---|---|
| Vitest | Unit + component tests | Fast (Vite-based) | Good — needs config for RSC |
| Jest | Unit + component tests | Slower (Babel/SWC) | Official support, more complex config |
| React Testing Library | Component rendering assertions | N/A (uses Vitest/Jest) | Works with client components |
| MSW | API/fetch mocking | N/A | Works in both Vitest and Playwright |
| Playwright | E2E browser tests | Slowest | Official Next.js support |
| Cypress | E2E browser tests | Slow | Works but heavier setup |

Use Vitest for unit/component tests. Use Playwright for E2E. Skip Jest unless you have an existing Jest codebase.

## Vitest Setup

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom
```

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./") },
  },
});
```

```ts
// vitest.setup.ts
import "@testing-library/jest-dom";

// Mock next/navigation — used by many Next.js hooks
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
  redirect: vi.fn(),
}));

// Mock next/cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));
```

## Testing Client Components

```tsx
// components/Counter.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Counter } from "./Counter";

describe("Counter", () => {
  it("increments on click", async () => {
    const user = userEvent.setup();
    render(<Counter initialCount={0} />);

    await user.click(screen.getByRole("button", { name: /increment/i }));

    expect(screen.getByText("1")).toBeInTheDocument();
  });
});
```

## Testing Server Components

Server Components are async functions — call them directly and assert on the returned JSX.

```tsx
// app/products/ProductList.test.tsx
import { render, screen } from "@testing-library/react";
import ProductList from "./ProductList";

// Mock the DB module so tests don't hit a real database
vi.mock("@/lib/db", () => ({
  db: {
    product: {
      findMany: vi.fn().mockResolvedValue([
        { id: "1", name: "Widget", price: "9.99" },
      ]),
    },
  },
}));

it("renders products from the database", async () => {
  // Server Component is async — await it, then render the resolved JSX
  const jsx = await ProductList({});
  render(jsx);

  expect(screen.getByText("Widget")).toBeInTheDocument();
});
```

## Testing Server Actions

Call server actions directly — they are plain async functions when tested outside of Next.js runtime.

```ts
// app/products/actions.test.ts
import { createProduct } from "./actions";
import { db } from "@/lib/db";

vi.mock("@/lib/db", () => ({ db: { product: { create: vi.fn() } } }));
vi.mock("next/cache");

describe("createProduct", () => {
  it("creates a product and revalidates", async () => {
    const fd = new FormData();
    fd.set("name", "Widget");
    fd.set("price", "9.99");

    await createProduct(fd);

    expect(db.product.create).toHaveBeenCalledWith({
      data: { name: "Widget", price: 9.99 },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/products");
  });

  it("returns validation errors for bad input", async () => {
    const fd = new FormData();
    fd.set("name", "");
    fd.set("price", "-1");

    const result = await createProduct(fd);

    expect(result?.errors?.name).toBeDefined();
  });
});
```

## MSW for API Mocking

Mock `fetch` calls at the network level — works in both Vitest (Node) and Playwright.

```ts
// test/msw/handlers.ts
import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("https://api.example.com/products", () =>
    HttpResponse.json([{ id: "1", name: "Widget" }])
  ),
];
```

```ts
// vitest.setup.ts — add MSW server
import { setupServer } from "msw/node";
import { handlers } from "./test/msw/handlers";

const server = setupServer(...handlers);
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## Playwright — E2E Setup

```bash
npm install -D @playwright/test
npx playwright install
```

```ts
// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
  use: { baseURL: "http://localhost:3000" },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
});
```

```ts
// e2e/auth.spec.ts — testing an auth flow
import { test, expect } from "@playwright/test";

test("redirects unauthenticated users to login", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL("/login");
});

test("allows authenticated users to access dashboard", async ({ page }) => {
  // Use storageState for pre-authenticated sessions in CI
  await page.goto("/login");
  await page.fill('[name="email"]', "test@example.com");
  await page.fill('[name="password"]', "password");
  await page.click('[type="submit"]');

  await expect(page).toHaveURL("/dashboard");
  await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible();
});
```

Page object pattern for complex flows:

```ts
// e2e/pages/LoginPage.ts
import { Page } from "@playwright/test";

export class LoginPage {
  constructor(private page: Page) {}

  async goto() { await this.page.goto("/login"); }
  async login(email: string, password: string) {
    await this.page.fill('[name="email"]', email);
    await this.page.fill('[name="password"]', password);
    await this.page.click('[type="submit"]');
  }
}
```

## Cross-References

- [Server Actions](../core/server-actions.md) — action signatures to test against
- [react-reference Testing](../../react-reference/libraries/testing.md) — React Testing Library patterns, component test structure
