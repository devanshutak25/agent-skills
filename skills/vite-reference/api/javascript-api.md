# JavaScript API

All APIs are typed. Use `import type` for type-only imports.

## `createServer`

Create a Vite dev server programmatically.

```ts
import { createServer, type InlineConfig } from 'vite'

const server = await createServer({
  // InlineConfig — UserConfig + configFile
  configFile: false,           // false to skip auto-loading
  root: __dirname,
  server: {
    port: 3000,
  },
})

await server.listen()
server.printUrls()
server.bindCLIShortcuts({ print: true })
```

### ViteDevServer

```ts
interface ViteDevServer {
  config: ResolvedConfig
  middlewares: Connect.Server        // Connect-compatible middleware stack
  httpServer: http.Server | null
  watcher: FSWatcher                 // Chokidar file watcher
  pluginContainer: PluginContainer
  moduleGraph: ModuleGraph           // Module dependency graph
  resolvedUrls: ResolvedServerUrls | null

  // Methods
  listen(port?: number, isRestart?: boolean): Promise<ViteDevServer>
  close(): Promise<void>
  restart(forceOptimize?: boolean): Promise<void>
  printUrls(): void
  bindCLIShortcuts(options?: BindCLIShortcutsOptions): void

  // SSR
  ssrLoadModule(url: string, opts?: { fixStacktrace?: boolean }): Promise<Record<string, any>>
  ssrFixStacktrace(e: Error): void

  // Transform
  transformRequest(url: string, options?: TransformOptions): Promise<TransformResult | null>
  transformIndexHtml(url: string, html: string, originalUrl?: string): Promise<string>
  warmupRequest(url: string, options?: TransformOptions): Promise<void>

  // Module graph
  reloadModule(module: ModuleNode): Promise<void>

  // HMR
  hot: HotChannel                    // Send/receive HMR events
}
```

### Usage: Middleware Mode

```ts
import express from 'express'
import { createServer } from 'vite'

const app = express()
const vite = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
})

app.use(vite.middlewares)
app.use('*', async (req, res) => {
  // Custom request handling
})
```

## `build`

Run a production build programmatically.

```ts
import { build } from 'vite'

const output = await build({
  root: __dirname,
  build: {
    outDir: 'dist',
    rollupOptions: {},
  },
})
// Returns RollupOutput | RollupOutput[] | RollupWatcher
```

### Watch Mode

```ts
const watcher = await build({
  build: {
    watch: {},   // Enable watch mode — returns RollupWatcher
  },
})

watcher.on('event', (event) => {
  if (event.code === 'BUNDLE_END') {
    console.log('Build completed')
  }
})

// Stop watching
await watcher.close()
```

## `preview`

Start a static file server for previewing production builds.

```ts
import { preview } from 'vite'

const previewServer = await preview({
  preview: {
    port: 4173,
    open: true,
  },
})

previewServer.printUrls()
previewServer.bindCLIShortcuts({ print: true })
```

### PreviewServer

```ts
interface PreviewServer {
  config: ResolvedConfig
  middlewares: Connect.Server
  httpServer: http.Server
  resolvedUrls: ResolvedServerUrls | null
  printUrls(): void
  bindCLIShortcuts(options?: BindCLIShortcutsOptions): void
}
```

## `resolveConfig`

Resolve and merge Vite config (mimics what Vite does internally).

```ts
import { resolveConfig } from 'vite'

const resolved = await resolveConfig(
  { root: __dirname },     // InlineConfig
  'build',                  // 'build' | 'serve'
  'production',             // mode (optional)
  'production',             // defaultMode (optional)
  false,                    // isPreview (optional)
)

console.log(resolved.root)
console.log(resolved.build.outDir)
console.log(resolved.plugins.map(p => p.name))
```

## `mergeConfig`

Deep-merge two Vite configs.

```ts
import { mergeConfig } from 'vite'

const base = { plugins: [pluginA()], build: { outDir: 'dist' } }
const override = { plugins: [pluginB()], build: { sourcemap: true } }

const merged = mergeConfig(base, override)
// Result: { plugins: [pluginA(), pluginB()], build: { outDir: 'dist', sourcemap: true } }
```

