# Turbopack

## Status in Next.js 16

Turbopack is the **default bundler** in Next.js 16 for both `next dev` and `next build`. The `--turbopack` flag is no longer needed and is a no-op. To fall back to webpack, use `--no-turbopack`.

```bash
next dev               # Turbopack (default)
next build             # Turbopack (default)
next dev --no-turbopack    # webpack fallback
next build --no-turbopack  # webpack fallback
```

## Persistent Cache

Turbopack uses a persistent filesystem cache between restarts. On repeat `next dev` or `next build` runs, only changed modules are rebuilt.

Cache location: `.next/cache/turbopack`

The cache is safe to commit in CI if reproducible builds are important, but typically added to `.gitignore`.

```bash
# Clear Turbopack cache
rm -rf .next/cache/turbopack
```

## Configuration in `next.config.ts`

```ts
// next.config.ts
import type { NextConfig } from 'next'

const config: NextConfig = {
  turbopack: {
    // Custom loaders for non-standard file types
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
      '*.mdx': {
        loaders: ['@mdx-js/loader'],
        as: '*.js',
        options: {
          remarkPlugins: [],
          rehypePlugins: [],
        },
      },
    },

    // Module aliases — replaces webpack resolve.alias
    resolveAlias: {
      'old-library': 'new-library',
      '@utils': './src/utils/index.ts',
    },

    // Additional resolve extensions (default: js, jsx, ts, tsx, json, css)
    resolveExtensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.css', '.svg'],
  },
}

export default config
```

## Custom Loaders

Turbopack loaders are webpack-compatible but not all webpack loaders work. Check the [Turbopack loader compatibility list](https://turbo.build/pack/docs/migrating-from-webpack) before using a loader.

```ts
// Example: YAML file loader
turbopack: {
  rules: {
    '*.yaml': {
      loaders: ['yaml-loader'],
      as: '*.js',
    },
  },
},
```

Loaders receive the file content and must return JavaScript. The `as` field tells Turbopack what module type to treat the output as.

## Module Aliases

```ts
turbopack: {
  resolveAlias: {
    // Swap a package entirely
    'lodash': 'lodash-es',

    // Point to a local mock in tests (set via env in next.config.ts)
    ...(process.env.NODE_ENV === 'test' && {
      '@/lib/analytics': './src/__mocks__/analytics.ts',
    }),
  },
},
```

## Performance Notes

- **Cold start**: First `next dev` is slower (building cache). Subsequent starts are significantly faster.
- **HMR**: Module-level HMR — only the changed module and its dependents recompile. React Fast Refresh still applies for component state preservation.
- **Build**: `next build` with Turbopack is faster for large codebases. Bundle analysis still works via `@next/bundle-analyzer` (set `ANALYZE=true`).

## When to Fall Back to Webpack

| Situation | Flag |
|-----------|------|
| Using a webpack loader with no Turbopack equivalent | `--no-turbopack` |
| `webpack()` config function used in `next.config.ts` | `--no-turbopack` (or migrate) |
| CI environment with known Turbopack incompatibility | `--no-turbopack` |
| Debugging a suspected Turbopack-specific bug | `--no-turbopack` to isolate |

The `webpack()` config function in `next.config.ts` is ignored when Turbopack is active. Migrate custom webpack config to `turbopack` equivalent options, or use `--no-turbopack`.

```ts
// next.config.ts — webpack config is only used when --no-turbopack is passed
const config: NextConfig = {
  turbopack: { /* Turbopack-specific config */ },
  webpack(config, { isServer }) {
    // Only runs when --no-turbopack is used
    config.plugins.push(new MyWebpackPlugin())
    return config
  },
}
```

## Cross-References

- [Configuration](./configuration.md) — full `next.config.ts` options reference
