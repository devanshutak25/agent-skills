# Migration: Vite 6 → Vite 7

## Breaking Changes Summary

### Node.js Requirements
- **Minimum**: Node 20.19+ or Node 22.12+
- Node 18 and Node 21 are no longer supported
- Node 19 was never LTS — not supported

### Browser Baseline
- Default `build.target` updated to match modern browser baseline
- Targets browsers supporting native ESM, dynamic import, `import.meta`, nullish coalescing, optional chaining
- Older browser support requires `@vitejs/plugin-legacy`

### Rolldown Available via `rolldown-vite`
- `rolldown-vite` is a drop-in replacement package using Rolldown (Rust-based bundler)
- Significantly faster builds (~2-5x)
- Most Rollup plugins work unchanged (API-compatible)
- Not the default bundler yet — opt-in via `npm install rolldown-vite`

### Environment API (Stable)
- Environment API graduated from experimental (Vite 6) to stable
- `DevEnvironment` and `BuildEnvironment` are first-class
- Per-environment plugins, resolve conditions, and build config
- Frameworks should migrate to Environment API for SSR

### Sass Changes
- Modern Sass API is now the only supported API
- Legacy Sass API completely removed — migrate `@import` to `@use`/`@forward`
- `sass-embedded` is the recommended Sass implementation

### ESM-Only Distribution
- Vite 7 is distributed as ESM only
- CJS consumers must use dynamic `import()` for the JavaScript API

### Build Target Default
- `build.target` changed from `'modules'` to `'baseline-widely-available'`
- New baseline: Chrome 107+, Edge 107+, Firefox 104+, Safari 16+

### Removed APIs
- `splitVendorChunkPlugin` removed (deprecated since v5.2.7) — use `manualChunks`
- `transformIndexHtml` `enforce`/`transform` properties removed — use `order`/`handler`
- `HMRBroadcaster` and related types removed
- `ModuleRunnerOptions.root` removed
- `legacy.proxySsrExternalModules` removed

## Step-by-Step Migration

### 1. Update Node.js

```bash
# Verify Node version
node --version  # Must be ≥20.19 or ≥22.12

# Update if needed
nvm install 22
nvm use 22
```

### 2. Update Vite and Plugins

```bash
npm install vite@latest
npm install @vitejs/plugin-react@latest    # or react-swc, vue, etc.
npm install @vitejs/plugin-legacy@latest   # if using legacy
```

### 3. Update Configuration

```ts
// vite.config.ts — Vite 7 changes

export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        // Vite 7 default: 'modern-compiler'
        // If you need legacy Sass API:
        api: 'legacy',
      },
    },
  },
})
```

### 4. Sass Migration

```bash
# Switch to sass-embedded (faster)
npm uninstall sass
npm install -D sass-embedded
```

```ts
// If using @import (deprecated in modern Sass), switch to @use
// ❌ Old
@import 'variables';

// ✅ New
@use 'variables' as *;
```

### 5. Environment API Migration

```ts
// ❌ Vite 6 experimental API
export default defineConfig({
  experimental: {
    environments: { /* ... */ }
  }
})

// ✅ Vite 7 API
export default defineConfig({
  environments: {
    client: { /* ... */ },
    ssr: { /* ... */ },
  },
})
```

Note: Environment API continues as experimental in Vite 7 for further ecosystem validation.

### 6. Plugin Compatibility Check

```bash
# Check for Rolldown compatibility issues
# Most plugins work unchanged — test your build
vite build

# If a plugin fails, check for updates
npm outdated
```

## Removed / Changed APIs

| Vite 6 | Vite 7 | Action |
|--------|--------|--------|
| `experimental.environments` | `environments` | Move to top-level |
| Sass legacy API available | Legacy API removed | Migrate `@import` → `@use`/`@forward` |
| `build.target: 'modules'` | `build.target: 'baseline-widely-available'` | Check browser support needs |
| `splitVendorChunkPlugin` | Removed | Use `rollupOptions.output.manualChunks` |
| `transformIndexHtml` enforce/transform | Removed | Use `order`/`handler` properties |
| CJS/ESM distribution | ESM only | Use `import()` for CJS consumers |
| Node 18 support | Dropped | Upgrade to Node 20.19+ or 22.12+ |
| `server.fs.strict` default `false` | Default `true` | May need to add `server.fs.allow` entries |

## Config Changes

### server.fs.strict Default

```ts
// Vite 6: strict was false by default
// Vite 7: strict is true by default
export default defineConfig({
  server: {
    fs: {
      // If you need to serve files outside project root:
      allow: ['..'],
      // Or disable strict mode (not recommended):
      // strict: false,
    },
  },
})
```

### CSS Preprocessor Default

```ts
// Vite 6: Sass legacy API was default
// Vite 7: Sass modern-compiler API is default
export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        // Set explicitly if you need legacy behavior
        api: 'legacy',
        // Use 'modern-compiler' (default) or 'modern' for new API
      },
    },
  },
})
```

## Rolldown Migration Notes

### What Works
- Standard `rollupOptions` configuration
- Most Rollup output plugins
- `manualChunks`, `external`, `output` options
- Plugin hooks: `resolveId`, `load`, `transform`, `renderChunk`, etc.

### What May Need Changes
- Plugins using Rollup's internal `this.parse()` with specific AST expectations
- Plugins relying on Rollup-specific chunk metadata internals
- Custom `makeAbsoluteExternalsRelative` behavior

### Performance Comparison
| Metric | Vite 6 (Rollup) | Vite 7 (Rolldown) |
|--------|-----------------|-------------------|
| Cold build | Baseline | ~2-5x faster |
| Incremental build | Baseline | ~2-3x faster |
| Memory usage | Baseline | Lower |
| Plugin compat | 100% | ~95%+ |

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "Node version not supported" | Upgrade to Node ≥20.19 or ≥22.12 |
| Sass `@import` deprecation warnings | Switch to `@use`/`@forward` syntax |
| Sass compilation errors | Set `api: 'legacy'` or fix modern Sass syntax |
| Plugin error after upgrade | Check plugin has Vite 7 compatible version |
| Rolldown build difference | Compare output, report to Vite if regression |
| `server.fs.strict` blocking files | Add paths to `server.fs.allow` |
| Environment API type errors | Remove `experimental.` prefix |

## Quick Migration Checklist

- [ ] Node.js ≥20.19 or ≥22.12
- [ ] `vite@latest` installed
- [ ] All `@vitejs/plugin-*` updated to latest
- [ ] Sass imports: `@import` → `@use`/`@forward` (legacy API removed)
- [ ] Remove `splitVendorChunkPlugin` — use `manualChunks`
- [ ] `transformIndexHtml`: rename `enforce` → `order`, `transform` → `handler`
- [ ] `experimental.environments` → `environments` (if used)
- [ ] `server.fs.allow` updated if strict mode blocks files
- [ ] Review `build.target` change (`'baseline-widely-available'` default)
- [ ] All tests passing
- [ ] Third-party Vite plugins updated