- Arrays (like `plugins`) are concatenated, not replaced
- Objects are deep-merged
- Primitives in `override` win

## `loadEnv`

Load `.env` files for a given mode.

```ts
import { loadEnv } from 'vite'

// Load all VITE_-prefixed vars
const env = loadEnv('production', process.cwd())

// Load all vars (including non-VITE_)
const allEnv = loadEnv('production', process.cwd(), '')

// Load with custom prefix
const publicEnv = loadEnv('production', '/path/to/project', ['VITE_', 'PUBLIC_'])
```

### Signature

```ts
function loadEnv(
  mode: string,
  envDir: string,
  prefixes?: string | string[]  // Default: 'VITE_'
): Record<string, string>
```

## `transformWithEsbuild`

Transform code using esbuild (same as Vite's internal transform).

```ts
import { transformWithEsbuild } from 'vite'

const result = await transformWithEsbuild(
  'const x: number = 1',
  'file.ts',
  {
    loader: 'ts',
    target: 'es2020',
    sourcemap: true,
  },
)

console.log(result.code)  // JavaScript output
console.log(result.map)   // Source map
```

## `normalizePath`

Normalize file paths to use forward slashes (cross-platform).

```ts
import { normalizePath } from 'vite'

normalizePath('src\\components\\App.tsx')
// → 'src/components/App.tsx'
```

## `searchForWorkspaceRoot`

Find the workspace root (monorepo root, git root, etc.).

```ts
import { searchForWorkspaceRoot } from 'vite'

const root = searchForWorkspaceRoot(process.cwd())
```

Searches upward for:
1. `pnpm-workspace.yaml`
2. `package.json` with `workspaces` field
3. `.git` directory

## `createFilter`

Create an include/exclude filter function (from `@rollup/pluginutils`).

```ts
import { createFilter } from 'vite'

const filter = createFilter(
  ['**/*.ts', '**/*.tsx'],      // include patterns
  ['**/node_modules/**'],        // exclude patterns
)

if (filter(filePath)) {
  // Process this file
}
```

## Type Exports

```ts
import type {
  // Config
  UserConfig,
  InlineConfig,
  ResolvedConfig,
  ConfigEnv,

  // Server
  ViteDevServer,
  PreviewServer,
  ServerOptions,
  PreviewOptions,

  // Build
  BuildOptions,
  LibraryOptions,

  // Plugin
  Plugin,
  PluginOption,
  HookHandler,

  // Module Graph
  ModuleGraph,
  ModuleNode,

  // HMR
  HmrOptions,
  HmrContext,
  HotUpdateContext,

  // Transform
  TransformOptions,
  TransformResult,

  // Environment API
  DevEnvironment,
  BuildEnvironment,
  EnvironmentOptions,

  // Utility
  FilterPattern,
  Logger,
  LogLevel,
  ResolvedServerUrls,
} from 'vite'
```

## Common Programmatic Patterns

### Custom Build Script

```ts
// scripts/build.ts
import { build, loadEnv } from 'vite'

async function run() {
  const env = loadEnv('production', process.cwd(), '')

  await build({
    root: process.cwd(),
    build: {
      outDir: `dist/${env.DEPLOY_TARGET}`,
      sourcemap: env.DEPLOY_TARGET !== 'production',
    },
  })
}

run()
```

### Multi-Build (Client + SSR)

```ts
import { build } from 'vite'

async function buildAll() {
  // Build client
  await build({
    build: {
      outDir: 'dist/client',
      manifest: true,
      ssrManifest: true,
    },
  })

  // Build server
  await build({
    build: {
      outDir: 'dist/server',
      ssr: 'src/entry-server.tsx',
    },
  })
}

buildAll()
```

### Dev Server with Custom Middleware

```ts
import { createServer } from 'vite'

const server = await createServer({
  plugins: [{
    name: 'custom-middleware',
    configureServer(server) {
      server.middlewares.use('/api/health', (req, res) => {
        res.end(JSON.stringify({ ok: true }))
      })
    },
  }],
})

await server.listen()
```
