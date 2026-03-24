# Environment Variables & Modes

## .env Files

Vite loads env files from `envDir` (default: project root).

### Loading Priority (later overrides earlier)

| File | Loaded When |
|------|------------|
| `.env` | Always |
| `.env.local` | Always, gitignored |
| `.env.[mode]` | Only in specified mode |
| `.env.[mode].local` | Only in specified mode, gitignored |

### Modes

| Command | Default Mode |
|---------|-------------|
| `vite` / `vite dev` / `vite serve` | `development` |
| `vite build` | `production` |
| `vite preview` | `production` |

Override with `--mode`:
```bash
vite build --mode staging
# Loads: .env, .env.local, .env.staging, .env.staging.local
```

## VITE_ Prefix

Only variables prefixed with `VITE_` are exposed to client code.

```bash
# .env
VITE_APP_TITLE=My App
VITE_API_URL=https://api.example.com
DB_PASSWORD=secret              # NOT exposed to client (no VITE_ prefix)
```

```ts
// Client code
console.log(import.meta.env.VITE_APP_TITLE)   // "My App"
console.log(import.meta.env.VITE_API_URL)      // "https://api.example.com"
console.log(import.meta.env.DB_PASSWORD)        // undefined
```

### Change Prefix

```ts
export default defineConfig({
  envPrefix: ['VITE_', 'PUBLIC_'],  // Expose VITE_* and PUBLIC_*
})
```

## Built-in Variables

| Variable | Type | Description |
|----------|------|-------------|
| `import.meta.env.MODE` | `string` | Current mode (`'development'`, `'production'`, etc.) |
| `import.meta.env.BASE_URL` | `string` | Base URL from `base` config |
| `import.meta.env.PROD` | `boolean` | `true` in production |
| `import.meta.env.DEV` | `boolean` | `true` in development |
| `import.meta.env.SSR` | `boolean` | `true` when running in SSR |

## TypeScript Support

```ts
// src/env.d.ts (or vite-env.d.ts)
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_API_URL: string
  readonly VITE_FEATURE_FLAG: string
  // Add more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

## Custom Modes

```bash
# .env.staging
VITE_APP_TITLE=My App (Staging)
VITE_API_URL=https://staging-api.example.com
NODE_ENV=production           # Can override NODE_ENV separately from mode
```

```bash
# Build with staging mode but production NODE_ENV
vite build --mode staging
```

### Conditional Config by Mode

```ts
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    },
    server: {
      proxy: mode === 'development' ? {
        '/api': env.VITE_API_URL,
      } : undefined,
    },
  }
})
```

## `loadEnv` Helper

```ts
import { loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  // Load env file for the current mode
  // Third arg: prefix filter ('' = load all, 'VITE_' = only VITE_ vars)
  const env = loadEnv(mode, process.cwd(), '')

  return {
    define: {
      'process.env.API_URL': JSON.stringify(env.API_URL),
    },
  }
})
```

### `loadEnv` Signature

```ts
function loadEnv(
  mode: string,
  envDir: string,
  prefixes?: string | string[]  // Default: 'VITE_'
): Record<string, string>
```

## HTML Env Replacement

Env variables are replaced in HTML files:

```html
<title>%VITE_APP_TITLE%</title>
<link rel="icon" href="%BASE_URL%favicon.ico" />
```

Only `VITE_`-prefixed vars and built-in vars are replaced.

## Env Directory

```ts
export default defineConfig({
  envDir: './config/env',  // Look for .env files here instead of root
})
```

## Security Notes

- **Never** put secrets in `VITE_` variables — they are embedded in client bundle
- Use `VITE_` only for values safe to be public
- Server-side secrets should use regular env vars (no prefix) + server-side code
- `.env.local` and `.env.*.local` should be in `.gitignore`

## Common Patterns

### Feature Flags

```bash
# .env.development
VITE_FEATURE_NEW_UI=true

# .env.production
VITE_FEATURE_NEW_UI=false
```

```ts
if (import.meta.env.VITE_FEATURE_NEW_UI === 'true') {
  // All env values are strings
  enableNewUI()
}
```

### API Base URL per Environment

```bash
# .env.development
VITE_API_BASE=http://localhost:3001

# .env.staging
VITE_API_BASE=https://staging-api.example.com

# .env.production
VITE_API_BASE=https://api.example.com
```

```ts
const api = createClient({ baseURL: import.meta.env.VITE_API_BASE })
```
