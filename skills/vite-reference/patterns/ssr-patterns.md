# SSR Patterns

## Project Structure

```
├── index.html                  # App shell
├── src/
│   ├── main.ts                 # Universal app code
│   ├── entry-client.ts         # Client entry — mounts app
│   ├── entry-server.ts         # Server entry — renders to string/stream
│   └── App.tsx
├── server.js                   # Express/Node server
└── vite.config.ts
```

## Entry Files

### Client Entry

```ts
// src/entry-client.ts
import { hydrateRoot } from 'react-dom/client'
import { App } from './App'

hydrateRoot(document.getElementById('app')!, <App />)
```

### Server Entry

```ts
// src/entry-server.ts
import { renderToString } from 'react-dom/server'
import { App } from './App'

export function render(url: string) {
  const html = renderToString(<App />)
  return { html }
}
```

## Development Server (Middleware Mode)

```ts
// server.js
import express from 'express'
import { createServer as createViteServer } from 'vite'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

async function createServer() {
  const app = express()

  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom',
  })

  // Use Vite's connect middleware
  app.use(vite.middlewares)

  app.use('*', async (req, res, next) => {
    const url = req.originalUrl

    try {
      // 1. Read index.html
      let template = readFileSync(resolve('index.html'), 'utf-8')

      // 2. Apply Vite HTML transforms (injects HMR client, etc.)
      template = await vite.transformIndexHtml(url, template)

      // 3. Load server entry (with HMR support)
      const { render } = await vite.ssrLoadModule('/src/entry-server.ts')

      // 4. Render app HTML
      const { html: appHtml } = render(url)

      // 5. Inject into template
      const html = template.replace('<!--ssr-outlet-->', appHtml)

      res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
    } catch (e) {
      vite.ssrFixStacktrace(e as Error)
      next(e)
    }
  })

  app.listen(5173)
}

createServer()
```

### index.html Template

```html
<!doctype html>
<html>
  <head><!--head--></head>
  <body>
    <div id="app"><!--ssr-outlet--></div>
    <script type="module" src="/src/entry-client.ts"></script>
  </body>
</html>
```

## Streaming SSR

```ts
// src/entry-server.ts
import { renderToPipeableStream } from 'react-dom/server'
import { App } from './App'

export function render(url: string, res: ServerResponse) {
  const { pipe, abort } = renderToPipeableStream(<App />, {
    onShellReady() {
      res.statusCode = 200
      res.setHeader('Content-Type', 'text/html')
      pipe(res)
    },
    onShellError(error) {
      res.statusCode = 500
      res.end('Server Error')
    },
    onError(error) {
      console.error(error)
    },
  })

  setTimeout(abort, 10000) // Abort after 10s
}
```

## Production Build

```bash
# Build client
vite build --outDir dist/client

# Build server
vite build --outDir dist/server --ssr src/entry-server.ts
```

### Production Server

```ts
// server.js (production)
import express from 'express'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const app = express()
const isProduction = process.env.NODE_ENV === 'production'

// Serve client assets
app.use('/assets', express.static(resolve('dist/client/assets')))

app.use('*', async (req, res) => {
  const template = readFileSync(resolve('dist/client/index.html'), 'utf-8')
  const { render } = await import('./dist/server/entry-server.js')
  const { html: appHtml } = render(req.originalUrl)
  const html = template.replace('<!--ssr-outlet-->', appHtml)
  res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
})

app.listen(3000)
```

## SSR Configuration

```ts
export default defineConfig({
  ssr: {
    // Externalize node_modules in SSR (default behavior)
    // These are not bundled — loaded via Node's module system
    external: ['fsevents'],

    // Force bundle these deps in SSR (not externalized)
    // Use for ESM-only packages that can't be require()'d
    noExternal: [
      'my-esm-only-dep',
      /^@my-org\//,           // Regex patterns supported
    ],

    // Build target
    target: 'node',            // 'node' | 'webworker'

    // SSR-specific dependency optimization
    optimizeDeps: {
      include: [],
      exclude: [],
    },
  },
})
```

### ssr.external vs ssr.noExternal

| Scenario | Setting |
|----------|---------|
| Standard npm package (CJS/ESM) | Default: externalized |
| ESM-only package | `noExternal: ['pkg']` |
| Package imports CSS/assets | `noExternal: ['pkg']` |
| Linked/workspace package | `noExternal: ['pkg']` |
| Heavy node-native package | `external: ['pkg']` (ensure externalized) |
| Monorepo package | `noExternal: [/^@my-org\//]` |

## Environment API SSR (Vite 7+)

```ts
export default defineConfig({
  environments: {
    client: {
      build: {
        outDir: 'dist/client',
        manifest: true,
      },
    },
    ssr: {
      build: {
        outDir: 'dist/server',
        ssr: true,
      },
      resolve: {
        conditions: ['node'],
        noExternal: true,
      },
    },
  },
})
```

## Vue SSR

```ts
// entry-server.ts (Vue)
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { App } from './App.vue'

export async function render(url: string) {
  const app = createSSRApp(App)
  const html = await renderToString(app)
  return { html }
}
```

## SSR Troubleshooting

| Issue | Fix |
|-------|-----|
| "require is not defined" for dependency | Add to `ssr.noExternal` |
| CSS/asset import fails in SSR | Add package to `ssr.noExternal` |
| "__dirname is not defined" in ESM | Use `import.meta.url` + `fileURLToPath` |
| Stack trace points to bundled code | Use `vite.ssrFixStacktrace(error)` |
| Hydration mismatch | Ensure same data on client and server |
| Window/document not available | Guard with `typeof window !== 'undefined'` |
