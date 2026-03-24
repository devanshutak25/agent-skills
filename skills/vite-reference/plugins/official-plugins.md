# Official Plugins

## @vitejs/plugin-vue

Vue 3 SFC support.

```bash
npm i -D @vitejs/plugin-vue
```

```ts
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
})
```

### Options

```ts
vue({
  include: [/\.vue$/],           // Files to process
  exclude: [],
  isProduction: undefined,        // Auto-detected from mode
  script: {
    defineModel: true,            // Enable defineModel macro
    propsDestructure: true,       // Enable props destructure
  },
  template: {
    compilerOptions: {
      isCustomElement: (tag) => tag.startsWith('my-'),
    },
    transformAssetUrls: {},
  },
  style: {
    trim: true,
  },
  features: {
    optionsAPI: true,             // Set false to tree-shake Options API
    prodDevtools: false,
    prodHydrationMismatchDetails: false,
  },
})
```

## @vitejs/plugin-vue-jsx

Vue 3 JSX/TSX support.

```bash
npm i -D @vitejs/plugin-vue-jsx
```

```ts
import vueJsx from '@vitejs/plugin-vue-jsx'

export default defineConfig({
  plugins: [vueJsx()],
})
```

## @vitejs/plugin-react

React support with Babel for Fast Refresh.

```bash
npm i -D @vitejs/plugin-react
```

```ts
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

### Options

```ts
react({
  // Babel options
  babel: {
    plugins: [
      ['@babel/plugin-proposal-decorators', { legacy: true }],
    ],
    presets: [],
  },

  // JSX runtime: 'automatic' (default) | 'classic'
  jsxRuntime: 'automatic',

  // Custom JSX factory (classic mode)
  jsxImportSource: '@emotion/react',

  // Files to include/exclude for Fast Refresh
  include: ['**/*.tsx', '**/*.jsx'],
  exclude: [],
})
```

## @vitejs/plugin-react-swc

React support with SWC — significantly faster than Babel.

```bash
npm i -D @vitejs/plugin-react-swc
```

```ts
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
})
```

### Options

```ts
react({
  // SWC options
  jsxImportSource: '@emotion/react',

  // Enable TypeScript decorators
  tsDecorators: true,

  // SWC plugins
  plugins: [
    ['@swc/plugin-styled-components', {}],
  ],
})
```

### React Plugin Decision Table

| Need | Plugin |
|------|--------|
| Standard React project | `@vitejs/plugin-react-swc` (faster) |
| Need Babel plugins (decorators, macros) | `@vitejs/plugin-react` |
| Emotion/Styled Components via SWC | `@vitejs/plugin-react-swc` with SWC plugins |
| Emotion via Babel | `@vitejs/plugin-react` with `jsxImportSource` |
| React Compiler | Either — add React Compiler Babel/SWC plugin |
| Maximum dev speed | `@vitejs/plugin-react-swc` |

## @vitejs/plugin-legacy

Generate legacy bundles for older browsers.

```bash
npm i -D @vitejs/plugin-legacy terser
```

```ts
import legacy from '@vitejs/plugin-legacy'

export default defineConfig({
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11'],
      // Or specific:
      // targets: ['> 0.3%', 'last 2 versions', 'Firefox ESR', 'not dead'],
    }),
  ],
})
```

### Options

```ts
legacy({
  targets: ['defaults'],

  // Additional polyfills to include
  additionalLegacyPolyfills: ['regenerator-runtime/runtime'],

  // Generate modern-only polyfills (no legacy chunks)
  modernPolyfills: true,

  // Render legacy <script nomodule> chunks
  renderLegacyChunks: true,

  // Explicit polyfills (overrides auto-detection)
  polyfills: ['es.promise', 'es.array.flat-map'],

  // Exclude polyfills for specific features
  ignoreBrowserslistConfig: false,
})
```

**How it works:**
- Generates two sets of chunks: modern (ESM) + legacy (SystemJS)
- Modern browsers load ESM; older browsers fall back to legacy
- Requires `terser` for legacy chunk minification

## @vitejs/plugin-rsc

React Server Components support via the Environment API.

```bash
npm i -D @vitejs/plugin-rsc
```

```ts
import rsc from '@vitejs/plugin-rsc'

export default defineConfig({
  plugins: [rsc()],
})
```

- Enables React Server Components in Vite projects
- Uses the Environment API for separate client/server module graphs
- Experimental — for framework authors building RSC support

## @vitejs/plugin-basic-ssl

Self-signed TLS certificate for local HTTPS development.

```bash
npm i -D @vitejs/plugin-basic-ssl
```

```ts
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  plugins: [basicSsl()],
})
```

### Options

```ts
basicSsl({
  name: 'my-app',                 // Certificate name
  domains: ['*.custom.com'],      // Additional domains
  certDir: './certs',             // Certificate storage directory
})
```

## Plugin Compatibility Matrix

| Plugin | Vite 7 | Vite 6 | Framework |
|--------|--------|--------|-----------|
| `@vitejs/plugin-vue` | ✅ | ✅ | Vue 3 |
| `@vitejs/plugin-vue-jsx` | ✅ | ✅ | Vue 3 |
| `@vitejs/plugin-react` | ✅ | ✅ | React |
| `@vitejs/plugin-react-swc` | ✅ | ✅ | React |
| `@vitejs/plugin-legacy` | ✅ | ✅ | Any |
| `@vitejs/plugin-rsc` | ✅ | ❌ | React (RSC) |
| `@vitejs/plugin-basic-ssl` | ✅ | ✅ | Any |
