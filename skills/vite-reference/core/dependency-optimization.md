# Dependency Pre-Bundling (Optimization)

## Why Pre-Bundling?

1. **CommonJS/UMD → ESM**: Converts CJS dependencies to ESM for browser compatibility
2. **Many modules → one**: Bundles dependencies with many internal modules (e.g., lodash-es has 600+ modules) into a single module to avoid HTTP request waterfalls

## How It Works

- Vite uses **esbuild** to pre-bundle dependencies on first dev server start
- Results cached in `node_modules/.vite/deps`
- Re-runs when: lock file changes, patches folder changes, vite config changes, `NODE_ENV` changes

## Configuration

```ts
export default defineConfig({
  optimizeDeps: {
    // Force include dependencies for pre-bundling
    include: [
      'linked-dep > nested-dep',   // Deep imports
      'some-cjs-only-package',
    ],

    // Exclude from pre-bundling
    exclude: [
      'my-local-package',          // Local linked packages
    ],

    // esbuild options for dep scanning
    esbuildOptions: {
      target: 'esnext',
      supported: { bigint: true },
      plugins: [],
      loader: { '.js': 'jsx' },    // Handle JSX in .js files
    },

    // Force re-bundle (ignores cache)
    force: true,

    // Disable dependency discovery (only pre-bundle explicitly included)
    noDiscovery: true,

    // Entries to scan for dependencies
    entries: ['./src/main.ts'],     // Default: all HTML files

    // Hold first page load until deps are optimized
    holdUntilCrawlEnd: true,        // Default: true
  },
})
```

## Force Re-Optimization

```bash
# CLI flag
vite --force

# Or delete cache manually
rm -rf node_modules/.vite
```

## Include — When to Use

| Scenario | Solution |
|----------|----------|
| Linked dependency (not in node_modules) | `include: ['linked-dep']` |
| Dependency only imported dynamically | `include: ['lazy-dep']` |
| CJS dependency not auto-detected | `include: ['cjs-pkg']` |
| Nested dependency needs bundling | `include: ['parent > child']` |
| Component library with many files | `include: ['lodash-es', 'antd']` |

```ts
// Example: Include dynamically imported deps
optimizeDeps: {
  include: [
    'firebase/app',
    'firebase/auth',
    'firebase/firestore',
  ],
}
```

## Exclude — When to Use

| Scenario | Solution |
|----------|----------|
| Package is already valid ESM | `exclude: ['esm-only-pkg']` |
| Local linked package you're editing | `exclude: ['@my-org/shared']` |
| Package with special handling needs | `exclude: ['my-wasm-pkg']` |

**Note:** If you exclude a CJS dependency, you should include its ESM consumers:
```ts
optimizeDeps: {
  exclude: ['some-cjs-dep'],
  include: ['consumer-of-cjs-dep'], // Ensure consumer is still pre-bundled
}
```

## Caching

### Automatic Cache Invalidation
- Package manager lock file changes (`package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`, `bun.lockb`)
- `patches/` folder changes
- Vite config changes
- `NODE_ENV` value changes

### Manual Cache Invalidation
```bash
vite --force          # Ignore cache, re-bundle everything
```

### Browser Cache
- Pre-bundled deps are cached with HTTP headers: `max-age=31536000, immutable`
- Cache-busted by file hash — new versions get new URLs
- To debug: open Network tab → disable cache

## Troubleshooting

### "Missing export" or "is not exported by"
```ts
// Dependency wasn't pre-bundled — force include
optimizeDeps: {
  include: ['problematic-package'],
}
```

### "Outdated pre-bundle dependencies"
```bash
# Stale cache — force re-optimization
vite --force
```

### Slow First Load
```ts
// Pre-bundle known heavy dependencies
optimizeDeps: {
  include: [
    'react', 'react-dom',
    'lodash-es',
    '@mui/material',
    'chart.js',
  ],
}
```

### Linked Dependencies Not Updating
```ts
// Exclude linked packages so they're processed fresh
optimizeDeps: {
  exclude: ['@my-org/shared'],
}
```

### CJS Dependency Issues
```ts
// Some CJS packages need explicit inclusion
optimizeDeps: {
  include: ['cjs-package'],
  esbuildOptions: {
    // If .js files contain JSX
    loader: { '.js': 'jsx' },
  },
}
```

## SSR Dependency Handling

SSR dependencies are handled differently — externalized by default:

```ts
export default defineConfig({
  ssr: {
    // Dependencies to bundle (not externalize) in SSR
    noExternal: ['some-esm-only-dep', /^@my-org\//],

    // Force externalize (node_modules resolution)
    external: ['heavy-dep'],

    // Optimize CJS deps for SSR
    optimizeDeps: {
      include: ['cjs-dep'],
    },
  },
})
```

## Performance Impact

| Strategy | Effect |
|----------|--------|
| Pre-bundle large deps | Faster cold start, fewer HTTP requests |
| Include dynamic imports | Avoids re-optimization during navigation |
| Exclude linked packages | Enables live editing without cache issues |
| `warmup.clientFiles` | Pre-transform app code alongside deps |
| `holdUntilCrawlEnd: true` | Prevents mid-load re-optimization |
