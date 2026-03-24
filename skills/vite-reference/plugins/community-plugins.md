# Community Plugins

Popular community plugins organized by category. See [awesome-vite](https://github.com/vitejs/awesome-vite) for comprehensive list.

## Framework Plugins

| Plugin | Package | Description |
|--------|---------|-------------|
| Svelte | `@sveltejs/vite-plugin-svelte` | Official Svelte support |
| Solid | `vite-plugin-solid` | SolidJS support |
| Preact | `@preact/preset-vite` | Preact support + Fast Refresh |
| Qwik | `@qwik.dev/core` | Qwik framework support |
| Angular | `@analogjs/vite-plugin-angular` | Angular (via AnalogJS) |

## Build & Optimization

| Plugin | Package | Description |
|--------|---------|-------------|
| Compression | `vite-plugin-compression` | Gzip/Brotli pre-compression |
| imagemin | `vite-plugin-imagemin` | Image optimization |
| ViteImageOptimizer | `vite-plugin-image-optimizer` | Squoosh/Sharp image optimization |
| cdn-import | `vite-plugin-cdn-import` | Load deps from CDN |
| chunk-split | `vite-plugin-chunk-split` | Custom chunk splitting strategies |
| Remove console | `vite-plugin-remove-console` | Strip console.log in production |

## DX (Developer Experience)

| Plugin | Package | Description |
|--------|---------|-------------|
| Inspect | `vite-plugin-inspect` | Inspect plugin transform pipeline |
| Checker | `vite-plugin-checker` | TypeScript/ESLint/Stylelint checking in worker |
| Auto import | `unplugin-auto-import` | Auto-import APIs (React hooks, Vue composables) |
| Components | `unplugin-vue-components` | Auto-register Vue components |
| Icons | `unplugin-icons` | On-demand icon loading (10k+ icons) |
| SVG component | `vite-plugin-svgr` | Import SVG as React component |
| SVG Vue | `vite-svg-loader` | Import SVG as Vue component |
| Restart | `vite-plugin-restart` | Restart dev server on file change |

### unplugin-auto-import

```ts
import AutoImport from 'unplugin-auto-import/vite'

export default defineConfig({
  plugins: [
    AutoImport({
      imports: ['react', 'react-router'],
      dts: './src/auto-imports.d.ts',
    }),
  ],
})
```

### vite-plugin-checker

```ts
import checker from 'vite-plugin-checker'

export default defineConfig({
  plugins: [
    checker({
      typescript: true,
      eslint: { lintCommand: 'eslint "./src/**/*.{ts,tsx}"' },
      overlay: { initialIsOpen: false },
    }),
  ],
})
```

### vite-plugin-svgr

```ts
import svgr from 'vite-plugin-svgr'

export default defineConfig({
  plugins: [svgr()],
})
```
```tsx
import Logo from './logo.svg?react'  // React component
import logoUrl from './logo.svg'      // URL string
```

## CSS

| Plugin | Package | Description |
|--------|---------|-------------|
| Tailwind (v4) | `@tailwindcss/vite` | Official Tailwind CSS v4 plugin |
| UnoCSS | `unocss/vite` | Atomic CSS engine |
| Vanilla Extract | `@vanilla-extract/vite-plugin` | Zero-runtime CSS-in-TS |
| Panda CSS | `@pandacss/dev` | Build-time CSS-in-JS |
| StyleX | `@stylexjs/babel-plugin` | Meta's atomic CSS (via Babel) |

### Tailwind CSS v4

```ts
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss()],
})
```

### UnoCSS

```ts
import UnoCSS from 'unocss/vite'

export default defineConfig({
  plugins: [UnoCSS()],
})
```

## PWA

| Plugin | Package | Description |
|--------|---------|-------------|
| PWA | `vite-plugin-pwa` | Zero-config PWA with Workbox |

```ts
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt'],
      manifest: {
        name: 'My App',
        short_name: 'App',
        theme_color: '#ffffff',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
})
```

## Desktop / Mobile

| Plugin | Package | Description |
|--------|---------|-------------|
| Electron | `vite-plugin-electron` | Electron integration |
| Electron Renderer | `vite-plugin-electron-renderer` | Electron renderer process |
| Tauri | `@tauri-apps/cli` | Tauri (Rust desktop) + Vite |

## SSR

| Plugin | Package | Description |
|--------|---------|-------------|
| SSR | `vite-plugin-ssr` / `vike` | Full-featured SSR framework |
| Pages | `vite-plugin-pages` | File-system based routing |

## Testing

| Plugin | Package | Description |
|--------|---------|-------------|
| Vitest | `vitest` | Vite-native testing (shares config) |

## API & Mocking

| Plugin | Package | Description |
|--------|---------|-------------|
| Mock server | `vite-plugin-mock-server` | API mocking in dev |
| ViteNode | `vite-node` | Run Node.js scripts with Vite transforms |

## Multi-Page / Routing

| Plugin | Package | Description |
|--------|---------|-------------|
| MPA | `vite-plugin-mpa` | Multi-page app support |
| Pages | `vite-plugin-pages` | File-system routing |

## Environment & Config

| Plugin | Package | Description |
|--------|---------|-------------|
| HTTPS (mkcert) | `vite-plugin-mkcert` | Local HTTPS with mkcert |
| Environment | `vite-plugin-environment` | Expose env vars to client |
| Full reload | `vite-plugin-full-reload` | Full reload on file changes |

## Unplugin Ecosystem

Unplugins work across Vite, Webpack, Rollup, esbuild:

| Plugin | Package | Description |
|--------|---------|-------------|
| Auto Import | `unplugin-auto-import` | Auto-import APIs |
| Vue Components | `unplugin-vue-components` | Auto-register components |
| Icons | `unplugin-icons` | On-demand icons |
| Fonts | `unplugin-fonts` | Auto-load fonts |
| Macros | `unplugin-macros` | Compile-time macros |
