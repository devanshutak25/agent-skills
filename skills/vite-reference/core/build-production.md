# Build & Production

## Build Options

```ts
export default defineConfig({
  build: {
    target: 'esnext',              // Browser compatibility target (default: 'baseline-widely-available')
    outDir: 'dist',                // Output directory (default: 'dist')
    assetsDir: 'assets',           // Assets subdirectory (default: 'assets')
    assetsInlineLimit: 4096,       // Inline assets < 4kb as base64 (bytes)
    cssCodeSplit: true,            // CSS code splitting (default: true)
    cssMinify: true,               // 'esbuild' | 'lightningcss' | true | false
    sourcemap: false,              // true | 'inline' | 'hidden' | false
    minify: 'esbuild',            // 'esbuild' | 'terser' | false
    emptyOutDir: true,             // Empty outDir before build
    copyPublicDir: true,           // Copy publicDir to outDir
    reportCompressedSize: true,    // Report gzip-compressed sizes
    chunkSizeWarningLimit: 500,    // Chunk size warning threshold (kB)
    manifest: false,               // Generate manifest.json (true | string path)
    ssrManifest: false,            // Generate SSR manifest
    ssr: false,                    // Build for SSR (string entry path)
    write: true,                   // Write to disk (false for programmatic)

    // Rollup/Rolldown options
    rollupOptions: {
      input: './src/main.ts',
      output: {
        manualChunks: {},
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
      external: [],
    },
  },
})
```

## Build Targets

| Target | Description |
|--------|-------------|
| `'baseline-widely-available'` | Default — Chrome 107+, Edge 107+, Firefox 104+, Safari 16+ |
| `'modules'` | Browsers with native ESM + dynamic import + `import.meta` |
| `'esnext'` | Assume native ESM support, minimal transforms |
| `'es2022'` | ES2022 features |
| `'chrome100'` | Specific browser version |
| `['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14']` | Multiple targets |

## Code Splitting

### Automatic
- Dynamic imports → separate chunks automatically
- CSS for async components → separate CSS files

### Manual Chunks

```ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Group vendor libraries
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          router: ['react-router'],
        },
      },
    },
  },
})
```

### Function-Based Manual Chunks

```ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'vendor-react'
            if (id.includes('@radix-ui')) return 'vendor-radix'
            return 'vendor'
          }
        },
      },
    },
  },
})
```

## Multi-Page App

```ts
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about/index.html'),
        nested: resolve(__dirname, 'nested/index.html'),
      },
    },
  },
})
```

## Manifest

```ts
export default defineConfig({
  build: {
    manifest: true,  // Generates .vite/manifest.json
  },
})
```

Output example:
```json
{
  "src/main.tsx": {
    "file": "assets/main-BhKl2e9f.js",
    "src": "src/main.tsx",
    "isEntry": true,
    "css": ["assets/main-DiwrgTda.css"],
    "imports": ["_vendor-CkeA32s1.js"]
  }
}
```

## Preview Server

```ts
export default defineConfig({
  preview: {
    port: 4173,              // Default: 4173
    host: 'localhost',
    strictPort: false,
    open: false,
    proxy: {},               // Same proxy options as dev server
    cors: true,
    headers: {},
  },
})
```

```bash
# Build then preview
vite build && vite preview

# CLI flags
vite preview --port 8080
vite preview --host 0.0.0.0
```

## CLI Commands

```bash
# Production build
vite build

# Common flags
vite build --mode staging         # Custom mode
vite build --outDir build         # Custom output dir
vite build --sourcemap            # Enable sourcemaps
vite build --minify terser        # Use terser
vite build --ssr src/entry.ts     # SSR build
vite build --emptyOutDir          # Clean output dir first
```

## Optimization Strategies

### Tree-Shaking
- Vite relies on Rollup/Rolldown for tree-shaking
- Use `/* @__PURE__ */` annotations for side-effect-free calls
- Set `sideEffects: false` in package.json for library code

### CSS Code Splitting
- Enabled by default — each async chunk gets its own CSS
- Set `build.cssCodeSplit: false` to extract all CSS into one file

### Async Chunk Loading Optimization
- Vite automatically rewrites dynamic imports for optimized loading
- Pre-loads common dependencies of async chunks

### Build Analysis

```bash
# Rollup bundle analyzer
npx vite-bundle-analyzer

# Visualize bundle
npx rollup-plugin-visualizer
```

## Dropping Console in Production

```ts
export default defineConfig({
  esbuild: {
    drop: ['console', 'debugger'],
  },
  // Or with Terser for more control:
  build: {
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
