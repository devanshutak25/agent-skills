# Vite Configuration

## Config File

- Auto-resolves: `vite.config.ts`, `vite.config.js`, `vite.config.mjs`, `vite.config.cjs`, `vite.config.mts`, `vite.config.cts`
- TypeScript natively supported — no pre-compilation needed

```ts
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  // config options
})
```

### Conditional Config

```ts
export default defineConfig(({ command, mode, isSsrBuild, isPreview }) => {
  if (command === 'serve') {
    return { /* dev-specific config */ }
  }
  return { /* build-specific config */ }
})
```

### Async Config

```ts
export default defineConfig(async ({ command, mode }) => {
  const data = await asyncFunction()
  return { /* config using data */ }
})
```

## Shared Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `root` | `string` | `process.cwd()` | Project root directory |
| `base` | `string` | `'/'` | Public base path |
| `mode` | `string` | `'development'` / `'production'` | Override mode |
| `define` | `Record<string, string>` | — | Global constant replacements (string replaced at build) |
| `plugins` | `(Plugin \| Plugin[])[]` | — | Array of plugins |
| `publicDir` | `string \| false` | `'public'` | Static assets directory |
| `cacheDir` | `string` | `'node_modules/.vite'` | Cache directory |
| `resolve.alias` | `Record<string, string> \| Array` | — | Path aliases |
| `resolve.dedupe` | `string[]` | — | Force deduplicated copies |
| `resolve.conditions` | `string[]` | — | Additional package.json conditions |
| `resolve.mainFields` | `string[]` | `['browser', 'module', 'jsnext:main', 'jsnext']` | Package entry fields |
| `resolve.extensions` | `string[]` | `['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json']` | Auto-resolved extensions |
| `logLevel` | `'info' \| 'warn' \| 'error' \| 'silent'` | `'info'` | Console output level |
| `appType` | `'spa' \| 'mpa' \| 'custom'` | `'spa'` | Application type |

## CSS Options

```ts
export default defineConfig({
  css: {
    // PostCSS config (inline or auto-loaded from postcss.config.js)
    postcss: {},

    // CSS Modules behavior
    modules: {
      localsConvention: 'camelCaseOnly',
      scopeBehaviour: 'local',
      generateScopedName: '[name]__[local]___[hash:base64:5]',
    },

    // Preprocessor options
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles/variables" as *;`,
        api: 'modern-compiler', // Use modern Sass API (recommended)
      },
      less: {
        math: 'always',
      },
    },

    // CSS code splitting — generates separate CSS files per async chunk
    // Set to false to inline all CSS into JS
    // Default: true
    codeSplit: true,

    // Lightning CSS (alternative to PostCSS)
    lightningcss: {
      targets: { chrome: 100 },
    },

    // Transformer: 'postcss' (default) or 'lightningcss'
    transformer: 'postcss',

    // Dev source maps
    devSourcemap: false,
  },
})
```

## JSON Options

```ts
export default defineConfig({
  json: {
    namedExports: true,    // Allow named imports from .json
    stringify: false,       // Stringify JSON (smaller bundle, no named imports)
  },
})
```

## Esbuild Options

```ts
export default defineConfig({
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
    jsxInject: `import React from 'react'`,
    target: 'esnext',
    drop: ['console', 'debugger'], // Remove in production
    legalComments: 'none',
    // Set to false to disable esbuild transforms entirely
  },
})
```

## Worker Options

```ts
export default defineConfig({
  worker: {
    format: 'es',                    // 'es' | 'iife'
    plugins: () => [/* plugins */],  // Plugins for worker bundles
    rollupOptions: {},               // Rollup options for worker bundles
  },
})
```

## Environment API Config (Experimental)

```ts
export default defineConfig({
  environments: {
    // Client environment (default)
    client: {
      build: {
        outDir: 'dist/client',
      },
    },
    // SSR environment
    ssr: {
      build: {
        outDir: 'dist/server',
      },
      resolve: {
        conditions: ['node'],
        noExternal: true,
      },
    },
    // Custom environments
    workerd: {
      resolve: {
        conditions: ['workerd', 'worker'],
        noExternal: true,
      },
      dev: {
        createEnvironment: createWorkerdDevEnvironment,
      },
      build: {
        createEnvironment: createWorkerdBuildEnvironment,
      },
    },
  },
})
```

## Config IntelliSense

```ts
// JSDoc type hint (no import needed)
/** @type {import('vite').UserConfig} */
const config = { /* ... */ }

// Or use defineConfig for type safety + autocomplete
import { defineConfig } from 'vite'
export default defineConfig({ /* ... */ })
```

## Config File Resolution

1. CLI `--config` flag
2. Auto-resolve in project root: `vite.config.{ts,js,mjs,cjs,mts,cts}`
3. Config file is processed through esbuild before execution

## Common Patterns

### Path Aliases

```ts
import { resolve } from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '~': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
    },
  },
})
```

### Using `__dirname` in ESM

```ts
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
```

### Multi-Environment Config

```ts
// vite.config.ts — merging environment-specific config
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV),
    },
  }
})
```
