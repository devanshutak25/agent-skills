# Performance

## Dev Server Performance

### Warmup

Pre-transform files that are always needed:

```ts
export default defineConfig({
  server: {
    warmup: {
      clientFiles: [
        './src/main.tsx',
        './src/App.tsx',
        './src/components/Layout.tsx',
      ],
      ssrFiles: ['./src/entry-server.tsx'],
    },
  },
})
```

### Avoid Barrel Files

Barrel files (`index.ts` that re-exports everything) cause unnecessary module loading:

```ts
// ❌ Bad — imports entire barrel, all components loaded
import { Button } from '@/components'

// ✅ Good — direct import, only Button loaded
import { Button } from '@/components/Button'
```

If you must use barrel files:
```ts
// Auto-import plugin can help
import AutoImport from 'unplugin-auto-import/vite'
```

### Minimize Dependency Scope

```ts
export default defineConfig({
  optimizeDeps: {
    // Include frequently used deps upfront
    include: ['react', 'react-dom', 'react-router'],
    // Exclude rarely used deps
    exclude: ['heavy-optional-dep'],
  },
})
```

### CSS Performance

```ts
export default defineConfig({
  css: {
    // Use Lightning CSS for faster CSS processing
    transformer: 'lightningcss',
    lightningcss: {
      targets: { chrome: 100 },
    },
  },
})
```

## Build Performance

### Profiling

```bash
# Use Vite's built-in profiling
vite build --profile

# Generates vite-profile-*.cpuprofile
# Open in Chrome DevTools → Performance tab

# Debug plugin timing
DEBUG="vite:*" vite build
```

### vite-plugin-inspect

```ts
import Inspect from 'vite-plugin-inspect'

export default defineConfig({
  plugins: [Inspect()],  // Visit /__inspect/ in dev
})
```

### Rolldown (Optional — `rolldown-vite`)

Drop-in replacement package using Rolldown (Rust-based bundler) for faster builds:

```bash
npm install rolldown-vite
```

```ts
// Replace 'vite' imports with 'rolldown-vite' in scripts
// Config stays the same — API-compatible with Rollup
```

Benefits:
- ~2-5x faster cold builds than Rollup
- API-compatible with most Rollup plugins
- Lower memory usage

### Tree-Shaking Optimization

```ts
// Mark functions as pure for tree-shaking
const result = /* @__PURE__ */ createComponent()

// package.json — mark package as side-effect free
{
  "sideEffects": false,
  // Or specify files with side effects:
  "sideEffects": ["*.css", "*.global.js"]
}
```

### Manual Chunk Splitting

```ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-router': ['react-router'],
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-popover'],
        },
      },
    },
  },
})
```

### Dynamic Import for Code Splitting

```ts
// Automatic code splitting via dynamic imports
const LazyComponent = lazy(() => import('./HeavyComponent'))

// Named chunk
const Admin = lazy(() => import(/* webpackChunkName: "admin" */ './Admin'))
```

### Minification

```ts
export default defineConfig({
  build: {
    // esbuild (default) — fastest
    minify: 'esbuild',

    // terser — smaller output, slower
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
})
```

## Bundle Analysis

```bash
# rollup-plugin-visualizer
npm i -D rollup-plugin-visualizer

# vite-bundle-analyzer
npm i -D vite-bundle-analyzer
```

```ts
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
})
```

## Asset Optimization

### Image Optimization

```ts
// vite-plugin-image-optimizer
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'

export default defineConfig({
  plugins: [
    ViteImageOptimizer({
      jpg: { quality: 80 },
      png: { quality: 80 },
      webp: { quality: 80 },
      avif: { quality: 50 },
    }),
  ],
})
```

### Pre-Compression

```ts
// vite-plugin-compression
import compression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    compression({ algorithm: 'gzip' }),
    compression({ algorithm: 'brotliCompress' }),
  ],
})
```

### Asset Inlining Threshold

```ts
export default defineConfig({
  build: {
    assetsInlineLimit: 4096,  // Inline assets < 4KB as base64
  },
})
```

## Performance Checklist

| Area | Optimization |
|------|-------------|
| Dev cold start | Use `server.warmup` for critical files |
| Dev imports | Avoid barrel files, use direct imports |
| Dev CSS | Use Lightning CSS transformer |
| Build speed | Vite 7 Rolldown (default), or `minify: 'esbuild'` |
| Bundle size | Tree-shaking, manual chunks, code splitting |
| Bundle analysis | `rollup-plugin-visualizer` |
| Asset size | Image optimization, compression, inlining |
| Caching | Content-hashed filenames (default) |
| Loading | Preload critical chunks, lazy load routes |
| Network | Gzip/Brotli pre-compression |
| Dependencies | Audit with `npx depcheck`, remove unused |

## Performance Anti-Patterns

| Anti-Pattern | Fix |
|-------------|-----|
| Large barrel file imports | Direct file imports |
| All deps in one vendor chunk | Split by usage pattern |
| No code splitting | Dynamic imports for routes |
| Unoptimized images in src/ | Use image optimization plugin |
| CSS-in-JS runtime overhead | Use Tailwind, CSS Modules, or build-time CSS |
| Unnecessary polyfills | Set appropriate `build.target` |
| `@import` chains in CSS | Use CSS preprocessor or Tailwind |
