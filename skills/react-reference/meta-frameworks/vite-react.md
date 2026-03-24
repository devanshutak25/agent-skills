# Vite + React

## Setup

```bash
npm create vite@latest my-app -- --template react-ts
# Templates: react, react-ts, react-swc, react-swc-ts
```

## Configuration

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc'; // SWC: ~20x faster than Babel
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router'],
        },
      },
    },
  },
});
```

## Plugins

| Plugin | Purpose |
|--------|---------|
| `@vitejs/plugin-react` | Babel-based, React Refresh, supports React Compiler |
| `@vitejs/plugin-react-swc` | SWC-based, ~20x faster transforms |
| `vite-plugin-svgr` | Import SVGs as React components |
| `rollup-plugin-visualizer` | Bundle analysis |
| `vite-plugin-pwa` | PWA support |

### With React Compiler
```ts
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
  ],
});
```

## Environment Variables

```bash
# .env.local
VITE_API_URL=https://api.example.com
# Only VITE_ prefixed vars exposed to client
```

```ts
// Access
const apiUrl = import.meta.env.VITE_API_URL;
const isDev = import.meta.env.DEV;
const isProd = import.meta.env.PROD;

// Type safety
// vite-env.d.ts
/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}
```

## Build Optimization

### Chunk Splitting
```ts
build: {
  rollupOptions: {
    output: {
      manualChunks(id) {
        if (id.includes('node_modules')) {
          if (id.includes('lodash')) return 'lodash';
          if (id.includes('@tanstack')) return 'tanstack';
          return 'vendor';
        }
      },
    },
  },
},
```

### Dynamic Import (Code Splitting)
```tsx
const Editor = lazy(() => import('./components/Editor'));
```

### Bundle Analysis
```ts
import { visualizer } from 'rollup-plugin-visualizer';

plugins: [react(), visualizer({ open: true, gzipSize: true })],
```

## SSR with Vite

For production SSR, use **TanStack Start** or **Vike** (formerly vite-plugin-ssr) rather than building a custom SSR server. Raw Vite SSR is low-level:

```tsx
// entry-server.tsx
import { renderToString } from 'react-dom/server';
export function render(url: string) {
  return renderToString(<App url={url} />);
}

// entry-client.tsx
import { hydrateRoot } from 'react-dom/client';
hydrateRoot(document.getElementById('root')!, <App />);
```

## Common Project Setup

```bash
# Essential packages for a typical Vite + React project
npm install react react-dom react-router
npm install -D typescript @types/react @types/react-dom
npm install -D vite @vitejs/plugin-react-swc
npm install -D tailwindcss @tailwindcss/vite
npm install -D vitest @testing-library/react jsdom
npm install -D eslint @eslint/js typescript-eslint
```
