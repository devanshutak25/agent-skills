# Dev Server

## Server Options

```ts
export default defineConfig({
  server: {
    host: '0.0.0.0',          // Listen on all addresses (default: 'localhost')
    port: 3000,                // Port (default: 5173)
    strictPort: true,          // Exit if port taken (default: false — tries next)
    open: true,                // Auto-open browser (or '/path')
    cors: true,                // Enable CORS (default: true)
    headers: {},               // Custom response headers
    warmup: {                  // Pre-transform files for faster load
      clientFiles: ['./src/main.tsx', './src/components/*.tsx'],
      ssrFiles: ['./src/server.ts'],
    },
  },
})
```

## Proxy

```ts
export default defineConfig({
  server: {
    proxy: {
      // String shorthand
      '/foo': 'http://localhost:4567',

      // With options
      '/api': {
        target: 'http://jsonplaceholder.typicode.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },

      // RegExp
      '^/fallback/.*': {
        target: 'http://jsonplaceholder.typicode.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/fallback/, ''),
      },

      // WebSocket proxy
      '/socket.io': {
        target: 'ws://localhost:5174',
        ws: true,
      },

      // Using the proxy instance
      '/api': {
        target: 'http://jsonplaceholder.typicode.com',
        changeOrigin: true,
        configure: (proxy, options) => {
          proxy.on('error', (err) => console.log('proxy error', err))
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log('Sending Request:', req.method, req.url)
          })
        },
      },
    },
  },
})
```

## HTTPS / TLS

```ts
// Option 1: @vitejs/plugin-basic-ssl (self-signed)
import basicSsl from '@vitejs/plugin-basic-ssl'
export default defineConfig({
  plugins: [basicSsl()],
})

// Option 2: Custom certificates
import fs from 'node:fs'
export default defineConfig({
  server: {
    https: {
      key: fs.readFileSync('key.pem'),
      cert: fs.readFileSync('cert.pem'),
    },
  },
})

// Option 3: mkcert plugin (locally-trusted certs)
// npm i -D vite-plugin-mkcert
import mkcert from 'vite-plugin-mkcert'
export default defineConfig({
  plugins: [mkcert()],
})
```

## Middleware Mode

Used for embedding Vite in an existing server (Express, Koa, etc.).

```ts
import express from 'express'
import { createServer as createViteServer } from 'vite'

async function start() {
  const app = express()
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom',
  })

  // Use Vite's connect middleware
  app.use(vite.middlewares)

  app.use('*', async (req, res) => {
    // Custom server logic — SSR, etc.
  })

  app.listen(3000)
}

start()
```

| `appType` | Behavior |
|-----------|----------|
| `'spa'` | Includes HTML middlewares + SPA fallback |
| `'mpa'` | Includes HTML middlewares only |
| `'custom'` | No HTML middlewares (for SSR / custom handling) |

## File System Access

```ts
export default defineConfig({
  server: {
    fs: {
      // Restrict file serving to workspace root (default: true in Vite 7)
      strict: true,
      // Allow serving files from these directories
      allow: [
        // Automatically includes: workspace root, search root, all workspaces
        '/path/to/custom/dir',
      ],
      // Deny access to sensitive files (higher priority than allow)
      deny: ['.env', '.env.*', '*.{crt,pem}'],
    },
  },
})
```

## HMR Options

```ts
export default defineConfig({
  server: {
    hmr: {
      protocol: 'ws',         // 'ws' | 'wss'
      host: 'localhost',
      port: 24678,            // HMR WebSocket port
      clientPort: 443,        // Override client-side port (for proxied setups)
      path: '/',              // WebSocket path
      timeout: 30000,
      overlay: true,          // Show error overlay (default: true)
    },
  },
})
```

## Watch Options

```ts
export default defineConfig({
  server: {
    watch: {
      // Chokidar options
      usePolling: true,        // Needed for some network filesystems / Docker
      interval: 100,
      ignored: ['!**/node_modules/your-package/**'],
    },
  },
})
```

## CLI Commands

```bash
# Start dev server
vite
vite serve
vite dev

# Common flags
vite --host 0.0.0.0          # Expose to network
vite --port 3000              # Custom port
vite --open                   # Open browser
vite --cors                   # Enable CORS
vite --mode staging           # Custom mode
vite --force                  # Force re-bundle dependencies
vite -c my-config.ts          # Custom config file
```

## Warmup

Pre-transform frequently accessed files to speed up initial page load:

```ts
export default defineConfig({
  server: {
    warmup: {
      // Pre-transform these modules on server start
      clientFiles: [
        './src/main.tsx',
        './src/App.tsx',
        './src/components/Layout.tsx',
      ],
      ssrFiles: [
        './src/entry-server.tsx',
      ],
    },
  },
})
```

- Files are pre-transformed but not loaded into memory
- Use for files that are always needed on first page load
- Avoid warming up too many files — diminishing returns
