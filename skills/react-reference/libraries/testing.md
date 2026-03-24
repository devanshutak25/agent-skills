# Testing Libraries

## Testing Pyramid for React

```
        E2E Tests (Playwright/Cypress)
       ────────────────────────────
      Integration Tests (RTL + MSW + Vitest)
     ──────────────────────────────────────
    Unit Tests (Vitest — pure functions, hooks)
```

## Decision Matrix

| Tool | Role | Speed | Best For |
|------|------|-------|----------|
| **Vitest** | Test runner | Very fast | Vite projects (replaces Jest) |
| **React Testing Library** | Component testing | Fast | User-centric component tests |
| **Playwright** | E2E / browser | Slower | Critical user flows |
| **MSW** | API mocking | — | Intercepting network requests |
| **Cypress** | E2E / component | Medium | Visual feedback, component tests |

---

## Vitest

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
  },
});
```

```ts
// src/test/setup.ts
import '@testing-library/jest-dom';
```

### Unit Test (Pure Function)
```ts
import { describe, it, expect } from 'vitest';
import { formatPrice } from './formatPrice';

describe('formatPrice', () => {
  it('formats cents to dollars', () => {
    expect(formatPrice(1999)).toBe('$19.99');
  });

  it('handles zero', () => {
    expect(formatPrice(0)).toBe('$0.00');
  });
});
```

---

## React Testing Library

### Component Test
```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('submits with valid credentials', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();

    render(<LoginForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('shows validation errors', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
  });
});
```

### Query Priority (most → least preferred)
1. `getByRole` — accessible queries (buttons, inputs, headings)
2. `getByLabelText` — form fields
3. `getByPlaceholderText` — when no label
4. `getByText` — non-interactive elements
5. `getByTestId` — last resort

### Async Queries
```tsx
// waitFor — polls until assertion passes
await waitFor(() => {
  expect(screen.getByText('Data loaded')).toBeInTheDocument();
});

// findBy — shorthand for waitFor + getBy
const heading = await screen.findByRole('heading', { name: /dashboard/i });
```

### Testing Hooks
```tsx
import { renderHook, act } from '@testing-library/react';
import { useCounter } from './useCounter';

it('increments', () => {
  const { result } = renderHook(() => useCounter());

  act(() => result.current.increment());

  expect(result.current.count).toBe(1);
});
```

---

## MSW (Mock Service Worker)

```bash
npm install -D msw
```

### Setup for Tests
```ts
// src/test/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/posts', () => {
    return HttpResponse.json([
      { id: '1', title: 'First Post' },
      { id: '2', title: 'Second Post' },
    ]);
  }),

  http.post('/api/posts', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: '3', ...body }, { status: 201 });
  }),

  http.get('/api/posts/:id', ({ params }) => {
    return HttpResponse.json({ id: params.id, title: 'Mock Post' });
  }),
];

// src/test/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';
export const server = setupServer(...handlers);

// src/test/setup.ts
import { server } from './mocks/server';
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Override in Specific Test
```tsx
import { server } from '../test/mocks/server';
import { http, HttpResponse } from 'msw';

it('shows error on API failure', async () => {
  server.use(
    http.get('/api/posts', () => {
      return new HttpResponse(null, { status: 500 });
    })
  );

  render(<PostList />);
  expect(await screen.findByText(/error/i)).toBeInTheDocument();
});
```

---

## Playwright (E2E)

```bash
npm install -D @playwright/test
npx playwright install
```

```ts
// e2e/login.spec.ts
import { test, expect } from '@playwright/test';

test('user can log in', async ({ page }) => {
  await page.goto('/login');

  await page.getByLabel('Email').fill('user@example.com');
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: 'Sign In' }).click();

  await expect(page).toHaveURL('/dashboard');
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});

test('shows error on invalid credentials', async ({ page }) => {
  await page.goto('/login');

  await page.getByLabel('Email').fill('wrong@example.com');
  await page.getByLabel('Password').fill('wrong');
  await page.getByRole('button', { name: 'Sign In' }).click();

  await expect(page.getByText('Invalid credentials')).toBeVisible();
});
```

### Config
```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
});
```

---

## Recommended Stack

```
Vitest + React Testing Library + MSW + Playwright
```

- **Vitest**: test runner (fast, Vite-native, Jest-compatible API)
- **RTL**: component tests (user-centric)
- **MSW**: mock APIs (works in tests AND browser dev)
- **Playwright**: 3-5 critical E2E flows in CI
