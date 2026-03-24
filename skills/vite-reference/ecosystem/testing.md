# Testing

## Vitest

Vite-native test runner. Shares Vite config, transforms, and plugins.

### Setup

```bash
npm i -D vitest
```

```ts
// vite.config.ts — combined config
/// <reference types="vitest/config" />
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    globals: true,                    // Use global test APIs (describe, it, expect)
    environment: 'jsdom',             // 'node' | 'jsdom' | 'happy-dom' | 'browser'
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist'],
    setupFiles: ['./src/test/setup.ts'],
    css: true,                        // Process CSS imports
  },
})
```

```ts
// Or separate vitest.config.ts (takes priority over vite.config.ts)
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: { /* ... */ },
})
```

### Core APIs

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('MyComponent', () => {
  beforeEach(() => { /* setup */ })
  afterEach(() => { vi.restoreAllMocks() })

  it('renders correctly', () => {
    expect(1 + 1).toBe(2)
  })

  it('handles async', async () => {
    const result = await fetchData()
    expect(result).toMatchSnapshot()
  })
})
```

### Mocking

```ts
// Auto-mock module
vi.mock('./api')

// Manual mock
vi.mock('./api', () => ({
  fetchUser: vi.fn().mockResolvedValue({ name: 'Test' }),
}))

// Spy on function
const spy = vi.spyOn(object, 'method')
expect(spy).toHaveBeenCalledWith('arg')

// Timer mocking
vi.useFakeTimers()
vi.advanceTimersByTime(1000)
vi.useRealTimers()

// Environment variables
vi.stubEnv('VITE_API_URL', 'http://test.com')
```

### Projects (replaces deprecated workspace)

```ts
// vitest.config.ts
export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          environment: 'node',
          include: ['src/**/*.test.ts'],
        },
      },
      {
        test: {
          name: 'components',
          environment: 'jsdom',
          include: ['src/**/*.spec.tsx'],
        },
      },
      {
        test: {
          name: 'browser',
          browser: {
            enabled: true,
            provider: 'playwright',
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
})
```

### Coverage

```ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',                 // 'v8' (default) | 'istanbul'
      include: ['src/**'],
      exclude: ['**/*.test.ts', '**/*.spec.ts', 'src/test/**'],
      thresholds: {
        lines: 80,
        branches: 80,
        functions: 80,
        statements: 80,
      },
      reporter: ['text', 'html', 'lcov'],
    },
  },
})
```

```bash
vitest --coverage
```

### Browser Mode (Vitest 4+)

```bash
npm i -D @vitest/browser vitest-browser-playwright playwright
```

```ts
export default defineConfig({
  test: {
    browser: {
      enabled: true,
      provider: 'playwright',        // 'playwright' | 'webdriverio' | 'preview'
      instances: [
        { browser: 'chromium' },
        { browser: 'firefox' },
      ],
    },
  },
})
```

### CLI Commands

```bash
vitest                    # Watch mode
vitest run                # Single run
vitest run --coverage     # With coverage
vitest related src/App.tsx  # Test files related to changed file
vitest --reporter=verbose
vitest --ui               # UI mode (needs @vitest/ui)
```

## Component Testing

### React Testing Library

```bash
npm i -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

```ts
// setup.ts
import '@testing-library/jest-dom/vitest'

// Button.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

describe('Button', () => {
  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Click me</Button>)

    await user.click(screen.getByRole('button', { name: /click me/i }))
    expect(onClick).toHaveBeenCalledOnce()
  })
})
```

### Vue Testing

```bash
npm i -D @vue/test-utils
```

```ts
import { mount } from '@vue/test-utils'
import MyComponent from './MyComponent.vue'

test('renders message', () => {
  const wrapper = mount(MyComponent, {
    props: { msg: 'Hello' },
  })
  expect(wrapper.text()).toContain('Hello')
})
```

## E2E Testing

### Playwright

```bash
npm init playwright@latest
```

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: 'http://localhost:5173',
  },
})
```

```ts
// e2e/home.spec.ts
import { test, expect } from '@playwright/test'

test('home page loads', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading')).toContainText('Welcome')
})
```

### Cypress

```bash
npm i -D cypress
```

```ts
// cypress.config.ts
import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    supportFile: 'cypress/support/e2e.ts',
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
})
```

## MSW (Mock Service Worker)

```bash
npm i -D msw
```

```ts
// src/mocks/handlers.ts
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/api/users', () => {
    return HttpResponse.json([
      { id: 1, name: 'John' },
    ])
  }),
]

// src/mocks/server.ts (for tests)
import { setupServer } from 'msw/node'
import { handlers } from './handlers'
export const server = setupServer(...handlers)

// setup.ts
import { server } from './mocks/server'
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

## Decision Table

| Need | Tool |
|------|------|
| Unit tests | Vitest |
| Component tests (DOM) | Vitest + Testing Library |
| Component tests (real browser) | Vitest Browser Mode |
| E2E tests | Playwright (recommended) or Cypress |
| API mocking (tests) | MSW |
| API mocking (dev) | MSW + browser handler or vite-plugin-mock-server |
| Visual regression | Vitest Browser Mode (built-in) or Playwright |
| Coverage | Vitest `--coverage` (v8 or istanbul) |
| Watch mode | `vitest` (default) |
| CI | `vitest run` + Playwright |

## Vitest Version Info
- Vitest: 4.x (4.0.18 current)
- Compatible with Vite 7
- Last updated: 2026-03
