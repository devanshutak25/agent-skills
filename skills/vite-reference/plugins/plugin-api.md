# Plugin API

Vite plugins extend Rollup's plugin interface with additional Vite-specific hooks.

## Plugin Structure

```ts
import type { Plugin } from 'vite'

export default function myPlugin(options?: MyPluginOptions): Plugin {
  return {
    name: 'my-plugin',

    // Vite-specific: run before/after core plugins
    enforce: 'pre', // 'pre' | 'post' (default: normal)

    // Vite-specific: apply only in serve or build
    apply: 'serve', // 'serve' | 'build' | ((config, env) => boolean)

    // --- Vite-Specific Hooks ---

    config(config, env) {
      // Modify config before resolved — return partial config to merge
      return { resolve: { alias: { /* ... */ } } }
    },

    configResolved(resolvedConfig) {
      // Read final resolved config (do not mutate)
    },

    configureServer(server) {
      // Add custom middleware to dev server
      server.middlewares.use((req, res, next) => { next() })
      // Return function for post-middleware (after Vite's internals)
      return () => {
        server.middlewares.use((req, res, next) => { next() })
      }
    },

    configurePreviewServer(server) {
      // Same as configureServer but for preview
    },

    transformIndexHtml(html, ctx) {
      // Transform index.html — return string or tag descriptor array
      return html.replace('<!--app-->', '<div id="app"></div>')
      // Or return tags:
      // return {
      //   html,
      //   tags: [{ tag: 'script', attrs: { src: '/inject.js' }, injectTo: 'body' }]
      // }
    },

    handleHotUpdate({ file, server, modules, timestamp }) {
      // Custom HMR handling
      // Return empty array to prevent default HMR
      // Return module array to narrow HMR scope
    },

    // --- Universal Hooks (Rollup-compatible) ---

    options(options) {},                           // Modify Rollup options
    buildStart(options) {},                        // Build started
    resolveId(source, importer, options) {},       // Custom module resolution
    load(id) {},                                   // Custom module loading
    transform(code, id) {},                        // Transform module code
    buildEnd(error) {},                            // Build ended
    closeBundle() {},                              // Bundle closed

    // Output hooks (build only)
    outputOptions(options) {},
    renderStart(outputOptions, inputOptions) {},
    augmentChunkHash(chunkInfo) {},
    renderChunk(code, chunk, options) {},
    generateBundle(options, bundle, isWrite) {},
    writeBundle(options, bundle) {},
    closeBundle() {},
  }
}
```

## Plugin Ordering

Plugins execute in this order:

1. Alias resolution (`resolve.alias`)
2. Plugins with `enforce: 'pre'`
3. Vite core plugins
4. Plugins without `enforce` (normal)
5. Vite build plugins
6. Plugins with `enforce: 'post'`
7. Vite post-build plugins (minify, manifest, etc.)

## Virtual Modules

```ts
export default function myPlugin(): Plugin {
  const virtualModuleId = 'virtual:my-module'
  const resolvedVirtualModuleId = '\0' + virtualModuleId

  return {
    name: 'my-plugin',

    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }
    },

    load(id) {
      if (id === resolvedVirtualModuleId) {
        return `export const msg = "from virtual module"`
      }
    },
  }
}
```

Usage:
```ts
import { msg } from 'virtual:my-module'
```

TypeScript declaration:
```ts
// env.d.ts
declare module 'virtual:my-module' {
  export const msg: string
}
```

## Hook Filters (Vite 7+)

Filter which files a hook runs on — avoids unnecessary processing:

```ts
export default function myPlugin(): Plugin {
  return {
    name: 'my-plugin',

    transform: {
      // Only run on .vue files
      filter: {
        id: /\.vue$/,
      },
      handler(code, id) {
        // Transform .vue files only
      },
    },

    resolveId: {
      filter: {
        id: /^virtual:/,
      },
      handler(source) {
        // Only resolve virtual: imports
      },
    },
  }
}
```

## Per-Environment Plugins (Vite 7+)

```ts
export default defineConfig({
  // Plugins shared across all environments
  plugins: [commonPlugin()],

  environments: {
    client: {
      plugins: [clientOnlyPlugin()],
    },
    ssr: {
      plugins: [ssrOnlyPlugin()],
    },
  },
})
```

## Common Plugin Patterns

### Inject HTML Tags

```ts
transformIndexHtml(html) {
  return {
    html,
    tags: [
      {
        tag: 'script',
        attrs: { src: 'https://analytics.example.com/a.js', defer: true },
        injectTo: 'head',
      },
      {
        tag: 'meta',
        attrs: { name: 'theme-color', content: '#ffffff' },
        injectTo: 'head-prepend',
      },
    ],
  }
}
```

### Custom File Type

```ts
export default function svgPlugin(): Plugin {
  return {
    name: 'svg-loader',
    enforce: 'pre',

    async load(id) {
      if (!id.endsWith('.svg?component')) return

      const svg = await fs.readFile(id.replace('?component', ''), 'utf-8')
      return `export default \`${svg}\``
    },
  }
}
```

### Dev Server Middleware

```ts
configureServer(server) {
  // Pre-middleware (runs before Vite's built-in middleware)
  server.middlewares.use('/api/health', (req, res) => {
    res.end(JSON.stringify({ status: 'ok' }))
  })

  // Post-middleware (runs after Vite's internal middleware)
  return () => {
    server.middlewares.use((req, res, next) => {
      // Catch-all after Vite's SPA fallback
    })
  }
}
```

### Watch Additional Files

```ts
configureServer(server) {
  server.watcher.add('./data/**/*.json')
  server.watcher.on('change', (file) => {
    if (file.endsWith('.json')) {
      // Trigger HMR or full reload
      server.hot.send({ type: 'full-reload' })
    }
  })
}
```

## Plugin API Utilities

```ts
import { createFilter, normalizePath } from 'vite'

// createFilter — include/exclude file matcher
const filter = createFilter(
  ['**/*.ts', '**/*.tsx'],       // include
  ['**/node_modules/**'],        // exclude
)
if (filter(id)) { /* process */ }

// normalizePath — fix Windows paths
const p = normalizePath('src\\components\\App.tsx')
// → 'src/components/App.tsx'
```

## Decision Table

| Goal | Hook(s) |
|------|---------|
| Modify config before resolve | `config` |
| Read final config | `configResolved` |
| Add dev server middleware | `configureServer` |
| Custom module resolution | `resolveId` |
| Virtual modules | `resolveId` + `load` |
| Transform source code | `transform` |
| Modify HTML | `transformIndexHtml` |
| Custom HMR behavior | `handleHotUpdate` |
| Post-build processing | `generateBundle` / `writeBundle` |
| Dev-only plugin | `apply: 'serve'` |
| Build-only plugin | `apply: 'build'` |
| Run before core plugins | `enforce: 'pre'` |
| Run after everything | `enforce: 'post'` |
