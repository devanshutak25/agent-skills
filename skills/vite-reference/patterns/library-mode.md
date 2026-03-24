# Library Mode

## Basic Setup

```ts
// vite.config.ts
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'MyLib',                    // Global variable name (for UMD/IIFE)
      fileName: 'my-lib',              // Output file name (without extension)
      // fileName: (format) => `my-lib.${format}.js`,  // Custom per-format
    },
    rollupOptions: {
      // Externalize deps that shouldn't be bundled
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
        },
      },
    },
  },
})
```

## Output Formats

```ts
build: {
  lib: {
    entry: resolve(__dirname, 'src/index.ts'),
    // Default: ['es', 'umd'] if name is set, ['es', 'cjs'] otherwise
    formats: ['es', 'cjs', 'umd', 'iife'],
    name: 'MyLib',  // Required for UMD/IIFE
  },
}
```

| Format | File Extension | Use Case |
|--------|---------------|----------|
| `es` | `.mjs` / `.js` | Modern bundlers, ESM-native environments |
| `cjs` | `.cjs` / `.js` | Node.js, legacy bundlers |
| `umd` | `.umd.js` | Universal — CDN, Node, bundlers |
| `iife` | `.iife.js` | `<script>` tags in browser |

## Multiple Entry Points

```ts
export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        utils: resolve(__dirname, 'src/utils.ts'),
        components: resolve(__dirname, 'src/components/index.ts'),
      },
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
    },
  },
})
```

## package.json Exports

```json
{
  "name": "my-lib",
  "version": "1.0.0",
  "type": "module",
  "files": ["dist"],
  "main": "./dist/my-lib.cjs",
  "module": "./dist/my-lib.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": {
        "types": "./dist/index.d.ts",
        "default": "./dist/my-lib.js"
      },
      "require": {
        "types": "./dist/index.d.cts",
        "default": "./dist/my-lib.cjs"
      }
    },
    "./utils": {
      "import": {
        "types": "./dist/utils.d.ts",
        "default": "./dist/utils.js"
      },
      "require": {
        "types": "./dist/utils.d.cts",
        "default": "./dist/utils.cjs"
      }
    },
    "./style.css": "./dist/style.css"
  },
  "sideEffects": ["*.css"],
  "peerDependencies": {
    "react": "^18.0.0 || ^19.0.0",
    "react-dom": "^18.0.0 || ^19.0.0"
  }
}
```

## TypeScript Declarations (.d.ts)

### vite-plugin-dts

```bash
npm i -D vite-plugin-dts
```

```ts
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    dts({
      include: ['src'],
      // insertTypesEntry: true,  // Add "types" to package.json
      rollupTypes: true,          // Bundle .d.ts into single file
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'cjs'],
    },
  },
})
```

### tsup (Alternative)

For simpler library builds, consider `tsup` (powered by esbuild):

```bash
npx tsup src/index.ts --format esm,cjs --dts
```

## CSS Handling in Libraries

### Injected CSS (bundled with JS)

By default, CSS imported in library code is extracted to a separate file.

### CSS as Separate File

```ts
// Consumer imports CSS explicitly
import 'my-lib/style.css'
```

### CSS Modules in Libraries

```ts
// Component uses CSS modules normally
import styles from './Button.module.css'

export function Button() {
  return <button className={styles.button}>Click</button>
}
```

### No CSS Extraction

```ts
export default defineConfig({
  build: {
    cssCodeSplit: false,  // All CSS in one file
    lib: { /* ... */ },
  },
})
```

## Externalization

```ts
export default defineConfig({
  build: {
    rollupOptions: {
      // String, array, or regex
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        /^@radix-ui\//,          // Regex: all @radix-ui packages
      ],
    },
  },
})
```

### What to Externalize

| Dependency Type | Externalize? |
|----------------|-------------|
| peerDependencies | ✅ Always |
| React/Vue/Solid runtime | ✅ Always |
| Utility libraries (lodash, date-fns) | ⚠️ Depends — external if peer, bundle if small |
| CSS framework (Tailwind classes) | ✅ Don't bundle — consumers compile |
| Internal helpers | ❌ Bundle them |
| Node built-ins (fs, path) | ✅ External for Node libs |

## React Component Library Example

```ts
// vite.config.ts
import { resolve } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    react(),
    dts({ include: ['src'], rollupTypes: true }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'cjs'],
      fileName: 'index',
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
      ],
    },
    sourcemap: true,
    // Don't minify library code — consumers will minify
    minify: false,
  },
})
```

## Build Output Structure

```
dist/
├── index.js          # ESM
├── index.cjs         # CommonJS
├── index.d.ts        # TypeScript declarations
└── style.css         # Extracted CSS
```

## Library Mode Checklist

- [ ] Set `build.lib.entry` to your main export file
- [ ] Externalize peer dependencies
- [ ] Generate TypeScript declarations (vite-plugin-dts)
- [ ] Configure `package.json` exports map
- [ ] Set `sideEffects` for CSS files
- [ ] Consider disabling minification (`minify: false`)
- [ ] Enable sourcemaps (`sourcemap: true`)
- [ ] Test both ESM and CJS consumers
- [ ] Verify tree-shaking works (multiple entry points help)
